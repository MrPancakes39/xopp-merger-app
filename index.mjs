#!/bin/env node

import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Listening on: http://localhost:${PORT}`));
app.use(express.static("public"));
