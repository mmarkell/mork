# mork

Sometimes you have data and need to do something with it, but you don't know what that something is yet. When in doubt, Mork It!<sup>TM</sup>

## What's a mork?

Using LLMs, we can determine how to take your data from its input type (can be an arbitrary structure) and turn it into whatever schema you ask, either automatically or using custom instructions.

Examples:

.env file

```.env
OPEN_AI_API_KEY=...
```

```typescript
import { mork } from "mork";
import { Type } from "@sinclair/typebox";

const inputData = {
  name: "John",
  age: 30,
  address: "123 Main St, Anytown, NY, 12345",
};

const outputSchema = Type.Object({
  name: Type.String(),
  age: Type.Number(),
  address: Type.Object({
    street: Type.String(),
    city: Type.String(),
    state: Type.String(),
    zip: Type.String(),
  }),
});

const addressMork = mork({
  instructions: "split out address into street, city, state, and zip",
  jsonSchema: outputSchema,
});

const outputData = await addressMork(inputData);
// {
//    name: "John",
//    age: 30,
//    address: {
//      street: "123 Main St",
//      city: "Anytown",
//      state: "NY",
//      zip: 12345
//    }
// }
```

## Or do some math

```typescript
const primeMork = mork({
  instructions: "return the nth prime number given the input n",
  save: {
    path: require("path").join(__dirname, "primes.js"),
  },
});

const primes = await Promise.all([1, 2, 3, 4, 5].map(primeMork));
expect(primes).toEqual([2, 3, 5, 7, 11]);
// [2, 3, 5, 7, 11]
```

## Custom engines

The base morker uses GPT-4 to generate instructions, but you can use any engine you want. Just pass it in as the `engine` option.

```typescript
const ourEngine = {
  prompt: () => Promise.resolve("(mork) => mork"),
};

const customMork = mork({
  instructions: "do whatever you want idc",
  engine: ourEngine,
});

const output = await customMork(3);
expect(output).toEqual(3);
```
