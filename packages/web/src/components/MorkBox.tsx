import React, { useEffect, useState } from "react";
import { mork } from "@mork/core";
export const MorkBox = () => {
  const [instructions, setInstructions] = useState("");
  const [jsonSchema, setJsonSchema] = useState("");
  const [inputData, setInputData] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [output, setOutput] = useState("");

  const morkRef = React.useRef<ReturnType<typeof mork>>(null);
  useEffect(() => {
    let schema;
    try {
      schema = JSON.parse(jsonSchema);
    } catch (e) {
      schema = undefined;
    }
    morkRef.current = mork({
      instructions,
      jsonSchema: schema,
    });
  }, [instructions, jsonSchema]);
  const handleRunClick = () => {
    morkRef.current(inputData).then((result) => {
      setOutput(result as unknown as any);
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-md mx-auto mt-10">
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
      <div className="mb-4">
        <label className="block mb-2 text-sm font-semibold">JSON Schema:</label>
        <input
          className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          value={jsonSchema}
          onChange={(e) => setJsonSchema(e.target.value)}
        />
      </div>
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
      <div>
        <label className="block mb-2 text-sm font-semibold">Output:</label>
        <textarea
          className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          readOnly
          value={output}
        />
      </div>
    </div>
  );
};
