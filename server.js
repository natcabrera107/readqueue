import express from "express";
import { connectDB } from "./models/db.js";

import papersRouter from "./routes/papers.js";

import booksRouter from "./routes/books.js";
import commentsRouter from "./routes/comments.js";
import listsRouter from "./routes/lists.js";

const app = express();
const port = process.env.PORT || 3000;

//middleware parse the incoming jason into req.body 
app.use(express.json());

//Middleware public as static files to browser
app.use(express.static("public"));

//Paper router
app.use(papersRouter);

//Book router
app.use(booksRouter);

//Comment Router
app.use(commentsRouter);

//List Router
app.use(listsRouter);

await connectDB();

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
