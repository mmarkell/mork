require("dotenv").config();
import fs from "fs";
import { Engine } from "./engine/AbstractEngine";
import OpenAiClient from "./engine/OpenAiClient";

type MorkOptions<SchemaType> = {
  instructions?: string;
  jsonSchema?: SchemaType;
  save?: {
    path: string;
  };
  engine?: Engine;
};

export async function mork<T = undefined, I = any>(
  input: I,
  options?: MorkOptions<T>
): Promise<T extends undefined ? I : T> {
  if (!options) {
    return input as T extends undefined ? I : T;
  }

  const { instructions, jsonSchema, save, engine } = options;

  const shouldExport = Boolean(save?.path);
  // If the file already exists, then try to use it
  if (shouldExport) {
    const exists = fs.existsSync(save!.path);
    if (exists) {
      const code = fs.readFileSync(save!.path, "utf8");
      try {
        const output = eval(code)(input);
        return output as T extends undefined ? I : T;
      } catch (e) {
        console.error("failed reading cached code from disk", e);
      }
    }
  }

  // Otherwise, generate the code
  let attempt = 1;
  while (true) {
    let errorPrompt: string = "";
    let code: string = "";
    let prompt = `
        You will be given input in the following format:
        Input Data: <data>
        Input type: <type>
        Instructions: <instructions>
        Output Schema?: <schema>

        Given an input, write a javascript arrow function that takes in the input data format,
        does some transformation to the input, and returns some data. 
        
        If instructions are not provided, try to infer reasonable instructions given the schema.

        If an output schema is provided, then respond with data that 
        strictly matches the schema. If an output schema is provided, be as strict as possible
        in adhering to and populating all the relevant fields.
        
        If no output schema is provided, respond with the same type as the input.

        Only respond with runnable javascript code and no newlines or special characters, like this:

        (input) => doSomething(input)
        
        Input Data: ${JSON.stringify(input)}
        Input type: ${typeof input}
        Instructions:
          ${instructions}
          ${
            errorPrompt
              ? "The last attempt failed with the following error: " +
                errorPrompt
              : ""
          }
          ${
            errorPrompt
              ? "This was the code that led to the error: " + code
              : ""
          }
          ${errorPrompt ? "Try again, but make sure the code works." : ""}

        ${jsonSchema ? "Output Schema: " + JSON.stringify(jsonSchema) : ""}
    `;

    // TODO make this more abstract
    code = engine
      ? await engine.prompt(prompt)
      : await OpenAiClient.prompt(prompt);

    console.log({ code });
    try {
      const output = eval(code)(input);
      if (shouldExport) {
        require("fs").writeFileSync(save!.path, code);
      }

      return output as T extends undefined ? I : T;
    } catch (e) {
      console.error(e);
      errorPrompt = JSON.stringify(e);
      attempt++;
      if (attempt > 5) {
        throw e;
      }
      continue;
    }
  }
}
