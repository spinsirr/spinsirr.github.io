---
title: JavaScript Day 4 - Values and Variables
tags: []
categories:
  - JavaScript
date: 2024-01-23 16:08:42
---

### Define a variable

In JavaScript we use ```let``` keyword to define a variable

e.g.

```JavaScript
let myName = 'Shawn';
let year = 1989;
let change = 0.64;
```

#### Note: It is fobidden to define a variable whose name start with numbers

e.g.

```JavaScript
let 10Seconds = 10;
// DON'T DO THIS !!!
```

In fact, VSCode will highlight the code if you actually did this.

![Highlight](../images/jd4/1.png)

 And while running the code, the browser will throw an ```SytaxError``` exception

![Sytax error](../images/jd4/2.png)

Also, you cannot include symbols in you variable names except ```_``` and ```$```.

```JavaScript
let $bankAccount = -10;
let _me = 'broken';
```

For constant numbers like ```$\pi$``` you can use full uppercase names

e.g.

```JavaScript
let PI = 3.14159;
```

There are many reserved keyword like ```function``` and ```new```. You cannot use these as your variable names as well.

#### Note: If your program throws an SyntaxError. Check if you are violating those naming rules

### Data Types

A value is either an ```object``` or ```primitive value```. There are 7 premitive data types

```JavaScript
let age = 64; // Number, include integers and float point numbers
let myName = 'Max'; // String
let attandance = true; // Boolean

let childre; // Undefined

null // empty value
symbol // Value that is unique and cannot be changed
bigint // Larger integers than the number type can hold
```

In JavaScript, you don't have to manually define the value type for the variable

### Change data types

JavaScript can automatically change the type of the variable, this is called ```Dynamic Typing``` which indicate that it's actually the values hold data type instead of variables

```JavaScript
let foo = 'Hello';
console.log(typeof foo); // -> string

foo = 23;
console.log(typeof foo); // -> number
```

### Three different ways of declaring variables

---

```let``` to define a variable that holds a changing value while the program executing. Which means you can reassign a value to the variable or mutate the variable

```JavaScript
let age = 64;
age = 89;
```

We can also declare undefined variables

```JavaScript
let age;
```

---

```const``` declare a variable that cannot be mutate or inmutable variable. When using const we need a initial value.

```JavaScript
const birth = 1989
birth = 1992 // illegal operation
```

It is recommended to always use ```const``` instead of ```let```

---

```var``` works pretty much the same as ```let``` but we are not using it nowadays.

```JavaScript
var job = 'students' // Never use it !!!
job = 'developer'
```
