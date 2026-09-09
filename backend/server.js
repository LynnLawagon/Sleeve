import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import itemsRoutes from "./routes/items.js";
import wishlistRoutes from "./routes/wishlist.js";
import shareRoutes from "./routes/share.js";
import { requireAuth } from "./middleware/auth.js";

if (!process.env.JWT_SECRET) {
  console.error("Missing JWT_SECRET. Copy .env.example to .env and set one before starting the server.");
  process.exit(1);
}

const app = express();

app.use(cors({ origin: (process.env.CORS_ORIGIN || "").split(",").filter(Boolean) }));
// Raised limit so base64-encoded cover images fit in a request body.
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/items", requireAuth, itemsRoutes);
app.use("/api/wishlist", requireAuth, wishlistRoutes);
app.use("/api/share", shareRoutes); // public — no auth, read-only

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Sleeve API listening on http://localhost:${port}`));
