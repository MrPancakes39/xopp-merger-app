import isPlainObject from "lodash.isplainobject";
import isString from "lodash.isstring";
import Result from "./result-type.mjs";

const formatError = (file) =>
    Result("error", {
        reason: "The data is not in a valid format.",
        ...(file ? file : {}),
    });

function validFormat(data) {
    // data = { output: string, files: fileObj[] }
    if (!isPlainObject(data)) return formatError();
    if (!isString(data.output) || !Array.isArray(data.files)) {
        return formatError();
    }
    // need at least 2 files to merge
    if (data.files.length < 2)
        return formatError({
            more_info: `FileList has less than 2 files.`,
        });
    // files = [ fileObj, ...]
    for (let i = 0; i < data.files.length; i++) {
        // fileObj = { filename: string, file: string  }
        const fileObj = data.files[i];
        if (!isPlainObject(fileObj)) return false;
        if (!isString(fileObj.filename) || fileObj.filename === "")
            return formatError({
                more_info: `File '${fileObj.filename}' doesn't have a valid name.`,
            });
        // fileObj.file is a base64 encoded file that needs to start with this header.
        if (
            !isString(fileObj.file) ||
            !fileObj.file.startsWith("data:application/x-xopp;base64,")
        ) {
            return formatError({
                more_info: `File '${fileObj.filename}' doesn't have a valid header.`,
            });
        }
    }
    // if valid format.
    return Result("ok", true);
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
