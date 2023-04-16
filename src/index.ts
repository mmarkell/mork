require("dotenv").config();
import { Static, TSchema } from "@sinclair/typebox";
import Ajv from "ajv";
import fs from "fs";
import { Engine } from "./engine/AbstractEngine";
import OpenAiClient from "./engine/OpenAiClient";
const ajv = new Ajv({
  allErrors: true,
}); // options can be passed, e.g. {allErrors: true}

type MorkOptions<SchemaType extends TSchema> = {
  instructions?: string;
  jsonSchema?: SchemaType;
  asserts?: ((input: any, output: Static<SchemaType>) => boolean)[];
  save?: {
    path: string;
  };
  engine?: Engine;
  retries?: number;
};

export function mork<T extends TSchema = TSchema>(
  options: MorkOptions<T>
): (input: any) => Promise<Static<T>> {
  return async (input: any) => {
    const { instructions, jsonSchema, save, engine, retries, asserts } =
      options;
    const previousInputs: any[] = [];
    const validateAndReturn = (
      output: T,
      save?: {
        path: string;
        code: string;
      }
    ) => {
      // if we should, save the code to the path
      const savePath = () => {
        if (save?.path) {
          console.log({ save });
          require("fs").writeFileSync(save!.path, save!.code);
        }
      };

      if (!jsonSchema) {
        savePath();
        return output as any;
      }

      const validate = ajv.compile(jsonSchema);

      const isValid = validate(output);
      if (isValid) {
        savePath();
        previousInputs.push(input);
        return output as Static<T>;
      } else {
        throw new Error(
          `Output did not match JSON schema: ${JSON.stringify(validate.errors)}`
        );
      }
    };

    const evaluate = (code: string, input: any) => {
      const output = eval(code)(input);
      if (asserts) {
        for (const assert of asserts) {
          try {
            const successful = assert(input, output);
            if (!successful) {
              throw new Error(`input ${input} and output ${output}`);
            }
          } catch (e) {
            throw new Error(
              `The code you generated did not pass the assertion: ${e}`
            );
          }
        }
      }
      return output;
    };

    const shouldExport = Boolean(save?.path);
    // If the file already exists, then try to use it
    if (shouldExport) {
      const exists = fs.existsSync(save!.path);
      if (exists) {
        const code = fs.readFileSync(save!.path, "utf8");
        try {
          const output = evaluate(code, input);
          return validateAndReturn(output, {
            path: save!.path,
            code,
          });
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
          Previous Inputs: <data>
          Input type: <type>
          Instructions: <instructions>
          Output Schema?: <schema>
  
          Given an input, write a javascript arrow function that takes in the input data format,
          does some transformation to the input, and returns some data. 

          You will also be given previous inputs to the function. All previous inputs
          MUST also be valid inputs to the function you generate.
          
          If instructions are not provided, try to infer reasonable instructions given the schema.
  
          If an output schema is provided, then respond with data that 
          strictly matches the schema. If an output schema is provided, be as strict as possible
          in adhering to and populating all the relevant fields.
          
          If no output schema is provided, respond with the same type as the input.
  
          Only respond with runnable javascript code and no newlines or special characters, like this:
  
          (input) => doSomething(input)
          
          Ok, here is the input!
          ______________________
  
          Input Data: ${JSON.stringify(input)}
          Input type: ${typeof input}
          Previous Inputs: ${JSON.stringify(previousInputs)}
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

      try {
        // try on previous inputs just to make sure it works
        for (const previousInput of previousInputs) {
          try {
            evaluate(code, previousInput);
          } catch (e) {
            throw new Error(
              `The code you generated did not work on previous input: ${JSON.stringify(
                previousInput
              )}`
            );
          }
        }

        const output = evaluate(code, input);
        if (shouldExport) {
          return validateAndReturn(output, {
            path: save!.path,
            code,
          });
        } else {
          return validateAndReturn(output);
        }
      } catch (e) {
        console.error(e);
        errorPrompt = JSON.stringify(e);
        attempt++;
        if (attempt > (retries && retries > 0 ? retries : 5)) {
          throw e;
        }
        continue;
      }
    }
  };
}
