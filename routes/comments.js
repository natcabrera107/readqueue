import { Router } from "express";
import { getComments, addComment } from "../models/Comment.js";

const router = Router();

// GET /api/comments/:entryId — get all comments for a book or paper
router.get("/api/comments/:entryId", async (req, res) => {
  try {
    const comments = await getComments(req.params.entryId);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/comments/:entryId — add a comment to a book or paper
router.post("/api/comments/:entryId", async (req, res) => {
  try {
    const { author, body, entryType } = req.body;
    if (!author || !body)
      return res.status(400).json({ error: "author and body are required" });
    const comment = await addComment({
      entryId:   req.params.entryId,
      entryType: entryType ?? "book",
      author,
      body,
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;