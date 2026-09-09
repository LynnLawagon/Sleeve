import mysql from "mysql2/promise";
import crypto from "crypto";

// One pooled connection to the MySQL server Laragon runs locally.
// Everything else in the app goes through the functions below, so if you
// ever move to a different host or a managed database, this is the only
// file that needs to change.
const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "sleeve",
  waitForConnections: true,
  connectionLimit: 10,
});

// JSON columns usually come back already parsed, but some MariaDB versions
// return them as strings — this keeps either case safe.
function parseJsonColumn(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

/* ---------------- users ---------------- */

export async function findUserByEmailOrUsername(identifier) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1",
    [identifier, identifier]
  );
  return rows[0] || null;
}

export async function findUserById(id) {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

export async function findUserByVerificationToken(token) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE verification_token = ? AND verification_token_expires > NOW() LIMIT 1",
    [token]
  );
  return rows[0] || null;
}

export async function createUser(user) {
  await pool.query(
    `INSERT INTO users (id, email, username, password_hash, email_verified, verification_token, verification_token_expires)
     VALUES (?, ?, ?, ?, 0, ?, ?)`,
    [user.id, user.email, user.username, user.passwordHash, user.verificationToken, user.verificationTokenExpires]
  );
  return user;
}

export async function setVerificationToken(userId, token, expires) {
  await pool.query(
    "UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE id = ?",
    [token, expires, userId]
  );
}

export async function markUserVerified(userId) {
  await pool.query(
    "UPDATE users SET email_verified = 1, verification_token = NULL, verification_token_expires = NULL WHERE id = ?",
    [userId]
  );
}

/* ---------------- items (owned collection) ---------------- */

function mapItemRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    format: row.format,
    cover: row.cover,
    year: row.year,
    rating: row.rating,
    tags: parseJsonColumn(row.tags),
    recommendedTracks: parseJsonColumn(row.recommended_tracks),
    location: row.location,
    notes: row.notes,
    onRepeat: !!row.on_repeat,
    isPublic: !!row.is_public,
    shareId: row.share_id,
    addedAt: row.added_at,
  };
}

export async function getItems(userId) {
  const [rows] = await pool.query("SELECT * FROM items WHERE user_id = ? ORDER BY added_at DESC", [userId]);
  return rows.map(mapItemRow);
}

export async function getItemById(userId, id) {
  const [rows] = await pool.query("SELECT * FROM items WHERE id = ? AND user_id = ? LIMIT 1", [id, userId]);
  return mapItemRow(rows[0]);
}

export async function saveItem(userId, item) {
  const existing = await getItemById(userId, item.id);
  const values = [
    item.title,
    item.artist,
    item.format,
    item.cover ?? null,
    item.year || null,
    item.rating || 0,
    JSON.stringify(item.tags || []),
    JSON.stringify(item.recommendedTracks || []),
    item.location || null,
    item.notes || null,
    item.onRepeat ? 1 : 0,
  ];

  if (existing) {
    await pool.query(
      `UPDATE items SET title=?, artist=?, format=?, cover=?, year=?, rating=?, tags=?, recommended_tracks=?, location=?, notes=?, on_repeat=?
       WHERE id = ? AND user_id = ?`,
      [...values, item.id, userId]
    );
  } else {
    await pool.query(
      `INSERT INTO items (id, user_id, title, artist, format, cover, year, rating, tags, recommended_tracks, location, notes, on_repeat)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [item.id, userId, ...values]
    );
  }
  return getItemById(userId, item.id);
}

export async function deleteItem(userId, id) {
  await pool.query("DELETE FROM items WHERE id = ? AND user_id = ?", [id, userId]);
}

export async function setItemShare(userId, id, isPublic) {
  const item = await getItemById(userId, id);
  if (!item) return null;
  const shareId = item.shareId || crypto.randomUUID();
  await pool.query("UPDATE items SET is_public = ?, share_id = ? WHERE id = ? AND user_id = ?", [
    isPublic ? 1 : 0,
    shareId,
    id,
    userId,
  ]);
  return getItemById(userId, id);
}

export async function getPublicItemByShareId(shareId) {
  const [rows] = await pool.query("SELECT * FROM items WHERE share_id = ? AND is_public = 1 LIMIT 1", [shareId]);
  return mapItemRow(rows[0]);
}

/* ---------------- wishlist ---------------- */

function mapWishlistRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    format: row.format,
    year: row.year,
    priority: row.priority,
    link: row.link,
    notes: row.notes,
    tags: parseJsonColumn(row.tags),
    addedAt: row.added_at,
  };
}

export async function getWishlist(userId) {
  const [rows] = await pool.query("SELECT * FROM wishlist WHERE user_id = ? ORDER BY added_at DESC", [userId]);
  return rows.map(mapWishlistRow);
}

export async function getWishlistItemById(userId, id) {
  const [rows] = await pool.query("SELECT * FROM wishlist WHERE id = ? AND user_id = ? LIMIT 1", [id, userId]);
  return mapWishlistRow(rows[0]);
}

export async function saveWishlistItem(userId, item) {
  const existing = await getWishlistItemById(userId, item.id);
  const values = [
    item.title,
    item.artist,
    item.format,
    item.year || null,
    item.priority || "Medium",
    item.link || null,
    item.notes || null,
    JSON.stringify(item.tags || []),
  ];

  if (existing) {
    await pool.query(
      `UPDATE wishlist SET title=?, artist=?, format=?, year=?, priority=?, link=?, notes=?, tags=?
       WHERE id = ? AND user_id = ?`,
      [...values, item.id, userId]
    );
  } else {
    await pool.query(
      `INSERT INTO wishlist (id, user_id, title, artist, format, year, priority, link, notes, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [item.id, userId, ...values]
    );
  }
  return getWishlistItemById(userId, item.id);
}

export async function deleteWishlistItem(userId, id) {
  await pool.query("DELETE FROM wishlist WHERE id = ? AND user_id = ?", [id, userId]);
}
