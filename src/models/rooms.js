// src/db/schema/rooms.ts
import { pgTable, serial, varchar, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const rooms = pgTable('rooms', {
  id: serial('id').primaryKey(),
  roomCode: varchar('room_code', { length: 6}).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'), 
  managerId: integer('manager_id').references(() => users.id).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  closesAt: timestamp('closes_at'), 
});