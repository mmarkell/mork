import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-monokai";

const JsonOutputForm = ({ output }: { output: string }) => {
  return (
    <div className="w-full max-w-md mx-auto my-8">
      <h1 className="text-center text-xl font-bold mb-4">Mork Output</h1>
      <AceEditor
        mode="json"
        theme="monokai"
        value={output}
        name="outputEditor"
        editorProps={{ $blockScrolling: true }}
        className="w-full h-64 text-white rounded shadow"
      />
    </div>
  );
};

export default JsonOutputForm;
