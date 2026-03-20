// src/db/drizzle.js

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../models/index.js';
import dotenv from 'dotenv';
dotenv.config();


const connectionString = process.env.DATABASE_URL ;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

export { db };
