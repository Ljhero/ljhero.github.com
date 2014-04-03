---
title: 面向对象的Javascript
layout: post
category : web开发
tags : [Javascript, 面向对象]
published: true
---
Javascript虽然称不上一种严格意义上的面向对象语言，例如没有像PHP，C++那样提供`class`关键字。但在Javascript中所有的东西都是一个对象，除了一些内置的原语（如`null`和`undefined`），这样的特性使其能很方便的进行面向对象的开发，同样也使其面向对象的实现方式具有多样性。

## 对象的创建

### 1. 简单的对象创建

使用Object，创建Object的实例，然后向其中添加内容。Object是Javascript中所有对象的基类。

{% highlight javascript %}
    var newObject = new Object(); //创建实例
    newObject.firstName = "frank"; //添加firstName属性
    //添加sayName方法
    newObject.sayName = function() {
      alert(this.firstName);
    }
{% endhighlight %}	

在Javascript中，不必为一个对象实例创建类或模板，可以像上例所示那样直接创建对象实例，并且可以在任何时候给该对象实例添加属性和方法。

事实上，Javascript的实现只是把所有的对象当做关联数组。然后给数组加上了一个面具，使它的语法看起来更像Java或C++，使用点分隔表示方法。但实际上任然可以用获取数组元素的方式取得对象中的元素。

{% highlight javascript %}
    var name = newObject["firstName"];
    newObject["sayName"]();
{% endhighlight %}	

这个简单的东西可以算是很多强大功能的基础。比如，依据某种逻辑调用某个对象的方法：

{% highlight javascript %}
    function sayLoudly(){
    	alert(this.firstName.toUpperCase());
    }

    newObject.sayLoudly = sayLoudly;
    
    var whatVolume = 2;
    var whatFunction;
    if (whatVolume == 1) {
    	whatFunction = "sayName";
    }else if (whatVolume == 2) {
    	whatFunction = "sayLoudly";
    };
    
    newObject[whatFunction](); 
{% endhighlight %}	

根据`whatVolume`的值可以调用对象中不同的方法，在上述代码中对象`sayLoudly`方法的添加，体现了向一个对象添加函数的时候，可以使用已存在的函数。`sayLoudly`函数中`this`所指向的对象将会在运行时动态计算，不同对象调用时其所指向也就不同。这种运行时绑定也是Javascript面向对象实现的一个非常强大的特性，它允许代码的共享，本质上来说，是一种继承的形式。

### 2. 使用JSON创建对象

因Javascript里的对象实质是关联数组，所以使得使用JSON创建对象的方法可行。

{% highlight javascript %}
    var newObject = {
    	firstName = "Ljhero",
    	sayName: function() {
	          alert(this.firstName);
	      },
	    sayLoudly: sayLoudly
    };
{% endhighlight %}	

使用JSON定义和定义一个数组非常相似，除了使用花括号而不是方括号，函数可以是内联的，也可以是外部函数。在JSON中，可以随意地嵌套对象定义来创建对象的层级关系。例如：

{% highlight javascript %}
    var newObject = {
    	firstName = "Ljhero",
    	sayName: function() {
	          alert(this.firstName);
	      },
	    sayLoudly: sayLoudly,
	    LastName: {
	    	lastname: "LJHERO",
	    	sayName: function() {alert(this.lastname);}
	    }
    };

    newObject.LastName.sayName();
{% endhighlight %}	

### 3. 使用类的定义

在Javascript中，函数也是一个对象，故可以把一个函数当做类的构造函数来提供服务。这样就可以很方便的创建类的多个实例对象。

{% highlight javascript %}
    function Person(name){
    	this.name = name;
    	this.sayName = function(){
    		alert(this.name);
    	}
    }

    var one = new Person("ljhero");
    one.sayName();

    var two = new Person("LJHERO");
    two.sayName();
{% endhighlight %}	

在定义`Person`类之后，其后创建的实例对象`one`，`two`都具有相同的属性和方法。但是由此引出的一个问题是，`Person`类的每个实例都含有`name`的一个副本和`sayName()`方法的一个副本，那么每个实例占用了更多的内存。如果所有的实例能共享`sayName()`这样相同的副本的话，就能节省些内存。随后介绍的prototype就是这样的方法。

### 4. 原型

Javascript中的每一个独立的对象都有一个与之关联的原型（prototype）属性，可以看作一个简化的继承形式。其工作方式是：当你构造一个对象的新实例时，定义在对象原型中的所有属性和方法，在运行时都会附着在那个新的实例上。

{% highlight javascript %}
    function Person(name){
    	this.name = name;
    }

    Person.prototype.sayName = function(){
    		alert(this.name);
    };

    var p = new Person("ljhero");
    p.sayName();
{% endhighlight %}	

这样无论创建多少个`Person`实例，在内存中`sayName()`函数只会有一个单独的实例。这个方法实际上是附加在每个实例上，而且this关键字也是在运行时绑定，跟方法1中sayLoudly函数相同。

### 5. 综合方法


程序员们在研究Javascript如何实现面向对象的过程中，做了很多探索，提出了新的定义Javascript类的方法，阮一峰老师在[Javascript定义类的三种方法][1]一文中总结出了三种方法：

 [1]:http://www.ruanyifeng.com/blog/2012/07/three_ways_to_define_a_javascript_class.html

* **构造函数法**

其实质就是上面提到的原型方法。

* **Object.create()法**
 
这是运用了Javascript的国际标准ECMAScript第五版（目前通行的是第三版），提出的一个新的方法Object.create()。 

{% highlight javascript %}
    var Person = {
    	name: "ljhero",
    	sayName: function(){
    		alert(this.name);
    	}
    };

    var p = Object.create(Person);
    p.sayName();
{% endhighlight %}	

* **极简主义法**

这是作者所推荐的方法，它巧妙方式实现对类的全面的模拟，封装，继承，私有属性和私有方法，实例间的数据共享都能实现。

## 方法的选择

方法1和2，都是创建单个的实例对象，也就是说如果你想创建相似的对象，就得重新编写相同的创建实例代码。如果想要创建一个类，这个类非常大，而且可能有很多复杂的实例，那么使用原型方法是最佳的选择，能带来最好的内存使用效率。当然如果想要实现完全的面向对象编程，极简主义法可以满足你的要求。
如果你的对象层级关系嵌套层次很多或你需要一个动态方式中定义一个对象，那么JSON方法将是一个好的选择。如果需要将对象序列化并且通过网络进行传输，JSON也几乎非常明显是首选。JSON方式也很方便重构一个从服务器传送来的对象。例如：

{% highlight javascript %}
    var res = '{name:"ljhero",sayName: function() {alert(this.name);}}';

    var p = eval('('+res+')');
    p.sayName();
{% endhighlight %}	

需要注意的是eval在执行JSON格式字符串时，要多加一个括号，这是因为`{}`在Javascript首先是被当做代码块执行，加括号避免出现这种错误。

### 参考文章

* [JavaScript实战](http://book.douban.com/subject/3864460/)
* [Javascript定义类的三种方法](http://www.ruanyifeng.com/blog/2012/07/three_ways_to_define_a_javascript_class.html)
* [Javascript秘密花园](http://bonsaiden.github.com/JavaScript-Garden/zh/)
