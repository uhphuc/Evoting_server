import { db } from '../database/drizzle.js';
import { users } from '../models/users.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

// Default admin account configuration
const ADMIN_CONFIG = {
  email: 'admin@example.com',
  name: 'Super Admin',
  password: 'admin123', 
  role: 'admin'
};

async function seedAdmin() {
  try {
    const [existingAdmin] = await db.select()
      .from(users)
      .where(eq(users.email, ADMIN_CONFIG.email))
      .limit(1);

    if (existingAdmin) {
      console.log('Admin account already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.password, 10);

    const [newAdmin] = await db.insert(users)
      .values({
        email: ADMIN_CONFIG.email,
        name: ADMIN_CONFIG.name,
        password: hashedPassword,
        role: ADMIN_CONFIG.role
      })
      .returning();

    console.log('Admin account created successfully:', newAdmin);
    return newAdmin;
  } catch (error) {
    console.error('Error seeding admin:', error);
    throw error;
  }
}

seedAdmin();