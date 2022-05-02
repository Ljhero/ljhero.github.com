---
title: 使用 Hugo 和 GitHub Pages 搭建个人博客
date: 2022-05-02T08:37:34.000Z
draft: false
date updated: 2022-05-02 18:12
---

本文记录使用 [Hugo](https://gohugo.io/) 和 [GitHub Pages](https://pages.github.com/)搭建个人博客过程 。

## 安装 Hugo

[Hugo](https://gohugo.io/) 是 Go 语言开发且开源的静态站点生成工具。
参考官方的 [Quick Start](https://gohugo.io/getting-started/quick-start/)教程进行安装和使用。

```shell
brew install hugo
# 查看安装后的版本
❯ hugo version
hugo v0.98.0+extended darwin/arm64 BuildDate=unknown
```

## 新建博客代码目录

```shell
hugo new site ljhero -f yml
# 初始化
git init
```

## 配置主题

下载安装 [PaperMod](https://github.com/adityatelange/hugo-PaperMod) 主题，通过 git submodule 的形式添加到 themes 目录。

```shell
git submodule add --depth=1 \ 
    https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
git submodule update --init --recursive
# update theme
git submodule update --remote --merge
```

修改 `config.yml` 添加主题配置

```yml
paginate: 5
theme: PaperMod
```

## 设置 GitHub Pages

参考 [GitHub Pages](https://pages.github.com/) 教程，创建公开的同名 repo，并关联到本地通过 Hugo 创建的博客目录。

参考 Hugo 官方的 [Host on GitHub](https://gohugo.io/hosting-and-deployment/hosting-on-github/) 教程，通过 GitHub Action 构建生产静态 HTML 文件并发布到 `gh-pages` 分支。

1. 创建 Github Actions workflow 文件 `.github/workflows/gh-pages.yml` ，当有 push 操作时，自动构建并把生成的静态文件推送到 `gh-pages` 分支。

```yml
name: Build GH-Pages

on:
  push:
    paths-ignore:
      - "images/**"
      - "LICENSE"
      - "README.md"
    branches:
      - master  # Set a branch to deploy
  workflow_dispatch:
    # manual run
    inputs:
      hugoVersion:
        description: "Hugo Version"
        required: false
        default: "0.98.0"

jobs:
  deploy:
    runs-on: ubuntu-20.04
    steps:
      - name: Git checkout
        uses: actions/checkout@v2
        
      - name: Get Theme
        run: git submodule update --init --recursive
        
      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: "${{ github.event.inputs.hugoVersion }}"

      - name: Build
        run: hugo --gc --verbose --minify

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
```

2. 修改 `config.yml`  设置 `baseURL` 为 GitHub Pages 关联的子域名

```yml
baseURL: https://ljhero.github.io
```

3. push 代码后，前往 Github 上博客 repo 的设置页面，将 GitHub Pages 关联的 branch 修改为 `gh-pages`。

## 参考资料

- Hugo [Quick Start](https://gohugo.io/getting-started/quick-start/)
- Hugo [Host on GitHub](https://gohugo.io/hosting-and-deployment/hosting-on-github/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
