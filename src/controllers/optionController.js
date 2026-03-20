import {db} from '../database/drizzle.js';
import { users } from '../models/users.js';
import { rooms } from '../models/rooms.js';
import { options } from '../models/options.js';
import { roomMembers } from '../models/junctions.js';
import { eq, and, inArray } from 'drizzle-orm';
import { getPrivateKey } from '../libs/paillierKeys.js';

export const createOption = async (req, res) => {
    const { name, description, roomId } = req.body;
    try {
        const newOption = await db.insert(options).values({
            name,
            description,
            roomId
        }).returning();
        res.status(201).json({ success: true, option: newOption });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
export const getOptionsByRoomId = async (req, res) => {
    const { roomId } = req.params;
    try {
        const optionsList = await db.select().from(options).where(eq(options.roomId, roomId));
        if (optionsList.length === 0) {
            return res.status(404).json({ success: false, message: 'No options found for this room' });
        }
    
        res.status(200).json({ success: true, options: optionsList });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// post vote by homomorphic encryption paillier

export const postVote = async (req, res) => {
    const { optionId, roomId, encryptedVote } = req.body;
    try {
        const room = await db.select().from(rooms).where(eq(rooms.id, roomId));
        if (room.length === 0) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
        const option = await db.select().from(options).where(eq(options.id, optionId));
        if (option.length === 0) {
            return res.status(404).json({ success: false, message: 'Option not found' });
        }
        const privateKey = getPrivateKey();
        const decryptedVote = privateKey.decrypt(encryptedVote);
        const updatedOption = await db.update(options).set({
            sum: option[0].sum + decryptedVote
        }).where(eq(options.id, optionId)).returning();
        res.status(200).json({ success: true, option: updatedOption });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
