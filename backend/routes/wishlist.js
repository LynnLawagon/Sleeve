import { Router } from "express";
import crypto from "crypto";
import { getWishlist, saveWishlistItem, deleteWishlistItem } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  res.json({ items: await getWishlist(req.userId) });
});

router.post("/", async (req, res) => {
  const body = req.body || {};
  if (!body.title || !body.artist) {
    return res.status(400).json({ error: "Title and artist are required." });
  }
  const item = await saveWishlistItem(req.userId, { ...body, id: body.id || crypto.randomUUID() });
  res.status(201).json({ item });
});

router.put("/:id", async (req, res) => {
  const item = await saveWishlistItem(req.userId, { ...req.body, id: req.params.id });
  res.json({ item });
});

router.delete("/:id", async (req, res) => {
  await deleteWishlistItem(req.userId, req.params.id);
  res.status(204).end();
});

export default router;
