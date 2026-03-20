import { db } from "../database/drizzle.js";
import { rooms } from "../models/rooms.js";
import { options } from "../models/options.js";
import { encryptedVotes } from "../models/votes.js";
import { eq, and } from "drizzle-orm";
import { getPrivateKey, getPublicKey } from "../libs/paillierKeys.js";

export const postVote = async (req, res) => {
  const { roomId, optionId, encryptedVote } = req.body;

  try {
    const room = await db.select().from(rooms).where(eq(rooms.id, roomId));
    if (room.length === 0) return res.status(404).json({ success: false, message: 'Room not found' });

    const option = await db.select().from(options).where(eq(options.id, optionId));
    if (option.length === 0) return res.status(404).json({ success: false, message: 'Option not found' });

    await db.insert(encryptedVotes).values({
      roomId,
      optionId,
      encryptedData: encryptedVote,
    });

    return res.status(200).json({ success: true, message: 'Encrypted vote recorded' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getTotalVotes = async (req, res) => {
    const { roomId } = req.params;
    const privateKey = getPrivateKey();
    const publicKey = getPublicKey();

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
        

        return res.status(200).json({ success: true, results });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}