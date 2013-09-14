---
title: 一次网络程序Debug过程
layout: post
category : 程序设计
tags : [C#, 编程实践]
published: true
---
## 起因

最近在用C#实现一个安全通信软件，基本思想是发送方在发送数据时先对数据进行加密再发送，同样接收方从网络上收到数据后先对数据进行解密再把解密后的数据递交到上层应用。
实现方式是通过封装TCPCLient类的一些方法，向外提供封装好的安全SOCKET，自动完成数据的加解密。上层应用只需调用安全SOCKET进行原始数据的发送与接收并不用关心底层数据的加解密，使用方式与使用系统原始的SOCKET一样。

{% highlight csharp %}
    public int Send(byte[] data)
    {
        try
        {
            int len = 0;
            byte[] full = null;
            if (IsEncrypt)
            {
                DataFormat sendData = new DataFormat();
                sendData.SendData = data;
               
                //用己方私钥签名数据
                sendData.SignData = Sign.SignData(data);
                //组装原始数据与签名数据
                string encryptString = Convert.ToBase64String(sendData.SendData) + 
                                       ClassUtility.Separator + 
                                       Convert.ToBase64String(sendData.SignData);
                //加密发送数据
                full = SCrypto.Encrypt(Encoding.ASCII.GetBytes(encryptString));

               
            }
            else
            {
                //加密发送数据
                full = SCrypto.Encrypt(data);
            }
            // 发送数据
            len = full.Length;
            len = SendSource(full);
            return len;
        }
        catch (System.Exception ex)
        {
            ClassLog.WriteErrLog(ex);
            return -1;
        }
    }
    public byte[] Receive()
    {
        byte[] data = null;
        try
        {
            byte[] receive = ReceiveSource();
            if (IsEncrypt)
            {
                //解密数据
                string decryptString = Encoding.ASCII.GetString(SCrypto.Decrypt(receive));

                //分拆原始数据与签名
                string[] DataArray = ClassUtility.splitByString(decryptString);
                DataFormat sendData = new DataFormat();

                sendData.SendData = Convert.FromBase64String(DataArray[0]);
                sendData.SignData = Convert.FromBase64String(DataArray[1]);
                //用发送方公钥验证签名
                if (PubSign.VerifyData(sendData.SendData, sendData.SignData))
                {
                    data = sendData.SendData;
                }
            }
            else
            {
                //解密数据
                data = SCrypto.Decrypt(receive);
            }
            
        }
        catch (System.Exception ex)
        {
            ClassLog.WriteErrLog(ex);
        }

        return data;
    }
{% endhighlight %}	

## 错误

错误出现在当把通信双方程序放在局域网内不同机器上运行，传递超过1M大小的文件时，程序在对接收到数据进行反序列化时抛出异常“在分析完成之前就遇到流结尾。”，但是传递几k大小的文件又不会出现错误，如果都在同一机器上传送文件也不会出错。因为上层程序发送的数据是把自定义的消息类进行二进制序列化成byte数组，接收方收到数据后会进行相应的反序列操作把数据转化成相应的消息类，所以此处错误会出现在对数据进行反序列的地方。

## 排错

开始，以为是序列化代码写的有问题，不过细想下传递小文件和同一机器上测试都未出现错误，基本排除了这种可能。接着对发送的数据与接收的数据进行比对，发现收到的数据长度小于发送的数据，这也肯定了不是序列化代码的问题，反序列化的就不是一个完整的数据，才导致反序列化时出现异常。

引起错误的可疑之处也缩小到了解密数据前的ReceiveSource函数，该函数的作用是从连接的缓冲区中读取原始的数据。函数要达到的预期效果是能把一次交互过程中发送方发送的数据都能接收到，所以实现的代码也是循环判断缓冲区中是否有数据，有就读出来。

{% highlight csharp %}
        public byte[] ReceiveSource()
        {
            int len = 0;
            int offset = 0;
            byte[] receive = new byte[BufferSize];
            int availableSize = BufferSize;
            NetworkStream NetStream = Client.GetStream();
            
            do 
            {
                
                len = NetStream.Read(receive, offset, availableSize);
                offset += len;
                availableSize -= len;
               
            } while (NetStream.DataAvailable && availableSize > 0);

              
            if (availableSize > 0)
            {
                byte[] ReceiveData = new byte[offset];
                Array.Copy(receive, ReceiveData, offset);
                receive = ReceiveData;
            }
            return receive;
        }
{% endhighlight %}	

通过调试，发现了这个函数并没有达到预期的效果，当发送的数据量很大时，有时没有返回完整的数据。之后通过wireshark抓到了发送过来的数据包，也确定了数据确实是完整发送过来了只是程序没有读取出来，再分析代码确认函数在循环读取数据时考虑不周全，如果发送的数据量很大，网络上实际需要多个TCP数据包进行发送，这样数据包通过网络到达接收端时前后肯定会有一定的延迟，所以数据到达接收方缓冲区也有一定的时间差，在循环读取时有可能刚好已经读了一些数据但下一个数据包的数据还未到达，此时缓冲区也没有新的数据也就退出了循环，造成了接收方收到的数据不全。

## 修改

既然问题是接收方有可能接收不到完整的数据，易想到的解决办法就是发送数据之前就先通知接收方将要发送的数据长度，接收方首先收到要接收的数据长度值，再循环从缓存区读取数据，直到接收到指定长度的数据才返回。

{% highlight csharp %}
        public int SendSource(byte[] data)
        {
            NetworkStream NetStream = Client.GetStream();
            //发送数据长度
            byte[] dataLength = new byte[32];
            System.BitConverter.GetBytes(data.Length).CopyTo(dataLength,0);
            NetStream.Write(dataLength, 0, dataLength.Length);

            NetStream.Write(data, 0, data.Length);
            return data.Length;
        }
        public byte[] ReceiveSource()
        {
            int len = 0;
            int offset = 0;
            int dataLength = 0;
            byte[] lenBytes = new byte[32];
            byte[] receive = null;
            NetworkStream NetStream = Client.GetStream();

            //接收数据长度
            len = NetStream.Read(lenBytes, 0, 32);
            dataLength = BitConverter.ToInt32(lenBytes, 0);
            receive = new byte[dataLength];

            while (offset < dataLength)
            {
                len = NetStream.Read(receive, offset, dataLength-offset);
                offset += len;
            }
            
             return receive;
          }        
{% endhighlight %}	
