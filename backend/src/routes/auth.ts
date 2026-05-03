// src/routes/auth.ts
import { Hono } from "hono";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { hashPassword, verifyPassword } from "../lib/passwords.js";
import { eq } from "drizzle-orm";

const auth = new Hono()

// Register new user
auth.post('/register', async (c) => {
    const { email, password } = await c.req.json()

    // Basic validation
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string' || password.length < 8) {
        return c.json({ error: 'Invalid email or password' }, 400);
    }

    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.email, email)).get()
    if (existing) {
        return c.json({ error: 'Email already in use' }, 400);
    }

    // Hash the password and store the user
    const passwordHash = await hashPassword(password);

    await db.insert(users).values({ email, passwordHash });

    return c.json({ message: 'User registered successfully' }, 201);
})

auth.post ('/login', async (c) => {
    const { email, password } = await c.req.json()

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        return c.json({ error: 'Invalid email or password' }, 400);
    }

    const user = await db.select().from(users).where(eq(users.email, email)).get()

    if (!user) {
        return c.json({ error: 'Invalid email or password' }, 400);
    }

    const valid = await verifyPassword(user.passwordHash, password)

    if (!valid) {
        return c.json({ error: 'Invalid email or password' }, 400);
    } 
})