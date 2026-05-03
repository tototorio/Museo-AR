// Connection to the database
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
// @ts-ignore 
import * as schema from './schema'    

// Connection
const sqlite = new Database('database.sqlite')

// Drizzle instance
export const db = drizzle(sqlite, { schema })