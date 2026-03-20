// src/db/schema/junctions.js
import { pgTable, integer, primaryKey } from 'drizzle-orm/pg-core';
import { announcements } from './announcements.js';
import { users } from './users.js';
import { rooms } from './rooms.js';
import { groups } from './groups.js';
import { boolean } from 'drizzle-orm/gel-core';

export const announcementReceivers = pgTable('announcement_receivers', {
  announcementId: integer('announcement_id').references(() => announcements.id).notNull(),
  receiverId: integer('receiver_id').references(() => users.id).notNull(),
  isRead: boolean('is_read').notNull().default(false),
}, (table) => ({
  pk: primaryKey({ columns: [table.announcementId, table.receiverId] }),
}));

export const roomMembers = pgTable('room_members', {
  roomId: integer('room_id').references(() => rooms.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  isApproved: boolean('is_approved').notNull().default(false),
  isVoted: boolean('is_voted').notNull().default(false),
}, (table) => ({
  pk: primaryKey({ columns: [table.roomId, table.userId] }),
}));


export const groupMembers = pgTable('group_members', {
  groupId: integer('group_id').references(() => groups.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.groupId, table.userId] }),
}));

export const roomGroups = pgTable('room_groups', {
  roomId: integer('room_id').references(() => rooms.id).notNull(),
  groupId: integer('group_id').references(() => groups.id).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.roomId, table.groupId] }),
}));