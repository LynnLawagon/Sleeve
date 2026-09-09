-- Sleeve database schema (MySQL / MariaDB, as bundled with Laragon)
--
-- How to run this in Laragon:
--   1. Start Laragon (this starts MySQL).
--   2. Open HeidiSQL (Laragon's "Database" button opens it) or phpMyAdmin.
--   3. Connect with host 127.0.0.1, user root, empty password (Laragon defaults).
--   4. Open this file and run the whole thing, or paste it into a query tab.
--
-- This creates the `sleeve` database and three tables: users, items
-- (the owned collection), and wishlist.

CREATE DATABASE IF NOT EXISTS sleeve
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE sleeve;

-- One row per account.
CREATE TABLE IF NOT EXISTS users (
  id                          CHAR(36)      NOT NULL PRIMARY KEY,
  email                       VARCHAR(255)  NOT NULL,
  username                    VARCHAR(50)   NOT NULL,
  password_hash               VARCHAR(255)  NOT NULL,
  email_verified              TINYINT(1)    NOT NULL DEFAULT 0,
  verification_token          CHAR(64)      NULL,
  verification_token_expires  DATETIME      NULL,
  created_at                  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_username (username)
) ENGINE=InnoDB;

-- The physical media someone actually owns.
CREATE TABLE IF NOT EXISTS items (
  id                  CHAR(36)      NOT NULL PRIMARY KEY,
  user_id             CHAR(36)      NOT NULL,
  title               VARCHAR(255)  NOT NULL,
  artist              VARCHAR(255)  NOT NULL,
  format              ENUM('Vinyl','CD','Cassette','Other') NOT NULL DEFAULT 'Vinyl',
  cover               MEDIUMTEXT    NULL,        -- base64 cover photo (data URL)
  year                VARCHAR(4)    NULL,
  rating              TINYINT       NULL,         -- 0-5
  tags                JSON          NULL,         -- e.g. ["post-punk","live"]
  recommended_tracks  JSON          NULL,         -- e.g. ["Track One","Track Four"]
  location            VARCHAR(255)  NULL,         -- where it was picked up (optional, not a price)
  notes               TEXT          NULL,
  on_repeat           TINYINT(1)    NOT NULL DEFAULT 0,
  is_public           TINYINT(1)    NOT NULL DEFAULT 0,
  share_id            CHAR(36)      NULL,         -- stable id used in the public share link
  added_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_items_share_id (share_id),
  KEY idx_items_user (user_id),
  CONSTRAINT fk_items_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Things not yet owned, checked against `items` before buying.
CREATE TABLE IF NOT EXISTS wishlist (
  id          CHAR(36)      NOT NULL PRIMARY KEY,
  user_id     CHAR(36)      NOT NULL,
  title       VARCHAR(255)  NOT NULL,
  artist      VARCHAR(255)  NOT NULL,
  format      ENUM('Vinyl','CD','Cassette','Other') NOT NULL DEFAULT 'Vinyl',
  year        VARCHAR(4)    NULL,
  priority    ENUM('Low','Medium','High') NOT NULL DEFAULT 'Medium',
  link        VARCHAR(500)  NULL,
  notes       TEXT          NULL,
  tags        JSON          NULL,
  added_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_wishlist_user (user_id),
  CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
sleeve