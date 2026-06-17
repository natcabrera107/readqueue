import { Router } from "express";
import {
    getBooks,
    getBook, 
    createBook,
    updateBook,
    deleteBook,
    addBookComment,
} from "../models/Book.js";

const router = Router();

//READ ALL using GET 
router.get("/api/books", async (req, res) => {
    const list = await getBooks(req.query.listId);
    res.json(list);
});

//READ ONE using GET
router.get("/api/books/:id", async (req, res) => {
    const book = await getBook(req.params.id);
    if (!book) return res.status(404).json({error: "Book not found"});
    res.json(book);
});

//CREATE using POST - send new data to create 
router.post("/api/books", async (req, res) => {
    if (!req.body.title) {
        return res.status(400).json({error: "title is required"});
    }

    const book = await createBook(req.body);
    res.status(201).json(book);
});

//UPDATE using PUT listen to http put requests to update data
router.put("/api/books/:id", async (req, res) => {
    const book = await updateBook(req.params.id, req.body);
    res.json(book);
});

//DELETE using DELETE - listen to http for delete requests run deleteone function in mongo, 
router.delete("/api/books/:id", async (req, res) => {
    await deleteBook(req.params.id);
    res.json({ok: true});
});

//POST, add comments etc using POST
router.post("/api/books/:id/comments", async (req, res) => {
    const {author, text} = req.body;
    if (!author || !text) {
        return res.status(400).json({error: "author and text are required"}) 
    }

    const book = await addBookComment(req.params.id, {author, text});
    res.json(book);
});

export default router;