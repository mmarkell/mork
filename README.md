# mork

Sometimes you have data and need to do something with it, but you don't know what that something is yet. When in doubt, mork it.

## What's a mork?

Using LLMs, we can determine how to take your data from its input type (can be an arbitrary structure) and turn it into whatever schema you ask, either automatically or using custom instructions.

Examples:

.env file

```.env
OPEN_AI_API_KEY=...
```

```typescript
import { mork } from "mork";

const inputData = {
  name: "John",
  age: 30,
  address: "123 Main St, Anytown, NY, 12345",
};

const outputSchema = {
  name: "string",
  age: "number",
  address: {
    street: "string",
    city: "string",
    state: "string",
    zip: "string",
  },
};

const outputData = await mork(inputData, {
  jsonSchema: outputSchema,
  save: {
    path: "split_address.js", // saves the generated code that was used to generate the output
  },
});

console.log(outputData);
// {
//   name: "John",
//   age: 30,
//   address: {
//     street: "123 Main St",
//     city: "Anytown",
//     state: "CA",
//     zip: "12345",
//   },
// }
```

## Or do some math

```typescript
const primes = await Promise.all(
  [1, 2, 3, 4, 5].map((num) =>
    mork(num, {
      instructions: "return the nth prime number given the input n",
      save: {
        path: require("path").join(__dirname, "primes.js"),
      },
    })
  )
);
// [2, 3, 5, 7, 11]
```

## Custom engines

The base morker uses GPT-4 to generate instructions, but you can use any engine you want. Just pass it in as the `engine` option.

```typescript
import { mork } from "mork";
import { myEngine } from "./myEngine";

const inputData = {
  name: "John",
  age: 30,
  address: "123 Main St, Anytown, NY, 12345",
};

const outputSchema = {
  name: "string",
  age: "number",
  address: {
    street: "string",
    city: "string",
    state: "string",
    zip: "string",
  },
};

const outputData = await mork(inputData, {
  instructions: "split out address into street, city, state, zip",
  engine: {
    prompt: (input): myEngine.infer(input)
  },
  jsonSchema: outputSchema
});
```
