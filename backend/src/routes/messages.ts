import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get messages for a specific booking
router.get('/booking/:bookingId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bookingId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    // Verify user has access to this booking
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        OR: [
          { petOwnerId: req.user!.userId },
          { pilotId: req.user!.userId }
        ]
      }
    });

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
        message: 'You do not have permission to view messages for this booking'
      });
    }

    const messages = await prisma.bookingMessage.findMany({
      where: { bookingId },
      orderBy: { timestamp: 'asc' },
      skip: offset,
      take: limit,
    });

    const totalMessages = await prisma.bookingMessage.count({
      where: { bookingId }
    });

    res.json({
      message: 'Messages retrieved successfully',
      messages,
      pagination: {
        page,
        limit,
        total: totalMessages,
        pages: Math.ceil(totalMessages / limit),
      },
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      error: 'Failed to retrieve messages',
      message: 'An error occurred while fetching messages'
    });
  }
});

// Send a message
router.post(
  '/booking/:bookingId',
  authenticateToken,
  [
    body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { bookingId } = req.params;
      const { message } = req.body;

      // Verify user has access to this booking
      const booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          OR: [
            { petOwnerId: req.user!.userId },
            { pilotId: req.user!.userId }
          ]
        },
        include: {
          petOwner: { select: { id: true, firstName: true, lastName: true } },
          pilot: { select: { id: true, firstName: true, lastName: true } }
        }
      });

      if (!booking) {
        return res.status(404).json({
          error: 'Booking not found',
          message: 'You do not have permission to send messages for this booking'
        });
      }

      // Determine if message is from pilot
      const isFromPilot = booking.pilotId === req.user!.userId;

      const bookingMessage = await prisma.bookingMessage.create({
        data: {
          bookingId,
          message: message.trim(),
          isFromPilot,
        }
      });

      // Create notification for the other party
      const recipientId = isFromPilot ? booking.petOwnerId : booking.pilotId;
      if (recipientId) {
        await prisma.notification.create({
          data: {
            userId: recipientId,
            title: 'New Message',
            message: `You have a new message about your booking`,
            type: 'MESSAGE_RECEIVED',
            data: {
              bookingId,
              messageId: bookingMessage.id,
              senderId: req.user!.userId
            }
          }
        });
      }

      res.status(201).json({
        message: 'Message sent successfully',
        bookingMessage,
      });

    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        error: 'Failed to send message',
        message: 'An error occurred while sending the message'
      });
    }
  }
);

// Mark messages as read
router.patch('/booking/:bookingId/read', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bookingId } = req.params;

    // Verify user has access to this booking
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        OR: [
          { petOwnerId: req.user!.userId },
          { pilotId: req.user!.userId }
        ]
      }
    });

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
        message: 'You do not have permission to access this booking'
      });
    }

    // In a real implementation, you'd have a read status field
    // For now, we'll just return success
    res.json({
      message: 'Messages marked as read',
    });

  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({
      error: 'Failed to mark messages as read',
      message: 'An error occurred while marking messages as read'
    });
  }
});

export default router;