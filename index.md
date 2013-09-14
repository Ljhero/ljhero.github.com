---
layout: default
title: Ljhero Blog
---
{% include JB/setup %}
<h1>The Latest Post </h1>
<ul class="posts">
  {% for post in site.posts %}
    <li><span>{{ post.date | date_to_utc | date: '%Y-%m-%d' }}</span> &raquo; <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a>
	</li>
  {% endfor %}
</ul>


