import {db} from '../database/drizzle.js';
import { users } from '../models/users.js';
import { rooms } from '../models/rooms.js';
import { roomMembers } from '../models/junctions.js';
import { eq, and, inArray } from 'drizzle-orm';
import { sendAnnouncement } from '../libs/notifyService.js';

export const getAllRooms = async (req, res) => {
    try {
        const roomsList = await db.select().from(rooms);
        if (roomsList.length === 0) {
            return res.status(404).json({ success: false, message: 'No rooms found' });
        }
    
        res.status(200).json({ success: true, rooms: roomsList });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export const getRoomByManagerId = async (req, res) => {
    const { managerId } = req.params;
    try {
        const room = await db.select().from(rooms).where(eq(rooms.managerId, managerId));
        if (room.length === 0) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
    
        res.status(200).json({ success: true, room });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
export const getRoomById = async (req, res) => {
    const { id } = req.params;
    try {
        const room = await db.select().from(rooms).where(eq(rooms.id, id));
        if (room.length === 0) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
    
        res.status(200).json({ success: true, room });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export const createRoom = async (req, res) => {
    const { name, description, managerId } = req.body;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let roomCode = '';
    for (let i = 0; i < 6; i++) {
        roomCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    try {
        const newRoom = await db.insert(rooms).values({
            name,
            description,
            managerId,
            roomCode
        }).returning();

        res.status(201).json({ success: true, room: newRoom });
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ success: false, message: 'Room already exists' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
}

export const VoterJoinGroup = async (req, res) => {
    const { roomCode, userId } = req.body;
    try {
        const room = await db.select().from(rooms).where(eq(rooms.roomCode, roomCode));
        if (room.length === 0) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
    
        const user = await db.select().from(users).where(eq(users.id, userId));
        if (user.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const existingMember = await db.select().from(roomMembers).where(
            and(
                eq(roomMembers.userId, userId),
                eq(roomMembers.roomId, room[0].id)
            )
        );
        if (existingMember.length > 0) {
            return res.status(409).json({ success: false, message: 'User already a member of the room' });
        }

        const newMember = await db.insert(roomMembers).values({
            userId,
            roomId: room[0].id,
            approved: false,
        }).returning();
        try {
            await sendAnnouncement({
                type: 'PENDING_MAN',
                title: `New join request from ${user[0].name}`,
                message: `${user[0].name} has requested to join the room ${room[0].name}.`,
                senderId: userId,
                receiverIds: [room[0].managerId],
            });

            await sendAnnouncement({
                type: 'PENDING_VOT',
                title: `Join request sent`,
                message: `Your request to join the room ${room[0].name} has been sent to the manager.`,
                senderId: userId,
                receiverIds: [userId],
            });
        } catch (error) {
            console.log('Failed to send announcement:', error);
        }
        
        res.status(201).json({ success: true, member: newMember, approved: newMember[0].approved });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
export const getPendingMembers = async (req, res) => {
  const { roomId } = req.params;

  try {
    const pendingMembers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(roomMembers)
      .innerJoin(users, eq(users.id, roomMembers.userId))
      .where(
        and(
          eq(roomMembers.roomId, Number(roomId)),
          eq(roomMembers.isApproved, false)
        )
      );

    res.status(200).json({ success: true, pendingMembers });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const approveMember = async (req, res) => {
    const { roomId, userId, approved } = req.body;
    try {
        const updatedMember = await db.update(roomMembers)
            .set({ isApproved: approved })
            .where(
                eq(roomMembers.roomId, Number(roomId)),
                eq(roomMembers.userId, Number(userId))
            )
            .returning();
            
        if (updatedMember.length === 0) {
            return res.status(404).json({ success: false, message: 'Membership not found' });
        }
        try {
            await sendAnnouncement({
                type: 'NEW_ROOM',
                title: approved ? 'Join request approved' : 'Join request rejected',
                message: approved
                    ? `Your request to join the room has been approved. Welcome to ${rooms[0].name}!`
                    : `Your request to join the room has been rejected. Please contact the manager for more information.`,
                senderId: updatedMember[0].userId,
                receiverIds: [updatedMember[0].userId],
            });
        } catch (error) {
            console.log('Failed to send announcement:', error);
        }

        res.status(200).json({ success: true, member: updatedMember[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export const getApprovedMembers = async (req, res) => {
    const { roomId } = req.params;
    try {
        const approvedMembers = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
            })
            .from(roomMembers)
            .innerJoin(users, eq(users.id, roomMembers.userId))
            .where(
                and(
                    eq(roomMembers.roomId, Number(roomId)),
                    eq(roomMembers.isApproved, true)
                )
            );

        res.status(200).json({ success: true, approvedMembers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
export const checkApprovedByMemberId = async (req, res) => {
    const { roomId, userId } = req.params;
    try {
        const membership = await db
            .select()
            .from(roomMembers)
            .where(
                and(
                    eq(roomMembers.roomId, Number(roomId)),
                    eq(roomMembers.userId, Number(userId))
                )
            );
            
        if (membership.length === 0) {
            return res.status(404).json({ success: false, message: 'Membership not found' });
        }
        res.status(200).json({ success: true, isApproved: membership[0].isApproved });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
// get room by member id that the member is approved in the room

export const getRoomByMemberId = async (req, res) => {
    const { memberId } = req.params;

    try {
        const roomMemberships = await db
            .select()
            .from(roomMembers)
            .where(
                and(
                    eq(roomMembers.userId, Number(memberId)),
                    eq(roomMembers.isApproved, true)
                )
            );

        if (roomMemberships.length === 0) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        const roomIds = roomMemberships.map(rm => rm.roomId);

        const roomDetails = await db
            .select()
            .from(rooms)
            .where(inArray(rooms.id, roomIds));

        res.status(200).json({ success: true, rooms: roomDetails });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}