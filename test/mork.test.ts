// src/sum.spec.ts
import fs from "fs";
import { mork } from "../src/index";

describe("mork it", () => {
  it("returns the identity mork", async () => {
    expect(await mork(1 + 2)).toEqual(3);
  });
  it("can take instructions to write the identity mork", async () => {
    const output = await mork(1 + 2, {
      instructions: "Respond with the exact value passed in",
    });
    expect(output).toEqual(3);
  });
  it("can take a json schema to write the identity mork", async () => {
    const output = await mork(1 + 2, {
      instructions: "Respond with the exact value passed in",
      jsonSchema: {
        type: "number",
      },
    });
    expect(output).toEqual(3);
  });
  it("can write the mork to a file", async () => {
    const file = require("path").join(__dirname, "mork_output.js");
    const output = await mork(1 + 2, {
      instructions: "Respond with the exact value passed in",
      save: {
        path: file,
      },
    });
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

    const outputData = await mork(inputData, {
      instructions: "split out address into street, city, state, and zip",
      jsonSchema: outputSchema,
    });

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

    const outputData = await mork<typeof outputSchema>(inputData, {
      jsonSchema: outputSchema,
    });

    expect(outputData.address.city).toEqual("Anytown");
    expect(outputData.address.state).toEqual("NY");
    expect(outputData.address.zip).toEqual("12345");
    expect(outputData.address.street).toEqual("123 Main St");
  });

  it("works with a custom engine", async () => {
    const ourEngine = {
      prompt: () => Promise.resolve("(mork) => mork"),
    };

    const output = await mork(1 + 2, {
      instructions: "do whatever you want idc",
      engine: ourEngine,
    });

    expect(output).toEqual(3);
  });

  it("can do math and stuff", async () => {
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
    expect(primes).toEqual([2, 3, 5, 7, 11]);
  });
});
