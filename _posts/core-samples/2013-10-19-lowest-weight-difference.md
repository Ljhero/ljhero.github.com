---
title: 将数组分成两组，两组元素和的差值最小 
layout: post
category: 算法设计 
tags: [Algorithm]
published: true
---

### Problem：
You have been given a list of integer weights. You need to help Stephen distribute these weights into two sets, such that the difference between the total weight of each set is as low as possible.

Input data: A list of the weights.

Output data: A number representing the lowest possible weight difference.

Example:
checkio([10,10]) == 0  
checkio([10]) == 10  
checkio([5, 8, 13, 27, 14]) == 3  
checkio([5,5,6,5]) == 1  
checkio([12, 30, 30, 32, 42, 49]) == 9  
checkio([1, 1, 1, 3]) == 0  

From：[checkio](http://www.checkio.org/mission/task/info/loading-cargo/python-27/)

### 分析：
两部分差值最小就是说两部分的和最接近，这就可推出和值与数组中所有元素的和(SUM)的一半也是最接近的。

假设： 
sum1：第一部分的和  
sum2：第二部分的和  
SUM:  所有数的和  
sum1 <= sum2  

由SUM = sum1 + sum2 可得 SUM/2 - sum1 = sum2 - SUM/2  
故问题转换为在 sum1 <= SUM/2 的条件下，求sum1的最大值。 
也就是从数组中选出某些数，其和最接近SUM/2,这其实就是简单的01背包问题。  

背包容量是SUM/2, 每个物体的体积是数的大小，目标是尽可能装满背包 
背包问题算法：
{% highlight py %}
A[n][v]: n为物体个数，v为背包容量。
A[i][j] 表示用前i个物体装容量为j的背包能装下的最大值。
V[n-1]: n个物体的体积数组

A[0][x] = 0 for x = 0,1,2,…,v
for i = 1,2,…,n
     for j = 0,1,…,v:
          A[i][j] = max{A[i-1][j],A[i-1][j-V[i-1]]+V[i-1]}

return A[n][v]
{% endhighlight %}	

针对本问题的python求解代码：
{% highlight py %}
def checkio(data):
    #01 knapsack problem
    SUM = sum(data)
    n = len(data)
    dp = [([0 for i in range(0, SUM/2+1)]) for j in range(0, n+1)]
    for i in range(1, n+1):
        for j in range(0, SUM/2+1):
            dp[i][j] = dp[i-1][j]
            if j>=data[i-1] and dp[i-1][j-data[i-1]]+data[i-1] > dp[i][j]:
                dp[i][j] = dp[i-1][j-data[i-1]]+data[i-1]

    return SUM - 2*dp[n][SUM/2]
{% endhighlight %}	

dp[n][SUM/2]为sum1的最大值，故两者的差为  
sum2 - sum1 = (SUM-sum1)-sum1 = SUM-2\*sum1 = SUM - 2\*dp[n][SUM/2]

### 参考：
- [souldak, 将数组分成两部分使得两部分的和的差最小](http://blog.csdn.net/souldak/article/details/12354325)