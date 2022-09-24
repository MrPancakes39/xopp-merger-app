// gzip library
import zlib from "node:zlib";

// data libraries
import { XMLParser, XMLBuilder } from "fast-xml-parser";

const xml_options = {
    ignoreAttributes: false,
    allowBooleanAttributes: true,
    preserveOrder: true,
};

import { validFormat, validFile } from "./validate.mjs";
import Result from "./result-type.mjs";

function mergeFiles(data) {
    if (!validFormat(data))
        return Result("error", {
            reason: "The data is not in a valid format.",
        });

    const xmlParser = new XMLParser(xml_options);
    const xmlBuilder = new XMLBuilder(xml_options);

    const jsonFiles = [];
    for (let i = 0; i < data.files.length; i++) {
        const obj = data.files[i];
        // strip base64 header and convert to a buffer
        let buffer = Buffer.from(obj.file.slice(31), "base64");

        let xmlData;
        try {
            // decompress the file
            xmlData = zlib.gunzipSync(buffer);
        } catch {
            return Result("error", {
                reason: `File '${obj.filename}' is not a valid xopp file.`,
                more_info: "Couldn't decompress the xopp file.",
            });
        }

        // parse xml as json
        const jsonData = xmlParser.parse(xmlData);
        if (jsonData.length === 0)
            return Result("error", {
                reason: `File '${obj.filename}' is not a valid xopp file.`,
                more_info: "Couldn't parse the xml file.",
            });
        if (!validFile(jsonData))
            return Result("error", {
                reason: `File '${obj.filename}' is not a valid xopp file.`,
                more_info: "Doesn't satisfy the valid format.",
            });

        jsonFiles.push(jsonData);
    }

    // we will modify first file and use it as output
    const outputJSON = jsonFiles[0];
    // copy all pages from the other files
    for (let i = 1; i < jsonFiles.length; i++) {
        const fileNotebook = jsonFiles[i][1]["xournal"];
        const pages = fileNotebook.slice(2);
        outputJSON[1]["xournal"] = [...outputJSON[1]["xournal"], ...pages];
    }
    // build xml
    const outputXML = xmlBuilder.build(outputJSON);
    // compress the data
    return Result("ok", zlib.gzipSync(outputXML));
}

export default mergeFiles;
