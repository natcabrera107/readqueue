import express from "express";
import { connectDB } from "./models/db.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

await connectDB();

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});