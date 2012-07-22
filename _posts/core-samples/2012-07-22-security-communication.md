---
title: C#实现网络传输数据加密
layout: post
category : Program
tags : [C#, 密码算法]
published: true
---
## 1. 分组密码

分组密码是将明文消息编码表示后数字序列划分成长为n的分组，各组分别在密钥的作用下进行变换输出等长的数字序列，即密文。一次加密一个数据组，加解密所使用的是同一密钥，故其通常也称为对称加密。分组长n各种不同的对称加密算法取值不同（DES和TripleDES为64位，AES默认为128位，也可以为192位和256位），在对明文消息进行分组时如果最后个分组小于n，则要进行数据填充，使分组长达到n才能进行后续的加密处理。.net平台提供的加密类都很好的处理了上述问题，所以在用C#语言进行实际编码能很简便的完成加解密操作。

Rijndael算法作为AES的一种，以经取代TripleDES（三重DES）成为新的数据加密标准。其分组长度及密钥长度都可变，且比DES算法都要长，使其也具有了更高的安全性。本文的示例程序采用的就是Rijndael算法。

## 2. 运行模式

分组密码在加密时，明文分组的长度是固定，而实用的待加密消息的数据量是不定的，相邻的两个分组加解密时是否相关，就产生了不同的运行模式。下面主要介绍两种常用的[分组密码运行模式](http://bit.ly/NKH3sY)

### 1. ECB模式

ECB模式是最简单的运行模式，各个分组使用相同的密钥进行加密，如图1所示。
<p style="text-align:center;">
![ECB模式][pic1]
<br />
图1. ECB模式示意图
</p>
当密钥取定时，对明文的每一个分组，都有一个唯一的密文与之对应。这也造就了ECB模式的最大特性，同一明文分组在消息中重复出现的话，产生的密文分组也相同。故ECB用于长消息时可能不够安全，如果消息有固定结构，攻击者可能找出这种关系。但因为在ECB模式中，各分组加解密相互独立，所以很方便进行并行计算，提高大型数据加解密的运行效率。

### 2. CBC模式

为了解决ECB模式的安全缺陷，可以让重复的明文分组产生不同的密文分组，CBC模式就可满足这一要求。如图2所示，在CBC模式中，一次对一个明文分组加密，每次加密使用同一密钥，加密算法的输入是当前明文分组和前一次密文分组的异或，因此加密算法的输入不会显示出于这次的明文之间的固定关系，所以重复的明文分组不会再密文中暴露出这种重复关系。
<p style="text-align:center;">
![CBC模式][pic2]
<br />
图2 CBC模式示意图
</p>
在产生第一个密文分组时，需要有一个IV与第一个明文分组异或。解密时，IV和解密算法对第一个密文分组的输出进行异或以恢复第一个明文分组。IV和密钥一样对于收发双方都是已知的，为了使安全性最高，IV应像密钥一样被保护。

在.NET平台提供的分组加密类默认使用的是CBC模式，但是可以根据需要更改此默认设置。

[pic1]:http://upload.wikimedia.org/wikipedia/commons/c/c4/Ecb_encryption.png
[pic2]:http://upload.wikimedia.org/wikipedia/commons/6/66/Cbc_decryption.png
## 3. 数据加解密

在实现数据加解密主要涉及到`System.Security.Cryptography`下的`RijndaelManaged`和`CryptoStream`类。前面提到.NET平台的分组加密类默认使用的是CBC模式，所以首先要生成密钥Key和IV。在生成`RijndaelManaged`实例时默认会生成一组长度为16字节随机的Key和IV，在本示例中为了省去通信双方的密钥交换过程，直接指定了Key和IV，加解密都相同。具体看代码，看注释。

### 数据加密

    //创建RijndaelManaged实例
    RijndaelManaged RMCrypto = new RijndaelManaged();
    //byte[] key = RMCrypto.Key;
    //byte[] IV = RMCrypto.IV;
    //初始化Key，IV
    byte[] Key = { 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16 };
    byte[] IV = { 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16 };

    Console.WriteLine("connecte successed! Enter the message to send:");
    string sMessage = Console.ReadLine();
    //把明文消息转换成UTF8编码的字节流，避免乱码
    byte[] messageByte = Encoding.UTF8.GetBytes(sMessage);
    //实例化一个MemoryStream用于存放加密后的数据流
    MemoryStream mStream = new MemoryStream();
    //创建用于加密的CryptoStream实例
    CryptoStream CryptStream = new CryptoStream(mStream,
    RMCrypto.CreateEncryptor(Key, IV),
    CryptoStreamMode.Write);
    //把明文消息字节流写入到CryptoStream中，进行加密处理
    CryptStream.Write(messageByte,0,messageByte.Length);
    //把CryptoStream中的数据更新到MemoryStream中
    CryptStream.FlushFinalBlock();
    //把加密后的数据流转换成字节流
    byte[] encryptoByte = mStream.ToArray();

### 数据解密

    //创建一个MemoryStream实例，存放收到的加密数据字节流
    MemoryStream encryptoStream = new MemoryStream(encryptoByte);
    //创建RijndaelManaged实例
    RijndaelManaged RMCrypto = new RijndaelManaged();
    //byte[] key = RMCrypto.Key;
    //byte[] IV = RMCrypto.IV;
    //初始化Key，IV
    byte[] Key = { 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16 };
    byte[] IV = { 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16 };


    //创建用于解密的CryptoStream实例
    CryptoStream CryptStream = new CryptoStream(encryptoStream,
       RMCrypto.CreateDecryptor(Key, IV),
       CryptoStreamMode.Read);

    //创建StreamReader实例，从CryptoStream中读出数据，
    //StreamReader默认使用UTF8编码读出的数据
    StreamReader SReader = new StreamReader(CryptStream);
    
    //输出解密后的消息.
    Console.WriteLine("The decrypted original message: {0}",SReader.ReadToEnd());

## 4. 数据传输

数据传输使用的是TCP连接，.net平台也对Socket进行了很好的封装，使网络IO操作非常方便。在密文数据发送被编码成[Base64](http://zh.wikipedia.org/wiki/Base64)形式的字符串，一个是方便加密数据的正常显示，另一方面是便于数据接收端在接受字节流的数据时便于转码成字符串。Base64是用64个可打印的ASCII码字符来表示二进制数据，所以Base64字符串与字节流的转换是一对一的转换，即一个字符对应一个字节，这样在进行字节流与字符串间的转换时不会因编码方式的不同出现偏差，造成后续的解密操作出现异常。

### 客户端

    //创建TCP连接
    TcpClient TCP = new TcpClient("localhost", 11000);

    //从TCP连接中获得网络数据流 
    NetworkStream NetStream = TCP.GetStream();
    
    //便于显示，将加密后的数据字节流转成Base64编码的字符串
    string encryptBase64 = Convert.ToBase64String(encryptoByte);
    //将字符串转成字节流
    encryptoByte = Encoding.ASCII.GetBytes(encryptBase64);
    
    //把加密后的数据写入到NetworkStream中，发送到服务端。
    NetStream.Write(encryptoByte, 0, encryptoByte.Length);
    Console.WriteLine("The encryptoed message: {0}", encryptBase64);
    Console.WriteLine("The message was sent.");


### 服务端

    //初始化TCPListen绑定IP地址和监听端口
    TcpListener TCPListen = new TcpListener(IPAddress.Any, 11000);

    //开始监听
    TCPListen.Start();

    //每隔五秒钟，检查是否有连接
    while (!TCPListen.Pending())
    {
        Console.WriteLine("Still listening. Will try in 5 seconds.");
        Thread.Sleep(5000);
    }

    //接受TCP连接.
    TcpClient TCP = TCPListen.AcceptTcpClient();

    //为此链接创建NetworkStream.
    NetworkStream NetStream = TCP.GetStream();

    //循环从NetworkStream中读出数据
    string encryptoString = "";
    int bytes;
    while (true)
    {
        byte[] byteMessage = new byte[10];
        bytes = NetStream.Read(byteMessage, 0, 10);
        if (bytes <= 0)
        {
            break;
        }
        //加密后的数据是通过Base64编码成字符串后发送，可直接通过ASCII编码将字节转成ASCII码字符
        //组装成完整的Bas64编码的字符串
        encryptoString += Encoding.ASCII.GetString(byteMessage,0,bytes);
    }
    Console.WriteLine("The Encryptoed Message: {0}", encryptoString);
    //把Base64编码的字符串转换成字节流
    byte[] encryptoByte = Convert.FromBase64String(encryptoString);

因CryptoStream类使用的派生自Stream的类进行初始化，所以在本示例程序中可以直接使用NetworStream替代MemoryStream创建CryptoStream示例。示例程序见[MSDN-加密数据][1]。示例程序使用MemoryStream是便于获得加密后的数据。

示例程序源代码：[下载][2]

### 参考文章

* [MSDN-加密数据][1]
* [MSDN-解密数据](http://msdn.microsoft.com/zh-cn/library/te15te69)
* [MSDN-RijndaelManaged 类](http://msdn.microsoft.com/zh-cn/library/system.security.cryptography.rijndaelmanaged)
* [对称加密DES和TripleDES](http://www.cnblogs.com/chnking/archive/2007/08/14/855600.html)

[1]:http://msdn.microsoft.com/zh-cn/library/as0w18af