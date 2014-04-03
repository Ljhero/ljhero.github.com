---
title: GitHub Pull-Request 流程
layout: post
category:
tags:
published: true
---

在GitHub上利用 Pull Request 功能，我们能很方便的向其他项目贡献代码。在此，简要介绍下操作流程。

### 第一步：Fork 项目

在 GitHub 上Fork 目标项目。

完成之后，就能在自己账户下看到新 fork 的仓库，名称下说明了原始仓库地址。

### 第二步：Clone 

把自己账户下的远程仓库 clone 到本地机器上

{% highlight bash %}
git clone git@github.com:Ljhero/free-programming-books-zh_CN.git
cd free-programming-books-zh_CN
{% endhighlight %}

### 第三步：增加远程分支

在本地仓库中，添加指向原始仓库的远程分支。在示例中，远程分支被命名为 upstream。

{% highlight bash %}
git remote add upstream git@github.com:justjavac/free-programming-books-zh_CN.git
{% endhighlight %}

通过 upstream 就可以很方便的把本地仓库更新到最新版本，与原始仓库保持一致。

{% highlight bash %}
git fetch upstream
git merge upstream/master
{% endhighlight %}

### 第四步：创建新分支

创建一个新的分支并切换到新的分支下，在新创建的分支下进行修改。修改完成后，提交修改，
提交时添加注释简洁说明所做的更改。

{% highlight bash %}
git checkout -b linux_book
vim README.md
git -am "add two linux books"
{% endhighlight %}

### 第五步：推送到 GitHub

把新分支推送到 GitHub，在 GitHub 上 fork 的项目页面上会看到新创建的分支。

{% highlight bash %}
git push origin linux_book
{% endhighlight %}

### 第六步：Pull Request

当提交了新的分支时，GitHub 会自动给出提示是否进行`Compare & pull request`。点击按钮之后进入 pull request 页面。在新的页面上，我们可以看到与原项目相比所做的改动。填下提交说明，就可以`Send pull request`。

### 第七步：等待合并

Pull Request 发出之后，在原项目 pull request 页面会显示所提交的请求。项目管理者对你所做的提交进行检查。如果发现问题，管理者可以在 pull request 页面进行 comment。你接收到通知可以继续在本地进行修改，再进行 push，新增加的 commit 会自动显示在 pull request 页面上，不需要再对新的修改进行 pull request。没问题之后，管理者把你的提交合并到项目主分支中并关闭此次 pull request。

### 第八步：删除分支

pull request 被接受之后，你也就成功向原项目做出了贡献。现在把本地仓库跟原始仓库进行同步，就能看到自己所做的修改。

{% highlight bash %}
git checkout master
git fetch upstream
git merge upstream/master
{% endhighlight %}

新创建的分支也可以删除了，先在本地删除分支，然后把更改 push 到github 上，删除远程分支。

{% highlight bash %}
git branch -d linux_book
git push origin :linux_book
{% endhighlight %}

参考：

- [How to Collaborate On GitHub](http://net.tutsplus.com/tutorials/tools-and-tips/how-to-collaborate-on-github/)
- [Pro Git](http://git-scm.com/book/zh)
