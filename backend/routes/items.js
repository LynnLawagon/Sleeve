import { Router } from "express";
import crypto from "crypto";
import { getItems, saveItem, deleteItem, setItemShare } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  res.json({ items: await getItems(req.userId) });
});

router.post("/", async (req, res) => {
  const body = req.body || {};
  if (!body.title || !body.artist) {
    return res.status(400).json({ error: "Title and artist are required." });
  }
  const item = await saveItem(req.userId, { ...body, id: body.id || crypto.randomUUID() });
  res.status(201).json({ item });
});

router.put("/:id", async (req, res) => {
  const item = await saveItem(req.userId, { ...req.body, id: req.params.id });
  res.json({ item });
});

router.delete("/:id", async (req, res) => {
  await deleteItem(req.userId, req.params.id);
  res.status(204).end();
});

// Toggle whether an item has a public, shareable link.
router.put("/:id/share", async (req, res) => {
  const item = await setItemShare(req.userId, req.params.id, !!req.body?.isPublic);
  if (!item) return res.status(404).json({ error: "Item not found." });
  res.json({ item });
});

export default router;
