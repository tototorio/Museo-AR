import { Config } from 'drizzle-kit'

export default {

    schema: './src/db/schema.ts', // location of table definitions
    out: './drizzle',             // location of migration SQL files
    dialect: 'sqlite',
    dbCredentials: {
        url: './database.sqlite'
    }

} satisfies Config