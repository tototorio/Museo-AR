// src/db/index.ts
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '../../database.sqlite')

// Instruction to create/write a SQLite file
const sqlite = new Database(dbPath)
// Enable WAL mode - Write-Ahead Logging
// Allows read and write to happen simustaneously, for when handling multiple requests
sqlite.pragma('journal_mode = WAL')

// We use drizzle() to wrap the sqlite instance
export const db = drizzle(sqlite, { schema })