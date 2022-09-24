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

function validFile(jsonFile) {
    // [ header, body ]
    if (!Array.isArray(jsonFile) || jsonFile.length !== 2) return false;
    // header = { "?xml": [...], ":@": {...} }
    const header = jsonFile[0];
    if (
        !isPlainObject(header) ||
        !Array.isArray(header["?xml"]) ||
        !isPlainObject(header[":@"])
    ) {
        return false;
    }
    // body = { "xournal": [...], ":@": {...} }
    const body = jsonFile[1];
    if (!isPlainObject(body)) return false;
    // body[":@"] = { "@_creator": string, ...}
    if (
        !isPlainObject(body[":@"]) ||
        !isString(body[":@"]["@_creator"]) ||
        !body[":@"]["@_creator"].startsWith("Xournal")
    ) {
        return false;
    }
    /* body["xournal"] = [
        {title: ...},
        {preview: ...},
        {page: [...], ":@": {...}},
        {page: [...], ":@": {...}},
        ...
    ] */
    if (!Array.isArray(body["xournal"]) || body["xournal"].length < 3) {
        return false;
    }
    if (
        !body["xournal"][0].title ||
        !body["xournal"][1].preview ||
        !body["xournal"][2].page ||
        !Array.isArray(body["xournal"][2].page)
    ) {
        return false;
    }
    // if valid file.
    return true;
}

export { validFormat, validFile };
