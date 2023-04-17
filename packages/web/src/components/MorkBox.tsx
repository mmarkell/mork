import React, { useEffect, useState } from "react";
import { initMork } from "@mork/core";
import dynamic from "next/dynamic";

const JsonOutputForm = dynamic(() => import("./JsonOutputForm"), {
  ssr: false,
});

const JsonSchemaInput = dynamic(() => import("./JsonSchemaForm"), {
  ssr: false,
});

type Mork = ReturnType<ReturnType<typeof initMork>["mork"]>;

export const MorkBox = () => {
  const [apiKey, setApiKey] = useState("");
  const [instructions, setInstructions] = useState("");
  const [jsonSchema, setJsonSchema] = useState("");
  const [inputData, setInputData] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [output, setOutput] = useState("");
  const getCode = React.useRef<() => string>();
  const morkRef = React.useRef<Mork>(null);
  useEffect(() => {
    if (!apiKey) {
      return;
    }
    try {
      const { mork, code } = initMork({ openAiApiKey: apiKey });
      let schema: any;
      try {
        schema = JSON.parse(jsonSchema);
      } catch (e) {
        schema = undefined;
      }
      morkRef.current = mork({
        instructions,
        jsonSchema: schema,
      });
      getCode.current = code;
    } catch (e) {
      console.error(e);
    }
  }, [instructions, jsonSchema, apiKey]);
  const handleRunClick = () => {
    morkRef.current(inputData).then((result) => {
      setOutput(JSON.stringify(result as unknown as any));
      setGeneratedCode(getCode.current());
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-md mx-auto mt-10">
      <div className="mb-4">
        <label className="block mb-2 text-sm font-semibold">
          OpenAI API Key:
        </label>
        <input
          className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-semibold">
          Instructions:
        </label>
        <input
          className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
      </div>
      <JsonSchemaInput setJsonSchema={setJsonSchema} jsonSchema={jsonSchema} />
      <div className="mb-4">
        <label className="block mb-2 text-sm font-semibold">Input Data:</label>
        <input
          className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
        />
      </div>
      <button
        className="w-full mb-4 py-2 bg-blue-500 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={handleRunClick}
      >
        Run
      </button>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-semibold">
          Generated Code:
        </label>
        <textarea
          className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          readOnly
          value={generatedCode}
        />
      </div>
      <JsonOutputForm output={output} />
    </div>
  );
};
