#!/bin/env node

import express from "express";
import cors from "cors";

import mergeFiles from "./modules/merger.mjs";

const app = express();
const PORT = process.env.PORT || 3500;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.listen(PORT, () => console.log(`Listening on: http://localhost:${PORT}`));

app.post("/api/merge", (req, res) => {
    const result = mergeFiles(req.body);
    if (result.ok) {
        const file = result.value;
        res.setHeader("Content-Length", file.length);
        res.setHeader("Content-Type", "application/x-xopp");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${req.body.output}`
        );
        res.end(file);
    } else {
        console.error(result.error);
        res.status(400).json({ error: result.error });
    }
});
