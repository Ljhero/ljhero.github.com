---
title: 《程序员的自我修养--链接、装载与库》
layout: post
category : Notes
tags : [系统, 读书笔记]
published: true
---


从编译，链接到运行，程序员应该了解自己所写的代码最终是怎么成为程序，又怎样在计算机上运行起来的。另不得不对作者能在硕士期间就能写出此书感到佩服。精读此书需要花些功夫，当然肯定能从中收获很多。我对此书也只是泛读，主要是想了解编译，链接及程序在内存中运行整个实现原理。本篇笔记主要记录自己在读此书过程中一些概念上有误解或不清晰的地方。

## 编译和链接

IDE一般将编译和链接的过程一步完成，通常将这种编译和链接合并到一起的过程称为构建（Build） 

![][img01]

### 预编译（Prepressing）

处理源代码中以”#“开头的预编译指令

* 删除”#define“ 展开所有宏定义
* 处理条件预编译指令，比如“#if”“#ifdef”等
* 处理“#include”，包含头文件
* 删除所有注释
* 添加行号和文件名标识，便于编译器产生调试用的行号信息
* 保留所有#pragma编译器指令

### 编译（Compilation）

把预处理文件进行一系列词法分析、语法分析、语义分析及优化后产生相应的汇编代码文件

### 汇编（Assembly）

汇编器将汇编代码转变成机器可以执行的指令。

### 链接（Linking）

组装模块，过程主要包括地址和空间分配，符号决议和重定位。对引用地址进行重定位指向实际地址
    
### extern "C"

C++代码在进行编译时会对变量和函数符号进行修饰，修饰规则与C语言不同，C++为了与C兼容，有一个用来声明或定义一个C的符号的”extern  "C"“ 关键字

![][img02]

头文件声明了一些C语言编写的函数或全局变量，为了让这个头文件能正常被C++与C语言代码包含，可以使用C++的宏”__cplusplus“，c++编译器会在编译C++程序时默认定义这个宏，通过使用条件宏可以判断当前编译的是不是C++代码

![][img03]

## 静态链接库

一个静态库可以简单地看成一组目标文件的集合，即很多目标文件经过压缩打包后形成的一个文件。linux下使用“ar"压缩程序将目标文件压缩到一起，并且对其进行编号和索引，以便于查找和检索。（与自己对静态库的理解有差错，不是简单的函数代码集合。这也是方便于程序在对静态库进行链接时，只包含所使用到得函数代码，而不是静态库中的全部函数代码）

## 进程的建立

1. 创建虚拟地址空间，并不是创建实际的物理空间，而是创建映射函数所需要的相应的数据结构。页映射函数将虚拟空间的各个页映射至相应的物理空间。

2. 读取可执行文件头，并且建立空间与可执行文件的映射关系。这一步所做的是虚拟空间与可执行文件的映射关系。当对所需的页进行装载时，易定位到其在可执行文件中的位置。

3. 将CPU指令寄存器设置成可执行文件入口，启动运行。

上面步骤执行完以后，其实可执行文件的真正指令和数据都没有被装载入到内存中。操作系统是通过捕获程序运行时产生的页错误，通过先前建立的映射关系计算出相应的页面在可执行文件中的偏移，然后在物理内存中分配一个物理页面，将其载入再将进程中该虚拟页与分配的物理页之间建立映射关系。进程从刚产生页错误的位置重新开始执行。

![][img04]

## 系统调用，Win32 API，C运行库

**C标准运行库** 是C语言程序与不同程序之间的抽象层，将不同的操作系统API抽象成相同的库函数。但现在各个操作系统提供的C运行库包含了更多的功能如线程相关函数。

* Linux下的C运行库是Glibc，它是完全支持POSIX标准，除了实现C标准库之外，还提供对linux系统调用的封装函数（例如read，write，头文件unistd.h）
* windows下的C运行库是MSVCRT  实现了C标准库之外还实现了线程相关操作函数。

**系统调用** 是应用程序（运行库也是应用程序的一部分）与操作系统内核之间的接口，它决定了应用程序时如何与内核打交道的。无论程序是直接进行系统调用，还是通过运行库，最终还是会达到系统调用这个层面上。

Linux的系统调用的C语言形式被定义在 unistd.h中，应用程序可以绕过C标准库的相关函数如fopen，而直接使用open来实现文件的读取。

**Windows API** （Win32是使用最广泛也是最成熟的版本）是Windows操作系统提供给应用程序开发者的最底层、最直接与Windows打交道的接口。CRT是建立在Windows API之上的。MFC是对API一种C++形式的封装库。头文件"Windows.h"包含了Windows API的核心部分。

![][img05]

[img01]:http://pic.yupoo.com/ljhero/CjLBIYR3/EzotR.png
[img02]:http://pic.yupoo.com/ljhero/CjLBJ3cc/XEa4W.png
[img03]:http://pic.yupoo.com/ljhero/CjLBJ4oB/WXvzo.png
[img04]:http://pic.yupoo.com/ljhero/CjLBJ6al/36ryq.png
[img05]:http://pic.yupoo.com/ljhero/CjLBJ7LV/AB1Wx.png