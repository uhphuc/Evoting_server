// src/db/schema/relations.ts
import { relations } from 'drizzle-orm';
import { users } from './users.js';
import { groups } from './groups.js';
import { rooms } from './rooms.js';
import { options } from './options.js';
import { announcements } from './announcements.js';
import { announcementReceivers, groupMembers, roomGroups, roomMembers } from './junctions.js';

export const usersRelations = relations(users, ({ many }) => ({
  managedRooms: many(rooms, { relationName: 'room_manager' }),
  announcementsSent: many(announcements),
  announcementsReceived: many(announcementReceivers),
  roomMemberships: many(roomMembers),
  groupMemberships: many(groupMembers),
}));

export const groupsRelations = relations(groups, ({ many }) => ({
  members: many(groupMembers),
  rooms: many(roomGroups),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  manager: one(users, {
    fields: [rooms.managerId],
    references: [users.id],
    relationName: 'room_manager',
  }),
  options: many(options),
  members: many(roomMembers),
  groups: many(roomGroups),
}));

export const optionsRelations = relations(options, ({ one }) => ({
  room: one(rooms, {
    fields: [options.roomId],
    references: [rooms.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ one, many }) => ({
  sender: one(users, {
    fields: [announcements.senderId],
    references: [users.id],
  }),
  receivers: many(announcementReceivers),
}));

export const announcementReceiversRelations = relations(announcementReceivers, ({ one }) => ({
  announcement: one(announcements, {
    fields: [announcementReceivers.announcementId],
    references: [announcements.id],
  }),
  receiver: one(users, {
    fields: [announcementReceivers.receiverId],
    references: [users.id],
  }),
}));

export const roomMembersRelations = relations(roomMembers, ({ one }) => ({
  room: one(rooms, {
    fields: [roomMembers.roomId],
    references: [rooms.id],
  }),
  user: one(users, {
    fields: [roomMembers.userId],
    references: [users.id],
  }),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));

export const roomGroupsRelations = relations(roomGroups, ({ one }) => ({
  room: one(rooms, {
    fields: [roomGroups.roomId],
    references: [rooms.id],
  }),
  group: one(groups, {
    fields: [roomGroups.groupId],
    references: [groups.id],
  }),
}));