// test/mork.test.ts
import { mork } from "../src/index";
import { Type } from "@sinclair/typebox";

describe("mork it", () => {
  it("can take instructions to write the identity mork", async () => {
    const identityMork = mork({
      instructions: "Respond with the exact value passed in",
    });
    const output = await identityMork(3);
    expect(output).toEqual(3);
  });
  it("can take a json schema to write the identity mork", async () => {
    const identityMork = mork({
      instructions: "Respond with the exact value passed in",
      jsonSchema: Type.Number(),
    });
    const output = await identityMork(3);
    expect(output).toEqual(3);
  });

  it("can do more complex things", async () => {
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

    expect(outputData.address.city).toEqual("Anytown");
    expect(outputData.address.state).toEqual("NY");
    expect(outputData.address.zip).toEqual("12345");
    expect(outputData.address.street).toEqual("123 Main St");
  });

  it("can do more complex things without instructions", async () => {
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
      jsonSchema: outputSchema,
    });

    const outputData = await addressMork(inputData);

    expect(outputData.address.city).toEqual("Anytown");
    expect(outputData.address.state).toEqual("NY");
    expect(outputData.address.zip).toEqual("12345");
    expect(outputData.address.street).toEqual("123 Main St");
  });

  it("works with a custom engine", async () => {
    const ourEngine = {
      prompt: () => Promise.resolve("(mork) => mork"),
    };

    const customMork = mork({
      instructions: "do whatever you want idc",
      engine: ourEngine,
    });

    const output = await customMork(3);
    expect(output).toEqual(3);
  });

  it("can do math and stuff", async () => {
    const primeMork = mork({
      instructions: "return the nth prime number given the input n",
      asserts: [
        (input, output) => {
          // oracle
          const findPrime = (num: number) => {
            let i,
              primes = [2, 3],
              n = 5;
            const isPrime = (n: number) => {
              let i = 1,
                p = primes[i],
                limit = Math.ceil(Math.sqrt(n));
              while (p <= limit) {
                if (n % p === 0) {
                  return false;
                }
                i += 1;
                p = primes[i];
              }
              return true;
            };
            for (i = 2; i <= num; i += 1) {
              while (!isPrime(n)) {
                n += 2;
              }
              primes.push(n);
              n += 2;
            }
            return primes[num - 1];
          };
          if (output !== findPrime(input)) {
            throw new Error(`input ${input} should be ${findPrime(input)}`);
          }
          return true;
        },
      ],
    });

    const primes = await Promise.all([1, 2, 3, 4, 5].map(primeMork));
    expect(primes).toEqual([2, 3, 5, 7, 11]);
  });

  it("can write conway's game of life", async () => {
    const gameOfLifeMork = mork({
      instructions:
        "write a function that takes a conway's game of life board and returns the next board",
    });

    expect(
      await gameOfLifeMork(`........|....*....|.....*....|..........`)
    ).toEqual(`..........|..........|....**....|..........`);

    expect(
      await gameOfLifeMork([
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ])
    ).toEqual([
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]);
  });
});
