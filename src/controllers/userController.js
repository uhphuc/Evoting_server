import {db} from '../database/drizzle.js';
import { users } from '../models/users.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { userRoleEnum, userGenderEnum } from '../models/enums.js';

export const getAllUsers = async (req, res) => {
  try {
    const usersList = (await db.select().from(users)).reduce((acc, user) => {
      const { password, ...userWithoutPassword } = user;
      acc.push(userWithoutPassword);
      return acc;
    }, []);

    res.status(200).json({ success: true, users: usersList });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export const getVoters = async (req, res) => {
  try {
    // Parse pagination values from query and ensure they're numbers
    const { page, limit } = req.query;
    const numericPage = Number(page);
    const numericLimit = Number(limit);
    const offset = (numericPage - 1) * numericLimit;

    if (isNaN(page) || isNaN(limit)) {
      return res.status(400).json({ 
        success: false, 
        error: "Page and limit must be numbers" 
      });
    }

    const usersList = (await db.select().from(users)
      .where(eq(users.role, 'voter'))
      .limit(numericLimit)
      .offset(offset))
      .reduce((acc, user) => {
        const { password, ...userWithoutPassword } = user;
        acc.push(userWithoutPassword);
        return acc;
      }, []);
      
    res.status(200).json({ success: true, users: usersList });
  }
  catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getManagers = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const numericPage = Number(page);
        const numericLimit = Number(limit);
        const offset = (numericPage - 1) * numericLimit;
    
        if (isNaN(page) || isNaN(limit)) {
        return res.status(400).json({ 
            success: false, 
            error: "Page and limit must be numbers" 
        });
        }
    
        const usersList = (await db.select().from(users)
        .where(eq(users.role, 'manager'))
        .limit(numericLimit)
        .offset(offset))
        .reduce((acc, user) => {
            const { password, ...userWithoutPassword } = user;
            acc.push(userWithoutPassword);
            return acc;
        }, []);
        
        res.status(200).json({ success: true, users: usersList });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export const getUserById = async (req, res) => {

  try {
    const { userId } = req.params;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(userId))) 
      .limit(1);

    if (!user.length) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    const { password, ...userWithoutPassword } = user[0];

    return res.status(200).json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.log("ERROR:", error); 
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const createVoter = async (req, res) => {
  const { email, name, address, phone, birthDate, gender } = req.body;
  try {
    // birthDate is in format YYYY-MM-DD
    const birthDateObj = new Date(birthDate);
    const password = `${birthDateObj.getDate().toString().padStart(2, '0')}${(birthDateObj.getMonth() + 1).toString().padStart(2, '0')}${birthDateObj.getFullYear()}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.insert(users).values({
      email,
      name,
      password: hashedPassword,
      address,
      phone,
      birthDate: birthDateObj,
      gender,
      role: 'voter'
    }).returning();
    const { password: _, ...userWithoutPassword } = newUser[0];
    res.status(201).json({ success: true, user: userWithoutPassword });
  }
  catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
}
export const createManager = async (req, res) => {
  const { email, name, address, phone, birthDate, gender } = req.body;
  try {
    const birthDateObj = new Date(birthDate);
    const day = birthDateObj.getDate().toString().padStart(2, '0');
    const month = (birthDateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = birthDateObj.getFullYear();

    const password = `${day}${month}${year}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.insert(users).values({
      email,
      name,
      password: hashedPassword,
      address,
      phone,
      birthDate: birthDateObj,
      gender,
      role: 'manager'
    }).returning();
    const { password: _, ...userWithoutPassword } = newUser[0];
    res.status(201).json({ success: true, user: userWithoutPassword });
  }
  catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
}

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, name, address, phone, birthDate, gender} = req.body;
  try {
    if (!userGenderEnum.enumValues.includes(gender)) {
      return res.status(400).json({ success: false, message: 'Invalid gender' });
    }
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const birthDateObj = new Date(birthDate);       
    const updatedUser = await db.update(users).set({
      email,
      name,
      address,
      phone,
      birthDate: birthDateObj,
      gender
    }).where(eq(users.id, id)).returning();
    const { password: _, ...userWithoutPassword } = updatedUser[0];
    res.status(200).json({ success: true, user: userWithoutPassword });
  }
  catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await db.delete(users).where(eq(users.id, id));
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  }
  catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
