---
title: Python super 使用示例 
layout: post
category: 程序设计
tags: [Python, 编程实践]
published: true
---

## 函数解释

'super'是python的内建方法，可直接使用。官方文档解释：

> super(type[, object-of-type])  
> "Return a proxy object that delegates method calls to a parent or sibling
class of type"

关键之处在于三方面:  
1. 方法返回一个新的类型对象（super类型），起的是代理作用。  
2. 新的对象中的属性都是原类型所具有的。  
3. 代理对象所具有的属性是**排除了**传入的*type*类型自身特有的属性。  

## 使用示例

### 调用父类方法

```python
class A(object):
    def __init__(self):
        print 'A'+ str(id(self))
    
    def who(self):
        print 'A'
        print 'A'+ str(id(self))

class B(A):
    def __init__(self):
        print 'B' + str(id(self))
        super(B, self).who()

if __name__ == '__main__':
    b = B()
```

输出为

```bash
B4306232080
A
A4306232080
```

在类B中成功调用了父类A中的*who*方法，*self*两次输出的id一样表明，使用super调用时传入的任然是子类的实例，体现了super本身只是起到代理作用。

### 多重继承时调用兄弟类中的方法

```python
class A(object):
    def __init__(self):
        print 'A'+ str(id(self))
    
    def who(self):
        print 'A'
        print 'A'+ str(id(self))

class B(object):
    def __init__(self):
        super(B, self).__init__()

class C(B, A):
    def __init__(self):
        print 'C' +str(id(self))
        super(C, self).__init__()
        
if __name__ == '__main__':
    c = C()
```

输出为

```bash
C4392326160
A4392326160
```

按继承的先后关系，先调用了B类中的\_\_init\_\_方法，在类B的\_\_init\_\_方法中，使用super排除了*self*也就是C类实例中继承自B的方法，此后调用的是继承自A类中\_\_init\_\_，而不是B类的父类也就*object*中的\_\_init\_\_方法。
