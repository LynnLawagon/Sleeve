import { Router } from "express";
import { getPublicItemByShareId } from "../db.js";

const router = Router();

router.get("/:shareId", async (req, res) => {
  const item = await getPublicItemByShareId(req.params.shareId);
  if (!item) return res.status(404).json({ error: "This link isn't active." });

  // Deliberately narrow: no notes, no location, nothing that isn't meant
  // for a stranger to see.
  res.json({
    item: {
      title: item.title,
      artist: item.artist,
      format: item.format,
      year: item.year,
      cover: item.cover,
      rating: item.rating,
      tags: item.tags,
      recommendedTracks: item.recommendedTracks,
    },
  });
});

export default router;
