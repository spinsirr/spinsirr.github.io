---
title: JavaScript Day 7 - Booleans and Equality Operations
tags: []
categories:
  - JavaScript
date: 2024-01-25 03:05:26
---

### 5 Falsy values

There are 5 falsy values in JavaScript ```0, '', undefined, null, NaN```. Everything else are truthy values.

```JavaScript
console.log(Boolean(0));
console.log(Boolean(''));
console.log(Boolean(undefined));
console.log(Boolean(null));
console.log(Boolean(NaN));
// -> 5 false !!!
console.log(Boolean({}));
// -> true
```

#### Note ```{}``` is a truthy value

### Tricky problem

When we write code like this JavaScript will not tell the difference between ```undefined``` and ```0```

```JavaScript
let foo = 0;
// let foo;
if (foo) {
  console.log('0');
} else {
  console.log('undefined')
}
// -> undefined
```

### Equality operators

In JavaScript there are two ```Equality operators``` ```==``` and ```===```. We can use this to solve the previous problem by modify the code into this.

```JavaScript
let foo = 0;
// let foo; -> undefined
if (foo === 0) {
  console.log('0');
} else {
  console.log('undefined')
}
// -> 0
```

```===``` strict equality operator. it is only true when then two operands are exactly the same

```==``` is loose equality operator. it will do type coersion while comparing the operands

```JavaScript
console.log('18' == 18);
// -> true
console.log('18' === 18);
// -> false
```

The first equation is true because JavaScript automatically converte ```'18'``` to ```18```.

#### Note: It is always suggested that use ```===``` operator and do the coersion manually

### Different operator

There are also two types or ```different operator```. strict ```!=``` and loose ```!==```.

```JavaScript
let age = 23
console.log(23 != '23');
// -> false because '23' == 23
console.log(23 !== '23');
// -> true 
```
