import {Router} from "express";
import { getList, createList } from "../models/List.js";

const router = Router();

router.get("/api/lists/:id", async (req, res) => {
  try {
    const list = await getList(req.params.id);
    if (!list) return res.status(404).json({ error: "List not found" });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/api/lists", async (req, res) => {
  try {
    if (!req.body.name)
      return res.status(400).json({ error: "name is required" });
    const list = await createList(req.body);
    res.status(201).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;