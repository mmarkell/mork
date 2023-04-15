// src/sum.spec.ts
import fs from "fs";
import { mork } from "../src/index";

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
      jsonSchema: {
        type: "number",
      },
    });
    const output = await identityMork(3);
    expect(output).toEqual(3);
  });
  it("can write the mork to a file", async () => {
    const file = require("path").join(__dirname, "mork_output.js");
    const identityMork = mork({
      instructions: "Respond with the exact value passed in",
      save: {
        path: file,
      },
    });

    const output = await identityMork(3);
    expect(output).toEqual(3);
    const code = fs.readFileSync(file, "utf8");
    expect(eval(code)(3)).toEqual(3);
    fs.rmSync(file);
  });

  it("can do more complex things", async () => {
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
      save: {
        path: require("path").join(__dirname, "primes.js"),
      },
    });

    const primes = await Promise.all([1, 2, 3, 4, 5].map(primeMork));
    expect(primes).toEqual([2, 3, 5, 7, 11]);
  });

  it("can write conway's game of life", async () => {
    const gameOfLifeMork = mork({
      instructions:
        "write a function that takes a conway's game of life board and returns the next board",
      save: {
        path: require("path").join(__dirname, "game_of_life.js"),
      },
    });

    expect(
      await gameOfLifeMork(
        `
            ........
            ....*...
            ...**...
            ........
      `
      )
    ).toEqual(`
            ........
            ...**...
            ...**...
            ........
      `);

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
