require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const cookieParser = require("cookie-parser");

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

const users = [
  { id: 1, username: "user1", passwordHash: bcrypt.hashSync("pass1", 10) },
];

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }

  const refreshToken = jwt.sign({ id: user.id, username }, REFRESH_SECRET, {
    expiresIn: "30d",
  });
  const accessToken = jwt.sign({ refreshToken }, ACCESS_SECRET, {
    expiresIn: "15m",
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/refresh",
  });
  res.json({ accessToken });
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

app.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  try {
    const user = jwt.verify(refreshToken, REFRESH_SECRET);
    const accessToken = jwt.sign({ user }, ACCESS_SECRET, { expiresIn: "15m" });

    res.json({ accessToken });
  } catch (err) {
    res.sendStatus(403);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", { path: "/refresh" });
  res.json({ message: "Logged out" });
});

app.listen(PORT, () => {
  const urlToDisplay = SERVER_URL || `http://0.0.0.0:${PORT}`;
  console.log(`Server running at ${urlToDisplay}`);
});
