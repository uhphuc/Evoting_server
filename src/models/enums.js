// src/db/schema/enums.js
import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'voter']);
export const userGenderEnum = pgEnum('user_gender', ['male', 'female', 'other']);