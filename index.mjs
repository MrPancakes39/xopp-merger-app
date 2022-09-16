#!/bin/env node

import express from "express";

const app = express();
const PORT = process.env.PORT || 3500;

app.listen(PORT, () => console.log(`Listening on: http://localhost:${PORT}`));
app.use(express.static("public"));

app.use(express.json());

app.post("/api/merge", (req, res) => {
    mergeFiles(req.body);
    res.send("OK");
});

function mergeFiles(data) {
    console.log(data);
}
