// src/db/schema/users.js
import { pgTable, serial, text, integer, timestamp, boolean, varchar } from 'drizzle-orm/pg-core';
import { userRoleEnum, userGenderEnum } from './enums.js';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 255 }),
  gender: userGenderEnum('gender').notNull().default('other'),
  birthDate: timestamp('birth_date', {withTimezone: true}),
  address: text('address'),
  password: varchar('password', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('voter'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});