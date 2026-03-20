// src/db/schema/options.ts
import { pgTable, serial, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { rooms } from './rooms.js';

export const options = pgTable('options', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  sum: integer('sum').notNull().default(0),
  roomId: integer('room_id').references(() => rooms.id).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});