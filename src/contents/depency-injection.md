---
author: Felix Wieland
datetime: 2022-12-13T20:18:00Z
title: Dependency injection in Typescript
slug: dependency-injection-typescript
featured: true
draft: false
tags:
  - development
  - typescript
ogImage: ""
description: Taking a look at dependency injection and the decorator pattern in Typescript.
---

On my journey throught the depths of Typescript and its frameworks I sometimes stumbeled upon a technique that is common in more traditional languages like Java and C# (and has even found its way into Go with the superb Fx library), but not often used in JavaScript: Metadata Reflection.

While the theory behind it always seemed quite intimidating in other languages (mostyl because I'm not as fluent in them), I was intrigued to explore it in JS because of its relaxed typing system. So I decided to learn some of the basics by implementing my very own small scale dependency injection library! And I will take you with me 🙃

## Getting started

First we want to create a new project with npm, install our dependencies and initialize Typescript in it.

```bash
npm i typescript reflect-metadata && npx tsc --init
```

`npm i typescript` and `npx typescript --init` should be pretty straightforward: installing Typescript and creating a sample `tsconfig.json` file. we will take a look at what `reflect-metadata` does in a second, but first we want to finish setting up Typescript. I don't really like the bloated sample, so we are going to replace the content with the following:

```json
//tsconfig.json
{
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "lib": ["DOM", "ES5", "ScriptHost", "ES2015.Collection"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "downlevelIterator": true,
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "experimentalDecoratorMetadata": true,
    "moduleResolution": "node",
    "skipLibCheck": true
  }
}
```

Most of it is self explanatory, our source code will be in `./src` and the build output will be in `./dist`. The two interesting settings are the two experimentals: `experimentalDecorators` and `experimantalDecoratorMetadata`.
