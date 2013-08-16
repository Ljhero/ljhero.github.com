---
title: Homebrew-cask Mac下的简易软件管理工具 
layout: post
category: 软件使用 
tags: [Mac]
published: true
---

Mac下安装软件，首先想到的是到App Store搜索，再点击进行下载安装。其实操作相对Window系统简化了很多，也不用太担心安装一个软件时把它推荐的软件也安装上了。

当使用过GNU/Linux系统下的软件包管理工具yum或apt-get，就感觉多点几下还是有点多余，本着**一条命令能解决的事，绝不多操作**的想法，发现了[Homebre-cask](https://github.com/phinze/homebrew-cask)，一个Mac下的命令行式软件管理程序。

Homebrew-cask是在[homebrew](http://brew.sh/index_zh-cn.html)的基础上实现了一个外部命令*brew*，使得基于*brew*命令的软件管理更加简便。

在terminal下输入如下命令就能自动安装上Evernote:
	
	brew cask install evernote

## 安装Homebrew

Homebrew是基于git和ruby，而两个软件Mac都是预装的，所以安装也就是简单的一条命令

	ruby -e "$(curl -fsSL https://raw.github.com/mxcl/homebrew/go)"

打开终端，复制并粘贴以上命令，回车运行等着安装完成。

	brew -v

查看安装的版本，同时也验证下安装是否成功，使用*help*参数查看命令说明。

## Brew-Cask

使用brew其实就能完成软件包管理，但功能还不是够强大，如给安装软件时自动创建软连接到Application目录，这样在Launchpad中也能查看到安装的软件，方便启动软件。cask就是在brew的基础上实现了更多的功能，其安装也是极其简单，打开终端并输入如下命令：

	brew tap phinze/homebrew-cask
	brew install brew-cask

## 使用

接下来以实际安装[Vagrant](http://www.vagrantup.com/)为例介绍cask的使用方法。

首先查看下软件源中是否存在待安装软件包

	~ » brew cask search vagrant 
	vagrant

安装前可以查看下软件的版本信息

	~ » brew cask info vagrant
	vagrant: 1.2.7
	http://www.vagrantup.com
	Not installed
	https://github.com/phinze/homebrew-cask/commits/master/Casks/vagrant.rb

上面也显示了软件是否安装，接下输入命令安装软件

	brew cask install vagrant

查看已安装的软件

	~ » brew cask list
	alfred	  vagrant

同时在Launchpad中也能查看到新安装的软件，因vagrant并没有GUI没有打包成APP，所以在Launchpad中没有看到vagrant的软件图标。
不过在用户的Application目录中可以看到vagrant的软件目录。

更新软件

	brew update

卸载软件，同样以vagrant为例

	brew cask uninstall vagrant

详细的使用说明，可以查看cask的[USAGE文档](https://github.com/phinze/homebrew-cask/blob/master/USAGE.md)。软件安装与管理是不一下变的很简单，使用homebrew-cask可以安装大部分软件，特别是开源软件，但还是会遇到要安装的软件search不到，这说明软件源中并没有存在此软件的cask，如果你从网下载到了软件的安装包，自己可以创建此软件的cask，然后提交到homebrew-cask项目中，也算是为开源社区做出贡献，具体怎么操作请查看[How to Contribute](https://github.com/phinze/homebrew-cask/blob/master/CONTRIBUTING.md)。

