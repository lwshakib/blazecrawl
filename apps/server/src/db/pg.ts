import pg from "pg"
import { DATABASE_URL } from "../envs.js"

const { Pool } = pg

export const pool = new Pool({
  connectionString: DATABASE_URL,
})

export const initDb = async () => {
  const client = await pool.connect()
  try {
    // Enable uuid-ossp for uuid generation
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS auth_tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS scrape_runs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_email TEXT NOT NULL,
        url TEXT NOT NULL,
        options JSONB NOT NULL,
        result JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log("Database initialized successfully")
  } catch (err) {
    console.error(\"Error initializing database:\", err)
    throw err
  } finally {
    client.release()
  }
}
