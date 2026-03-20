import { db } from "../database/drizzle.js";
import { announcements } from "../models/announcements.js";
import { announcementReceivers } from "../models/junctions.js";
import { getIO } from "../socket.js";

export const sendAnnouncement = async ({
  type,
  title,
  message,
  senderId,
  receiverIds,
}) => {
  // 🧠 1. tạo announcement
  const newAnnouncement = await db
    .insert(announcements)
    .values({
      type,
      title,
      message,
      senderId,
    })
    .returning();

  const announcementId = newAnnouncement[0].id;

  // 🧠 2. receiver
  const receiverValues = receiverIds.map((receiverId) => ({
    announcementId,
    receiverId,
  }));

  await db.insert(announcementReceivers).values(receiverValues);
  const io = getIO();

  // ⚡ 3. realtime
  receiverIds.forEach((userId) => {
    io.to(`user_${userId}`).emit("notification", {
      id: announcementId,
      type,
      title,
      message,
      createdAt: newAnnouncement[0].createdAt,
      senderId,
      isRead: false,
      receiverId: userId,
    });

    io.to(`user_${userId}`).emit("badge_increment");
  });

  return newAnnouncement;
};