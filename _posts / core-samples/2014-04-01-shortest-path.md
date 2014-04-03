---
title: 最短路径算法小结 
layout: post
category: 算法设计 
tags: [Algorithm]
published:  true
---

### Floyd—Warshall 算法

Floyd-Warshall 算法是一种基于动态规划的算法，利用此算法可以求得图中任意两点间的最短路径。
无负环图中的点记为 $\lbrace{1, 2,...,n}\rbrace$，$dist(i,j,k)$ 表示 $i$ 到 $j$ 最短路径长度，路径经过的点只能是 $\lbrace{1,2,...,k}\rbrace$ 集合中的。

>如何从 k-1个点扩展到 k 个点？

k 个点中，从 i 到 j 的最短路径只有两种可能，经过 k 点或不经过。如果经过 k 点，则以 k 为中间点，$dist(i,j,k$）可以表示为 $dist(i,k,k-1)$ 和 $dist(k,j,j-1)$ 的和值，如下图所示。

那么 dist(i,j,k)的值就为两条路径中值最小的一个。
$$min\lbrace{dist(i,k,k-1)+dist(k,j,k-1), dist(i,j,k-1)}\rbrace$$

算法伪代码表示如下，算法复杂度$O(|V|^3)$

```
for i=1 to n:
     for j=1 to n:
          dist(i,j,0) = INF
for all (i,j) in E:
     dist(i,j,0) = l(i,j)

for k=1 to n:
     for i=1 to n:
          for j=1 to n:
               dist(i,j,k) = min{dist(i,k,k-1)+dist(k,j,k-1), dist(i,j,k-1)}
```

> Written by [ljhero](http://ljhero.info) with [StackEdit](https://stackedit.io/).