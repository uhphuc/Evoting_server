import { db } from '../database/drizzle.js';
import { users } from '../models/users.js';
import { eq, and, or, like } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { userRoleEnum, userGenderEnum } from '../models/enums.js';
import jwt from 'jsonwebtoken';

export const authController = {
  async register(req, res) {
    const { email, name, phone, gender, birthDate, address, password, role } = req.body;
    console.log(req.body);
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      if (!userRoleEnum.enumValues.includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }
      if (!userGenderEnum.enumValues.includes(gender)) {
        return res.status(400).json({ success: false, message: 'Invalid gender' });
      }
      const newUser = await db.insert(users).values({
        email,
        name,
        phone, 
        gender,
        birthDate: new Date(birthDate),
        address,
        password: hashedPassword,
        role
      }).returning();
      res.status(200).json({ success: true, user: { 
        id: newUser[0].id, 
        email: newUser[0].email, 
        name: newUser[0].name, 
        role: newUser[0].role,
        phone: newUser[0].phone,
        gender: newUser[0].gender,
        birthDate: newUser[0].birthDate,
        address: newUser[0].address,
        createdAt: newUser[0].createdAt,
        updatedAt: newUser[0].updatedAt
       } });
    }
    catch (error) {
      if (error.code === '23505') { 
        return res.status(409).json({ success: false, message: 'Email already exists' });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }
  ,
  async login(req, res) {
    const { email, password } = req.body;
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      // Generate JWT token here (omitted for brevity)
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });
      res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    }
    catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  ,
  async logout(req, res) {
    // Invalidate the token on the client side
    res.json({ success: true, message: 'Logged out successfully' });
  }
  ,
  async getMe(req, res) {
    const { id } = req.user;
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, user });
    }
    catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}