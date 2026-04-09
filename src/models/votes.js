// db/schema/encryptedVotes.ts
import { pgTable, integer, text, serial} from 'drizzle-orm/pg-core';
import { rooms } from './rooms.js';
import { options } from './options.js';
import { users } from './users.js';

export const encryptedVotes = pgTable('encrypted_votes', {
  e_id: serial('e_id').primaryKey(),
  roomId: integer('room_id').references(() => rooms.id).notNull(),
  optionId: integer('option_id').references(() => options.id).notNull(),
  encryptedData: text('encrypted_data').notNull(), 
  userId: integer('user_id').references(() => users.id).notNull(),
});
