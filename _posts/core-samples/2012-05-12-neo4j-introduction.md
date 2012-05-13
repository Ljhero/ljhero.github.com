---
title: Neo4j介绍与使用
layout: post
category : 数据库
tags : [Neo4j, 图形数据库]
---
{% include JB/setup %}

## Neo4j简介

[Neo4j][neo4j]是一个高性能的,NOSQL图形数据库，它将结构化数据存储在网络上而不是表中。Neo4j也可以被看作是一个高性能的图引擎，该引擎具有成熟数据库的所有特性。程序员工作在一个面向对象的、灵活的网络结构下而不是严格、静态的表中——但是他们可以享受到具备完全的事务特性、企业级的数据库的所有好处。

Neo4j因其嵌入式、高性能、轻量级等优势，越来越受到关注。

  [neo4j]: http://neo4j.org/

## 图形数据结构

  在一个图中包含两种基本的数据类型：Nodes（节点） 和 Relationships（关系）。Nodes 和 Relationships 包含key/value形式的属性。Nodes通过Relationships所定义的关系相连起来，形成关系型网络结构。

  ![网络结构图][pic1]

## Neo4j安装

Neo4j可以被安装成一个独立运行的服务端程序，客户端程序通过REST API进行访问。也可以嵌入式安装，即安装为编程语言的第三方类库，目前只支持java和python语言。

因Neo4j是用java语言开发的，所以确保将要安装的机器上已安装了jre或者jdk

### 安装为服务

此种安装方式简单，各平台安装过程基本一样

1.    从[http://neo4j.org/download](http://neo4j.org/download)上下载最新的版本，根据安装的平台选择适当的版本。
2.    解压安装包，解压后运行终端，进入解压后文件夹中的bin文件夹。
3.    在终端中运行命令完成安装
> Linux/MacOS系统   `neo4j install`  
>  Windows系统          `Neo4j.bat install`
4.  在终端中运行命令开启服务
> Linux/MacOS系统   `service neo4j-service start`  
>  Windows系统          `Neo4j.bat start`

通过`stop`命令可以关闭服务，`status`命令查看运行状态

### 支持python嵌入式安装

**第一步：安装Jpype**

从[http://sourceforge.net/projects/jpype/files/JPype/](http://sourceforge.net/projects/jpype/files/JPype/) 下载最新版本，windows有exe格式的直接安装程序，linux平台要下载源码包，解压后运行`sudo  python  setup.py  install `完成安装

**第二步：安装 neo4j-embedded**

如果安装了python的包管理工具 pip 或者 easy_install 可直接运行
	Pip install neo4j-embedded  
	easy_install neo4j-embedded
也可以从[http://pypi.python.org/pypi/neo4j-embedded/](http://pypi.python.org/pypi/neo4j-embedded/)下载相应的安装包完成安装。

## Neo4j使用实例 

有如下所示的用户关注关系所形成的关系网络 

![关系网络图][pic2]

现在利用图形数据库进行数据的储存，并获得user1 的粉丝，并为user4 推荐好友

示例代码：
	#!/usr/bin/env python
	# -*- coding: utf-8 -*-
	#
	# Neo4j图形数据库示例
	# 
	from neo4j import GraphDatabase, INCOMING
	 
	# 创建或连接数据库
	db = GraphDatabase('neodb')
	# 在一个事务内完成写或读操作
	with db.transaction:
	    #创建用户组节点
	    users = db.node()
	    # 连接到参考节点，方便查找
	    db.reference_node.USERS(users)
	 
	    # 为用户组建立索引，便于快速查找
	    user_idx = db.node.indexes.create('users')

	#创建用户节点
	def create_user(name):
	    with db.transaction:
	        user = db.node(name=name)
	        user.INSTANCE_OF(users)
	        #  建立基于用户name的索引
	        user_idx['name'][name] = user
	    return user

	 #根据用户名获得用户节点
	def get_user(name):
	    return user_idx['name'][name].single

	#建立节点
	for name in ['user1', 'user2','user3','user4']:
	   create_user(name)
	 
	#为节点间添加关注关系（FOLLOWS）
	with db.transaction:
	    get_user('user2').FOLLOWS(get_user('user1'))
	    get_user('user3').FOLLOWS(get_user('user1'))
	    get_user('user4').FOLLOWS(get_user('user3'))

	# 获得用户1的粉丝
	for relationship in get_user('user1').FOLLOWS.incoming:
	    u = relationship.start
	    print u['name']
	#输出结果：user2，user3

	#为用户4推荐好友，即该用户关注的用户所关注的用户
	nid = get_user('user4').id
	#设置查询语句
	query = "START n=node({id}) MATCH n-[:FOLLOWS]->m-[:FOLLOWS]->fof RETURN n,m,fof"
	 
	for row in db.query(query,id=nid):
	    node = row['fof']
	    print node['name'] 
	#输出结果：user1

[pic1]: http://bit.ly/KzJOhl
[pic2]: http://bit.ly/KzJFdI 