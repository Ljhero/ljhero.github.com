---
layout: default
published: false
---
Javascript虽然称不上一种严格意义上的面向对象语言，例如没有像PHP，C++那样提供`class`关键字。但在Javascript中所有的东西都是一个对象，除了一些内置的原语（如`null`和`undefined`），这样的特性使其能很方便的进行面向对象的开发，同样也使其面向对象的实现方式具有多样性。

## 对象的创建

1. 简单的对象创建

使用Object，创建Object的实例，然后向其中添加内容。Object是Javascript中所有对象的基类。

    var newObject = new Object(); //创建实例
    newObject.firstName = "frank"; //添加firstName属性
    //添加sayName方法
    newObject.sayName = function() {
      alert(this.firstName);
    }

