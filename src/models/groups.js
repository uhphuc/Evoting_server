// src/db/schema/groups.ts
import { pgTable, serial, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const groups = pgTable('groups', {
  id: serial('id').primaryKey(),
  gid: varchar('gid', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: integer('created_by').references(() => users.id),
});