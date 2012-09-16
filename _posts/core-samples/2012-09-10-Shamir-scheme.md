---
title: 基于OpenSSL简单实现Shamir基于身份的数字签名算法
layout: post
category : Program
tags : [C, 密码算法]
published: true
---

## 1. 基于身份认证协议简介

一般基于公钥密码体质的签名认证方案，像RSA都需要用户交换私钥或公钥，一般的认证过程如图1所示：

1. B要验证消息m是否是A发送的，首先要获得A的公钥![09-10-Shamir-01][img01]
2. A先计算m的摘要，再用自己的私钥对摘要进行加密生成对m的个人签名。
3. A将m和签名一起发送给B。
4. B验证A的签名，先用A的公钥进行解密，得到A对m计算所得的摘要。
5. B计算m的摘要与解密出的摘要进行比对，相同则可以确定m是A发送的。

![RSASignature][img02]
图1 基于RSA算法签名认证过程

[Shamir基于身份签名方案][1]不需要通信双方用户间交换密钥，无需保存密钥簿、无须使用第三方服务就可进行安全通信和相互验证签名。虽然该方案任然是一种类公钥密码方案，但它不是去直接生成一对随机的公钥和私钥，而是用户选择他的名字或其它个人唯一信息作为公钥，密钥中心以用户提交的个人身份信息生成用户的私钥。用户与其它用户通信就只需知道对方的名字就行了。用户A给用户B发送一个消息m时，用自己的私钥对m签名。B收到消息m时用A的名字作为密钥对签名进行验证。

Shamir方案是其密钥参数的产生与RSA算法一样，安全性都是依赖于大数分解问题。具体方案如下：

**参数生成**：n是两个大素数的乘积，e是一个满足![][img03]的整数，d是满足![][img05]的整数，h是一个单向Hash函数。系统的密钥中心的秘密密钥是d，公开的系统参数是(n,e,h)，系统中所有用户都知道此公开参数且都一样。

**用户密钥生成**：假设i表示用户A的惟一可识别的身份。密钥中心将为其生成私钥如下：
    
![][img04]

**签名生成**：对消息m，用户A随机选择一个数r，计算：
	
![][img06]

A对消息m的签名为(t, s)

**签名验证**：接收方收到发送的消息m和签名(t,s)，通过下式来验证签名是否是身份为i即用户A对m的签名：
 
![][img07]

**验证式证明过程**：

![][img08]

其中最后一步的推导是依据[Euler定理](http://en.wikipedia.org/wiki/Euler_theorem)

## 2. 利用OpenSSL密码算法库实现

从对Shamir方案的分析过程可知，其中最主要的操作就是对大数的操作包括乘法，幂运算及模运算。好在OpenSSL提供了一些列大数操作函数，所以此方案实现也不是很困难。其中用到的大数操作函数介绍可以[查看此页面](http://linux.die.net/man/3/bn_mod_exp)，更详细的介绍可以查看赵春平老师对于OpenSSL的介绍文档[Openssl编程][2]。

<pre class="prettyprint lang-c">
// Shamir基于身份认证
int ShamirTest(){
	BIGNUM	*p,*q;//两个大素数
	BIGNUM	*n; //n = p*q
	BIGNUM	*g;//与用户身份对应的秘密密钥
	BIGNUM	*r;//随机选择数
	BIGNUM	*t,*s;//签名 t = r^e mod n
	BIGNUM	*e;//大素数
	BIGNUM	*d;
	BIGNUM	*i;//用户身份
	BIGNUM	*f;
	BIGNUM	*exp,*left,*right,*tmp;
	BN_CTX	*ctx;
	BN_GENCB	*cb = NULL;
	char u[30],*buf = NULL;
	char *sANDt = NULL;
	char m[20];//消息
	char fHash[1024]= {0};//摘要信息f(t,m)
	int ret,len,bitsp,bitsq,bits=512;
	FILE *fp;


	ctx = BN_CTX_new();
	BN_CTX_start(ctx);
	exp = BN_CTX_get(ctx);
	tmp = BN_CTX_get(ctx);
	left = BN_CTX_get(ctx);
	right = BN_CTX_get(ctx);
	bitsp = (bits+1)/2;
	bitsq = bits-bitsp;

	//生成n，e
	e = BN_new();
	p = BN_new();
	q = BN_new();
	n = BN_new();
	ret = BN_hex2bn(&e,"1L");

	for (;;)
	{
		if(!BN_generate_prime_ex(p, bitsp, 0, NULL, NULL, cb))
			printf("Error -- p\n");
		if (!BN_sub(tmp,p,BN_value_one())) 
			printf("Error -- p-1\n");
		if (!BN_gcd(left,right,e,ctx)) 
			printf("Error -- gcd(p-1,e)\n");
		if (BN_is_one(left)) break;
	}
	for (;;)
	{
		if(!BN_generate_prime_ex(q, bitsq, 0, NULL, NULL, cb))
			printf("Error -- q\n");
		if (!BN_sub(tmp,q,BN_value_one())) 
			printf("Error -- q-1\n");
		if (!BN_gcd(left,right,e,ctx)) 
			printf("Error -- gcd(q-1,e)\n");
		if (BN_is_one(left)) break;
	}
	if (!BN_mul(n,p,q,ctx))
		printf("Error -- n\n");

	BN_sub_word(p,1);//p=p-1
	BN_sub_word(q,1);//q=q-1;
	ret = BN_mul(exp,p,q,ctx);
	d = BN_new();
	if (!BN_mod_inverse(d,e,exp,ctx)) 
		printf("Error -- d\n");

	//设置用户身份i和秘密密钥g
	i = BN_new();
	strcpy(u,"23");
	ret = BN_hex2bn(&i,u);
	g = BN_new();
	ret = BN_mod_exp(g,i,d,n,ctx);
	BN_mod_mul(tmp,d,e,left,ctx);
	//设置随机数r
	r = BN_new();
	ret = BN_rand(r,512,0,0);

	//计算t
	t = BN_new();
	ret = BN_mod_exp(t,r,e,n,ctx);

	//计算f(t,m)
	strcpy(m,"hello");
	len = sizeof(m)+BN_num_bytes(t)+10;
	sANDt = malloc(len);
	memset(sANDt,0,len);
	BN_bn2bin(t,sANDt);
	strcat(sANDt,m);
	CreateHash(fHash,&ret,sANDt,len,HASH_MD5);
	f = BN_new();
	BN_bin2bn(fHash,ret,f);
	//计算s
	ret = BN_mod_exp(exp,r,f,n,ctx);
	s = BN_new();
	ret = BN_mod_mul(s,g,exp,n,ctx);
	//接收方进行验证

	ret = BN_mod_exp(exp,t,f,n,ctx);
	ret = BN_mod_mul(right,i,exp,n,ctx);

	ret = BN_mod_exp(left,s,e,n,ctx);
	printf("cmp: %d\n", BN_cmp(left,right));


	free(sANDt);
	BN_free(left);
	BN_free(right); 
	BN_free(tmp);
	BN_free(exp);
	BN_free(f);
	BN_free(i);
	BN_free(e);
	BN_free(t);
	BN_free(s);
	BN_free(r);
	BN_free(d);
	BN_free(g); 
	BN_free(n); 
	BN_free(p);
	BN_free(q);  
	BN_CTX_free(ctx); 
	return 0;
}
</pre>

因为Shamir方案参数参数与RSA算法一样，所以可以利用Openssl中RSA相关函数更方便的生成参数n，e和d。

	rsa = RSA_generate_key(bits,RSA_3,NULL,NULL);
	d = BN_new();
	n = BN_new();
	e = BN_new();
	BN_copy(d,rsa->d);
	BN_copy(n,rsa->n);
	BN_copy(e,rsa->e);

本文示例程序完整代码：[下载][3]

## 参考资料

* [IDENTITY-BASED  CRYPTOSYSTEMS  AND  SIGNATURE  SCHEMES][1]
* [《安全协议理论与实践》](http://book.douban.com/subject/5502860/)
* [《现代密码学》](http://book.douban.com/subject/2057795/)
* [Openssl编程][2]

[1]:http://www.springerlink.com/content/6a7k794f4eprhah3/fulltext.pdf?MUD=MP
[2]:http://pan.baidu.com/share/link?shareid=30835&uk=84790286
[3]:http://files.cnblogs.com/ljhero/ShamirScheme.rar
[img01]:http://pic.yupoo.com/ljhero/CfWqMUzk/93bDv.png
[img02]:http://pic.yupoo.com/ljhero/CfWuQRfD/yokIw.png
[img03]:http://pic.yupoo.com/ljhero/CfWqMXq5/TQwaV.png
[img04]:http://pic.yupoo.com/ljhero/CfWqMYlo/ozlL3.png
[img05]:http://pic.yupoo.com/ljhero/CfWtlflz/PvtLv.png
[img06]:http://pic.yupoo.com/ljhero/CfWqMZ9y/XpP4o.png
[img07]:http://pic.yupoo.com/ljhero/CfWqMZYD/gOblC.png
[img08]:http://pic.yupoo.com/ljhero/CfWtlhUj/eLsWo.png