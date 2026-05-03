import { Hono } from 'hono'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm' 

export const userRoutes = new Hono()

// List every user
userRoutes.get('/', async (c) => {
    const allUsers = await db.select().from(users)
    return c.json(allUsers)
})

// Create user
userRoutes.post('/', async (c) => {
    const body = await c.req.json()

    if (!body.name || typeof body.name !== 'string') {
        return c.json({ error: 'Invalid user name' }, 400)
    }

    const newUser = {
        id: crypto.randomUUID(),
        name: body.name.trim(),
    }

    await db.insert(users).values(newUser)
    return c.json(newUser, 201)
})

// Delete user
userRoutes.delete('/:id', async (c) => {
    

})

