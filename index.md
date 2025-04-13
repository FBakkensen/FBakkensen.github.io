---
layout: default
title: Let's Nerd Out on Business Central!!
---

BC Nerd: Your essential guide to the technical core of Business Central. We focus strictly on the development and technical aspects – AL coding, integration strategies, performance optimization, and the inner workings of Microsoft Dynamics 365 Business Central. Find practical insights and solutions here.

## Latest Posts
<ul class="post-list">
  {% for post in site.posts %}
    <li>
      <h3>
        <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      </h3>
      <span>{{ post.date | date: "%B %d, %Y" }}</span>
      <p>{{ post.excerpt }}</p>
    </li>
  {% endfor %}
</ul>