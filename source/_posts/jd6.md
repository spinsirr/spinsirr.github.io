---
title: JavaScript Day 6 - Type Conversion and Coersion
tags: []
categories:
  - JavaScript
date: 2024-01-25 02:37:08
---

### String to Number

In java script, when we add a number to a string. We are actually concatenating the ```string``` version of number to the string.

```JavaScript
const birthYear = '1991';
console.log(birthYear + 18);
// -> 199118
```

We can use ```Number()``` to converte string into numbers

```JavaScript
const birthYear = '1991';
console.log(Number(inputYear) + 18);
// -> 2009
```

#### Note: ```Number()``` won't change the original type of the value

If we converte a string that is not convertable, JavaScript will return ```NaN```, which means 'Not a Number'

```JavaScript
console.log(Number("TankMan"));
// -> NaN
console.log(typeof Number("TankMan"));
// -> number
```

#### Note: NaN doesn't mean the variable is 'Not' a number, but a invalid number.

### Number to String

Similarly, we can use ```String()``` to converte a number into string

```JavaScript
console.log(String(8964));
// -> '8964'
console.log(typeof String(8964));
// -> string
```

#### Note: We cannot converte a value into ```undefined```

### Type Coersion

Most of the time, JavaScript does type coersion automatically.

```JavaScript
console.log('I am ' + 23 + ' years old');
// -> 'I am 23 years old'
```

In this case, the number 23 was automatically converte into string. It is equivalent to

```JavaScript
console.log('I am ' + String(23) + ' years old');
```

Sometimes JavaScript converte strings to numbers

```JavaScript
console.log('23' - 5 - '12');
// -> 6
console.log('5' * '2');
// -> 10
console.log('8' * '4');
// -> 2
```
