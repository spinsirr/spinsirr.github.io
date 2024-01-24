---
title: JavaScript Day 4 - Values and Variables
tags: []
categories:
  - JavaScript
date: 2024-01-23 16:08:42
---

### define a Variable

In JavaScript we use ```let``` keyword to define a variable

e.g.

```JavaScript
let myName = 'Shawn'
let year = 1989
let change = 0.64
```

#### Note: It is fobidden to define a variable whose name start with numbers

e.g.

```JavaScript
let 10Seconds = 10
// DON'T DO THIS !!!
```

In fact, VSCode will highlight the code if you actually did this.

![Highlight](../images/jd4/1.png)

 And while running the code, the browser will throw an ```SytaxError``` exception

![Sytax error](../images/jd4/2.png)
![Alt text](image.png)