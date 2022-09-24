import isPlainObject from "lodash.isplainobject";
import isString from "lodash.isstring";

function validFormat(data) {
    // data = { output: string, files: fileObj[] }
    if (!isPlainObject(data)) return false;
    if (!isString(data.output) || !Array.isArray(data.files)) {
        return false;
    }
    // need at least 2 files to merge
    if (data.files.length < 2) return false;
    // files = [ fileObj, ...]
    for (let i = 0; i < data.files.length; i++) {
        // fileObj = { filename: string, file: string  }
        const fileObj = data.files[i];
        if (!isPlainObject(fileObj)) return false;
        if (!isString(fileObj.filename) || fileObj.filename === "")
            return false;
        // fileObj.file is a base64 encoded file that needs to start with this header.
        if (
            !isString(fileObj.file) ||
            !fileObj.file.startsWith("data:application/x-xopp;base64,")
        ) {
            return false;
        }
    }
    // if valid format.
    return true;
}

export default validFormat;
