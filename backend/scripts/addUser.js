require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

async function main() { 
  const [username, password] = process.argv.slice(2);
  if (!username || !password) {
    console.log("Missing arguments");
    process.exit(1);
  }
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });
  try {
    const hash = await bcrypt.hash(password, 10); 
    await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2)",
      [username, hash],
    );
    console.log(`Inserted user "${username}"`);
  } catch (err) {
    console.error("Failed to add user:", err.message);
  } finally {
    await pool.end();
  }
  
}

main();
