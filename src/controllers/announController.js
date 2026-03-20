import { sendAnnouncement } from '../libs/notifyService.js';
import { db } from "../database/drizzle.js";
import { announcements } from "../models/announcements.js";
import { announcementReceivers } from "../models/junctions.js";
import { eq } from 'drizzle-orm';

export const createAnnouncement = async (req, res) => {
  try {
    const result = await sendAnnouncement(req.body);

    res.status(201).json({
      success: true,
      announcement: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getAnnouncementsForUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const announcementsList = await db
      .select()
      .from(announcements)
      .innerJoin(
        announcementReceivers,
        eq(announcements.id, announcementReceivers.announcementId)
      )
      .where(eq(announcementReceivers.receiverId, Number(userId)));

    if (announcementsList.length === 0) {
      return res.status(200).json({
        success: true,
        announcements: [],
      });
    }

    
    const formatted = announcementsList.map((item) => ({
      ...item.announcements,
      ...item.announcement_receivers,
    }));
    // Sort by createdAt descending
    formatted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      announcements: formatted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};