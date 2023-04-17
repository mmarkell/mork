import React, { useState } from "react";
import { Transition } from "@headlessui/react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-monokai";

const JsonSchemaInput = ({
  jsonSchema,
  setJsonSchema,
}: {
  jsonSchema: string;
  setJsonSchema: (jsonSchema: string) => void;
}) => {
  const [invalid, setInvalid] = useState(false);
  const handleChange = (newValue) => {
    setJsonSchema(newValue);

    try {
      JSON.parse(newValue);
      setInvalid(false);
    } catch (e) {
      setInvalid(true);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-8">
      <h1 className="text-center text-xl font-bold mb-4">JSON Schema Input</h1>
      <AceEditor
        mode="json"
        theme="monokai"
        onChange={handleChange}
        value={jsonSchema}
        name="jsonSchemaEditor"
        editorProps={{ $blockScrolling: true }}
        className="w-full h-64 text-white rounded shadow"
      />
      <Transition
        show={invalid}
        enter="transition-opacity duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="mt-2 text-red-600">Invalid JSON</div>
      </Transition>
    </div>
  );
};

export default JsonSchemaInput;
