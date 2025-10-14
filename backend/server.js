require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const pool = require("./db/pool");

const SERVER_URL = process.env.SERVER_URL;
const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const CLIENT_URL = process.env.CLIENT_URL;
const PORT = process.env.PORT || 4000;

const app = express();
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());


function generateTokenParts() {
  const tokenId = crypto.randomUUID();
  const secret = crypto.randomBytes(32).toString("base64url");
  return { tokenId, secret };
}
function formatRefreshToken(tokenId, secret) {
  return `${tokenId}.${secret}`;
}
function parseRefreshToken(token) {
  const [tokenId, secret] = (token || "").split(".");
  if (!tokenId || !secret) return null;
  return { tokenId, secret };
}

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await pool.query(
      "SELECT id, username, password_hash FROM users WHERE username = $1",
      [username],
    );
    const user = rows[0];
    console.log(user);
    if (!user) return res.status(401).json({ message: "Invalid Credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid Credentials" });

    const { tokenId, secret } = generateTokenParts();
    const tokenHash = await bcrypt.hash(secret, 10);
    const familyId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30d

    await pool.query(
      `INSERT INTO refresh_tokens (token_id, user_id, token_hash, family_id, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [tokenId, user.id, tokenHash, familyId, expiresAt],
    );

    const refreshToken = formatRefreshToken(tokenId, secret);
    const accessToken = jwt.sign(
      { userId: user.id, username: user.username },
      ACCESS_SECRET,
      { expiresIn: "15m" },
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/refresh",
    });
    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/secure", (req, res) => {
  const accessToken = req.headers.accesstoken;

  if (!accessToken) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const user = jwt.verify(accessToken, ACCESS_SECRET);
    res.json({ secretData: "Super Secret Data" });
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
});

app.post("/refresh", async (req, res) => {
  const cookie = req.cookies.refreshToken;
  if (!cookie) return res.sendStatus(401);
  const parsed = parseRefreshToken(cookie);
  if (!parsed) return res.sendStatus(403);

  try {
    const { rows } = await pool.query(
      `SELECT rt.token_id, rt.user_id, rt.token_hash, rt.family_id, rt.expires_at, rt.revoked_at, rt.replaced_by, u.username
       FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id
       WHERE rt.token_id = $1`,
      [parsed.tokenId],
    );
    const row = rows[0];
    if (!row) return res.sendStatus(403);
    if (row.revoked_at) return res.sendStatus(403);
    if (new Date(row.expires_at) < new Date()) return res.sendStatus(403);

    const matches = await bcrypt.compare(parsed.secret, row.token_hash);
    if (!matches) return res.sendStatus(403);

    if (row.replaced_by) {
      await pool.query(
        `UPDATE refresh_tokens SET revoked_at = now() WHERE family_id = $1 AND revoked_at IS NULL`,
        [row.family_id],
      );
      return res.sendStatus(403);
    }

    const { tokenId: newId, secret: newSecret } = generateTokenParts();
    const newHash = await bcrypt.hash(newSecret, 10);
    const newExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO refresh_tokens (token_id, user_id, token_hash, family_id, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [newId, row.user_id, newHash, row.family_id, newExpires],
    );
    await pool.query(
      `UPDATE refresh_tokens SET replaced_by = $1 WHERE token_id = $2`,
      [newId, row.token_id],
    );

    const newCookie = formatRefreshToken(newId, newSecret);
    const accessToken = jwt.sign(
      { userId: row.user_id, username: row.username },
      ACCESS_SECRET,
      { expiresIn: "15m" },
    );
    res.cookie("refreshToken", newCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/refresh",
    });
    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.post("/logout", async (req, res) => {
  const cookie = req.cookies.refreshToken;
  if (cookie) {
    const parsed = parseRefreshToken(cookie);
    if (parsed) {
      try {
        const { rows } = await pool.query(
          `SELECT family_id FROM refresh_tokens WHERE token_id = $1`,
          [parsed.tokenId],
        );
        const fam = rows[0]?.family_id;
        if (fam) {
          await pool.query(
            `UPDATE refresh_tokens SET revoked_at = now() WHERE family_id = $1 AND revoked_at IS NULL`,
            [fam],
          );
        }
      } catch (err) {
        console.error(err);
      }
    }
  }
  res.clearCookie("refreshToken", { path: "/refresh" });
  res.json({ message: "Logged out" });
});

app.listen(PORT, () => {
  const urlToDisplay = SERVER_URL || `http://0.0.0.0:${PORT}`;
  console.log(`Server running at ${urlToDisplay}`);
});
