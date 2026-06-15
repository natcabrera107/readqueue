import { Router } from "express";
import {
  getPapers,
  getPaper,
  createPaper,
  updatePaper,
  deletePaper,
  addComment,
} from "../models/Paper.js";

const router = Router();

// GET /api/papers?listId=...  -> list of papers
router.get("/api/papers", async (req, res) => {
  const list = await getPapers(req.query.listId);
  res.json(list);
});

// GET /api/papers/:id  -> one paper (with its comments)
router.get("/api/papers/:id", async (req, res) => {
  const paper = await getPaper(req.params.id);
  if (!paper) return res.status(404).json({ error: "Paper not found" });
  res.json(paper);
});

// POST /api/papers  -> create a paper
router.post("/api/papers", async (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({ error: "title is required" });
  }
  const paper = await createPaper(req.body);
  res.status(201).json(paper);
});

// PUT /api/papers/:id  -> edit a paper / change its status
router.put("/api/papers/:id", async (req, res) => {
  const paper = await updatePaper(req.params.id, req.body);
  res.json(paper);
});

// DELETE /api/papers/:id  -> remove a paper
router.delete("/api/papers/:id", async (req, res) => {
  await deletePaper(req.params.id);
  res.json({ ok: true });
});

// POST /api/papers/:id/comments  -> add a comment to a paper
router.post("/api/papers/:id/comments", async (req, res) => {
  const { author, text } = req.body;
  if (!author || !text) {
    return res.status(400).json({ error: "author and text are required" });
  }
  const paper = await addComment(req.params.id, { author, text });
  res.json(paper);
});

export default router;
