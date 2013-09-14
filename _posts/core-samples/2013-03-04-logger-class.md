---
title: 支持多线程的日志记录类实现
layout: post
category : 程序设计
tags : [C#, 编程实践]
published: true
---
## 概述

主要设计思想是通过一个共享队列，多个输入端能同时非阻塞式的向队列中增加记录信息，输出端能自动及时的把队列中的记录信息输出到控制台或是保存到文件及数据库中。多个输入端互相隔离，采用多线程实现，但考虑到缓存日志信息的是一个共享队列，自然涉及到线程间的同步问题。本文的实现模式是采用操作系统中很经典的生产者/消费者模式。线程间的同步是通过事件信号，同时对共享队列的修改进行加锁保护，避免多个线程同时修改队列。

## 日志记录类实现

整个实现除了主要的日志记录类，还要定义同步事件类封装用于线程间同步的事件对象，定义日志信息类用于生成日志信息能存于共享队列中。

### 1. 同步事件类 SyncEvents

该类的定义与使用参照[《如何：对制造者线程和使用者线程进行同步》](http://dwz.cn/63p36)

{% highlight csharp %}
    public class SyncEvents
    {
        private EventWaitHandle _newItemEvent;      //添加新项
        private EventWaitHandle _exitThreadEvent;   //退出线程
        private WaitHandle[] _eventArray;

        public SyncEvents()
        {

            _newItemEvent = new AutoResetEvent(false);
            _exitThreadEvent = new ManualResetEvent(false);
            _eventArray = new WaitHandle[2];
            _eventArray[0] = _newItemEvent;
            _eventArray[1] = _exitThreadEvent;
        }

        public EventWaitHandle ExitThreadEvent
        {
            get { return _exitThreadEvent; }
        }
        public EventWaitHandle NewItemEvent
        {
            get { return _newItemEvent; }
        }
        public WaitHandle[] EventArray
        {
            get { return _eventArray; }
        }       
    }
{% endhighlight %}	

对新记录的添加使用 AutoResetEvent 类，输出端线程在响应此事件后，此事件能自动重置。将 ManualResetEvent 类用于通知线程退出，该事件被设置后无论是向共享队列中添加日志记录的输入端线程还是从共享队列中取日志记录的输出端线程都能响应此事件，从而正常退出。

### 2. 日志信息类

共享队列中存放的就是日志信息类的实例对象，可以根据实际需要对此类中的属性进行增加与修改，这并不影响下面将要介绍的日志记录类正常使用。

{% highlight csharp %}
    public class LogInfo
    {
        private int _ID;
        public int ID
        {
            get { return _ID; }
            set { _ID = value; }
        }

        private string _CreateTime;
        public string CreateTime
        {
            get { return _CreateTime; }
            set { _CreateTime = value; }
        }

        private string _Content;
        public string Content
        {
            get { return _Content; }
            set { _Content = value; }
        }
    }
{% endhighlight %}	

### 3. 日志记录类

类中属性与构造函数

{% highlight csharp %}
    public class Logger
    {
        private static Logger _logger;
        private static object _lock = new object();
        private static Thread _thread;
        //日志队列
        private Queue<LogInfo> _queue;
        private SyncEvents _syncEvents;

        private Logger()
        {
            _queue = new Queue<LogInfo>();
            _syncEvents = new SyncEvents();
        }
        //获取日志记录类实例
        public static Logger GetLogger()
        {
            if (_logger == null)
            {
                //加锁，防止多线程运行时，重复创建。
                lock (_lock)
                {
                    if (_logger == null)
                    {
                        _logger = new Logger();
                    }
                }
            }

            return _logger;
        }
    }
{% endhighlight %}	

为了保证共享队列唯一，此类实现采用了单例模式，实现方式是通过定义一个静态的自身logger变量，私有化默认的构造函数，提供一个得到Logger实例的GetLogger方法。这样不能通过new直接创建Logger实例，只能通过GetLogger方法获得，在该方法中就可以通过判断是否已创建了Logger实例，如果已创建则返回已有的，从而保证Logger实例的唯一。

添加日志方法

{% highlight csharp %}
        private void AddLog(Object obj)
        {
            LogInfo log = obj as LogInfo;
            if (!_syncEvents.ExitThreadEvent.WaitOne(0, false))
            {
                lock (((ICollection)_queue).SyncRoot)
                {
                    _queue.Enqueue(log);
                    _syncEvents.NewItemEvent.Set();
                    Console.WriteLine("Input thread: add {0} items", log.ID);
                }
            }
            
        }
        /// <summary>
        /// 添加日志
        /// </summary>
        /// <param name="log"></param>
        public void Add(LogInfo log)
        {
            Thread t = new Thread(AddLog);
            t.Start(log);
        }
{% endhighlight %}	

首先检查“退出线程”事件，因为 WaitOne 使用的第一个参数为零，该方法会立即返回，所以检查该事件的状态不会阻止当前线程。接着往共享队列中添加日志记录并设置“添加新项”事件，此事件设置后会让因共享队列为空而一直在等待的输出线程继续运行，处理共享队列中的新日志记录。
日志添加通过调用Add方法，启动一个新线程运行AddLog方法向共享队列中添加新日志。

日志输出方法

{% highlight csharp %}
        /// <summary>
        /// 日志保存
        /// </summary>
        private void Save()
        {
            int flag = 0;
            while (flag >=0 )
            {
                if (_queue.Count == 0)
                {
                   flag = WaitHandle.WaitAny(_syncEvents.EventArray);
                   if (flag == 1)
                   {
                       flag = -1;
                   } 
                }
                lock (((ICollection)_queue).SyncRoot)
                {
                    if (_queue.Count > 0)
                    {
                        LogInfo log = _queue.Dequeue();
                        Console.WriteLine("Output Thread: process {0} items", log.ID);
                    }

                }
            }
            
        }
        public void Run()
        {
            _thread = new Thread(Save);
            _thread.Start();
        }
{% endhighlight %}	

输出线程主要运行的就是日志保存方法，通过while循环逐个处理共享队列中的日志记录。如果队列为空，则线程暂停进入等待状态，等待“添加新项”事件或“退出线程”事件，两个事件只要有一个被设置则线程继续运行，如果是“退出线程”事件，则设置flag为-1，退出循环线程结束，因为只有在队列为空时才等待“退出线程”事件，这样保证线程退出前队列中的所有的日志记录都被处理。
在程序开始处就运行Run方法，会启动一个新线程运行Save方法，这样只要一添加日志就能自动的被处理。

线程结束方法

{% highlight csharp %}
        public void Stop()
        {
            _syncEvents.ExitThreadEvent.Set();
        }
{% endhighlight %}	

通过设置“退出线程”事件，让正在运行的输入线程和输出线程都自动结束运行。

### 4. 使用示例

{% highlight csharp %}
    class Program
    {
        static void Main(string[] args)
        {
            Logger logger = Logger.GetLogger();
            logger.Run();

            for (int i = 0; i < 100; i++)
            {

                LogInfo log = new LogInfo();
                log.ID = i;
                logger.Add(log);
                if (i == 50)
                {
                    logger.Stop();
                }
            }


            Console.ReadLine();
        }
    }
{% endhighlight %}	
