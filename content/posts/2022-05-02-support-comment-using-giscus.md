---
title: 使用 giscus 给博客添加评论功能
date: 2022-05-02T21:16:09+08:00
draft: false
english filename: 2022-05-02-support-comment-using-giscus
Tags:
  - Area/写作
  - Share
---

## Giscus 简介

[giscus](https://giscus.app/) 是由 GitHub Discussions 驱动的评论系统，全部评论数据储存在 [GitHub Discussions](https://docs.github.com/en/discussions/quickstart) 中，一篇博客关联一个 discussion。除了支持评论还支持关联 Discussion 帖子上的表情回复 (reaction) 。

## 配置 giscus

按照 [giscus 官方文档](https://giscus.app/zh-CN) 配置章节的说明，[安装 giscus app](https://github.com/apps/giscus) 并在为所使用的 GitHub 仓库[开启 Discussions](https://docs.github.com/en/discussions/quickstart) 功能。

完成映射关系和特性配置后，获得启用 giscus 的代码。

```js
<script src="https://giscus.app/client.js"
        data-repo="Ljhero/ljhero.github.com"
        data-repo-id="MDEwOlJlcG9zaXRvcnkzNDQxNjk4"
        data-category="Comments"
        data-category-id="DIC_kwDOADSEIs4CO5XI"
        data-mapping="pathname"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="top"
        data-theme="light"
        data-lang="zh-CN"
        data-loading="lazy"
        crossorigin="anonymous"
        async>
</script>
```

## 配置 Hugo

博客仓库根目录下创建 `layouts/partials/comments.html` 文件，文件中添加上一步获取到的 giscus  启用代码。

最后修改 `config.yml` 启用 comments 

```yml
params:
    comments: true
```


## 参考资料

- [giscus 官方文档](https://giscus.app/zh-CN) 
- [PaperMod 主题 Comments 设置](https://github.com/adityatelange/hugo-PaperMod/wiki/Features#comments)
- 胡涂说的文章[给博客换了套新评论系统](https://hutusi.com/articles/comment-via-giscus)