import { db } from "../database/drizzle.js";
import { rooms } from "../models/rooms.js";
import { options } from "../models/options.js";
import { encryptedVotes } from "../models/votes.js";
import { eq, and } from "drizzle-orm";
import { getPrivateKey, getPublicKey } from "../libs/paillierKeys.js";
import { getIO } from "../socket.js";


export const postVotes = async (req, res) => {
  const { roomId, votes } = req.body; 
  const userId = req.user.id;

  try {
    const room = await db.select().from(rooms).where(eq(rooms.id, roomId));
    if (room.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const existingVote = await db
      .select()
      .from(encryptedVotes)
      .where(
        and(
          eq(encryptedVotes.roomId, roomId),
          eq(encryptedVotes.userId, userId)
        )
      );

    if (existingVote.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You already voted",
      });
    }

    const roomOptions = await db
      .select()
      .from(options)
      .where(eq(options.roomId, roomId))
      .orderBy(options.id);

    if (roomOptions.length !== votes.length) {
      return res.status(400).json({
        success: false,
        message: "Votes vector length mismatch",
      });
    }

    const insertData = roomOptions.map((opt, index) => ({
      roomId,
      optionId: opt.id,
      userId,
      encryptedData: votes[index],
    }));

    await db.insert(encryptedVotes).values(insertData);

    return res.status(200).json({
      success: true,
      message: "Vector vote recorded",
    });

  } catch (error) {
    console.error("Vote error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const hasVoted = async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user.id;

    try {
        const existingVote = await db
            .select()
            .from(encryptedVotes)
            .where(
                and(
                    eq(encryptedVotes.roomId, roomId),
                    eq(encryptedVotes.userId, userId)
                )
            );
            
        return res.status(200).json({
            success: true,
            hasVoted: existingVote.length > 0
        });
    } catch (error) {
        console.error("Check vote error:", error);
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

export const getTotalVotes = async (req, res) => {
    const { roomId } = req.params;
    const privateKey = getPrivateKey();
    const publicKey = getPublicKey();
    const io = getIO();

    try {
        const opts = await db.select().from(options).where(eq(options.roomId, roomId));
        const results = {};

        for (const opt of opts) {
            const votes = await db.select().from(encryptedVotes).where(
                and(
                eq(encryptedVotes.roomId, roomId),
                eq(encryptedVotes.optionId, opt.id)
                )
            );

            if (votes.length === 0) {
                results[opt.id] = 0;
                continue;
            }

            const encryptedSum = votes.reduce((sum, vote, i) => {
                const c = BigInt(vote.encryptedData);
                return i === 0 ? c : publicKey.addition(sum, c);
            }, 0n);

            const decrypted = privateKey.decrypt(BigInt(encryptedSum));

            results[opt.id] = Number(decrypted);
            // Optionally, update options.sum:
            await db.update(options).set({ sum: Number(decrypted) }).where(eq(options.id, opt.id));
        }
        io.to(`room_${roomId}`).emit("vote_results_updated", {
            results,
        });
    

        return res.status(200).json({ success: true, results });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}