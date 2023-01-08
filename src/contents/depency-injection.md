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

On my journey through the depths of Typescript and its frameworks I sometimes stumbled upon a technique that is common in more traditional languages like Java and C# (and has even found its way into Go with the superb Fx library), but not often used in JavaScript: Metadata Reflection.

While the theory behind it always seemed quite intimidating in other languages (mostly because I'm not as fluent in them), I was intrigued to explore it in JS because of its relaxed typing system. So I decided to learn some of the basics by implementing my very own small scale dependency injection library! And I will take you with me 🙃

## Initialize the project

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

Most of it is self explanatory, our source code will be in `./src` and the build output will be in `./dist`. The two interesting settings are the two experimental ones: `experimentalDecorators` and `experimentalDecoratorMetadata`.

## Some theory

`experimentalDecorators` is just the language support for the decorator:

```typescript
@doSomething()
class Test {}
```

`experimentalDecoratorMetadata` works together with the `reflect-metadata` package we installed earlier to add metadata to classes and its functions and parameters.

As I said, most high level languages have a language for metadata reflection. This provides the code with information about types at runtime rather than during compile time, where for example variable assignments are checked for type safety. The code is able to inspect its own structure. In strongly typed languages this helps to support unknown objects[^so:ref_java], like the response from an API thats supposed to change in the future.

Reflection for JavaScript is currently a stage 3 proposal[^gh:ref_met], that why we are using `reflect-metadata`: its a shim that fills the functionality until it is accepted into the core language.

## Getting to work

Enough of the (very short) theory behind reflection and metadata and onto more practical things: one use case for reflection is dependency injection. What are we trying to build? Dependency injection consists of a container that we can use to fill the parameters in the constructor of a dependent class from a single source. So instead of for example creating a new instance of a service class every time a web controller receives a request and is instantiated, we can reuse that class and even share the instance of the service across several controllers! The end result will look and work like this:

```typescript
class BaseClass {
  print() {
    console.log("Hello Guys");
  }
}

@Inject()
class DependentClass {
  constructor(private base: BaseClass) {}

  print() {
    this.base.print();
  }
}

let resolvedClass = di<DependentClass>(DependentClass);

resolvedClass.print();
// -> Hello Guys
```

You see in the example that all we did was give the dependency resolver (the `di()` function) an entry class and yet we could still use the dependency without ever writing `let base = new BaseClass()` anywhere.
SO how does this work?

## The container

The heart of a dependency injection service is the container. In here we register all the different types and keep them in a single source of truth: instead of recreating dependencies every time we take them from the container. To implement it we use a `Map`[^js:map] as our base type and add a function to resolve dependencies.

```typescript
export class Container extends Map {
  public resolve<T>(target: Type<any>): T {
    const tokens = Reflect.getMetadata("design:paramtypes", target) || [];
    const injections = tokens.map((token: Type<any>) =>
      this.resolve<any>(token)
    );

    const classInstance = this.get(target);
    if (classInstance) {
      return classInstance;
    }

    const newClassInstance = new target(...injections);
    this.set(target, newClassInstance);

    return newClassInstance;
  }
}
```

Before we start to look at what the container does, we need to define the type that we used for the argument to the `resolve` function. Our dependency injection only targets classes and in order to make sure that we can create a new instance of the argument:

```typescript
export interface Type<T> {
  new (...args: any[]): T;
}
```

The interface limits the parameter to an object that can be constructed with the `new` keyword and takes an arbitrary amount of parameters itself.

Now we can use reflection on the target.

```typescript
const tokens = Reflect.getMetadata("design:paramtypes", target) || [];
```

Here we use the metadata that is emitted from typescript to get the types of all the parameters the target object takes in its constructor. Reflection allows us to get three design keys at the moment[^web:wolk]:

- `design:type`, which gets the type of the annotated field
- `design:paramtypes`, which gets the parameters of the target class
- `design:returntype`, which shows us the return of a function

```typescript
const injections = tokens.map((token: Type<any>) => this.resolve<any>(token));

const classInstance = this.get(target);
if (classInstance) {
  return classInstance;
}

const newClassInstance = new target(...injections);
this.set(target, newClassInstance);

return newClassInstance;
```

Now we can just go over the tokens we got from the reflection and recursively make sure that their dependencies are also resolved.
If the class type that we want to build is already present, we just grab it from the map. If not we create a new instance and pass the resolved dependencies.

## Adding the decorator

Thats the hard part done! No all we need is a decorator that we can use to annotate the classes that we want our injector to be able to resolve.

```typescript
export const Inject = (): ((target: Type<any>) => void) => {
  return (target: Type<any>) => {};
};
```

This one almost seems too easy. We are not really doing anything here with the decorator, we are just using it for the metadata. So now any class that is decorated with `@Inject()` can be resolved!

## Finishing up

Now to use what we've built, we just need a little function that acts as an entry point to our project where we can pass the base class of our dependency tree.

```typescript
export const di = <T>(target: Type<any>): T => {
  const injector = new Injector();
  const entryClass = injector.resolve<T>(target);

  return entryClass;
};
```

This builds a new container and resolves the base class that we passed as an argument. Et voila, we are finished! We can use this rudimentary example as it is or we move on and create some more advanced features like scoping, property resolution and so on. I might write another post on that in the future so check back from time to time 😇

### Sources

[^so:ref_java]: [Matt Sheppard on StackOverflow](https://stackoverflow.com/a/37632)
[^gh:ref_met]: [reflect-metadata Repository](https://github.com/rbuckton/reflect-metadata)
[^js:map]: [JS Map Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
[^web:wolk]: [Wolk Software on Decorators and Reflection](http://blog.wolksoftware.com/decorators-metadata-reflection-in-typescript-from-novice-to-expert-part-4)
