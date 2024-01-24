---
title: JavaScript Day 5 - Strings
tags: []
categories:
  - JavaScript
date: 2024-01-23 19:17:56
---

### String concatenate

In JavaScript, we can use ```+``` to concatenate strings just like other languages.

```JavaScript
const hi = 'Hi';
const firstName = 'Spencer'
const spencer = hi + ', I am '+ firstName
console.log(spencer);
// -> Hi, I am Spencer
```

Also, we can use backtick ```(`)``` to create template strings to avoid mistakes while concatenating strings such as missing space.

```JavaScript
const spencerNew = `${hi}, I'm ${firstName}`;
```

In fact, you can always use backtick to represent a string.

```JavaScript
console.log(`Hi, I'm spencer`);
```

### Multiline strings

To create multiline strings. Insert  ```\n```, It works like ```Enter```.

```JavaScript
const aString = "2952 Earth,\nGalaxy,\nUniverse,\n00003";
console.log(aString);

//->
/**
 * 2952 Earth,
 * Galaxy,
 * Universe,
 * 00003
 * /
```

Or you can use template strings.

```JavaScript
const aString = 
`2952 Earth,
Galaxy,
Universe,
00003`;
console.log(aString);

//->
/**
 * 2952 Earth,
 * Galaxy,
 * Universe,
 * 00003
 * /
```
