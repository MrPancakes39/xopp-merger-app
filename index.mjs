#!/bin/env node

import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3500;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.listen(PORT, () => console.log(`Listening on: http://localhost:${PORT}`));

import mergeFiles from "./modules/merger.mjs";

app.post("/api/merge", (req, res) => {
    const file = mergeFiles(req.body);
    res.setHeader("Content-Length", file.length);
    res.setHeader("Content-Type", "application/x-xopp");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=${req.body.output}`
    );
    res.end(file);
});
