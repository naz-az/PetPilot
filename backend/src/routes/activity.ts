import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get activity feed for user
router.get('/feed', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const activities = await prisma.activityLog.findMany({
      where: { userId: req.user!.userId },
      orderBy: { timestamp: 'desc' },
      skip: offset,
      take: limit,
    });

    const totalActivities = await prisma.activityLog.count({
      where: { userId: req.user!.userId }
    });

    // Transform activities into user-friendly format
    const formattedActivities = activities.map(activity => {
      let title = '';
      let description = '';
      let icon = 'information-circle-outline';
      let color = '#53E88B';

      switch (activity.action) {
        case 'booking_created':
          title = 'Booking Created';
          description = 'You created a new pet transport booking';
          icon = 'calendar-outline';
          color = '#53E88B';
          break;
        case 'payment_completed':
          title = 'Payment Completed';
          description = `Payment of $${(activity.details as any)?.amount || 'N/A'} was processed successfully`;
          icon = 'card-outline';
          color = '#007AFF';
          break;
        case 'review_created':
          title = 'Review Posted';
          description = `You left a ${(activity.details as any)?.rating || 'N/A'}-star review`;
          icon = 'star-outline';
          color = '#FF9500';
          break;
        case 'medical_record_created':
          title = 'Medical Record Added';
          description = `Added medical record: ${(activity.details as any)?.title || 'N/A'}`;
          icon = 'medical-outline';
          color = '#FF3B30';
          break;
        case 'pet_created':
          title = 'Pet Added';
          description = `Added ${(activity.details as any)?.petName || 'new pet'} to your profile`;
          icon = 'paw-outline';
          color = '#34C759';
          break;
        case 'booking_cancelled':
          title = 'Booking Cancelled';
          description = 'You cancelled a booking';
          icon = 'close-circle-outline';
          color = '#FF3B30';
          break;
        default:
          title = 'Activity';
          description = activity.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          break;
      }

      return {
        id: activity.id,
        title,
        description,
        icon,
        color,
        timestamp: activity.timestamp,
        details: activity.details
      };
    });

    res.json({
      message: 'Activity feed retrieved successfully',
      activities: formattedActivities,
      pagination: {
        page,
        limit,
        total: totalActivities,
        pages: Math.ceil(totalActivities / limit),
      },
    });

  } catch (error) {
    console.error('Get activity feed error:', error);
    res.status(500).json({
      error: 'Failed to retrieve activity feed',
      message: 'An error occurred while fetching activity data'
    });
  }
});

// Get activity statistics
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get various statistics
    const [
      totalActivities,
      recentActivities,
      totalBookings,
      completedBookings,
      totalReviews,
      totalPayments
    ] = await Promise.all([
      prisma.activityLog.count({ where: { userId } }),
      prisma.activityLog.count({ 
        where: { 
          userId, 
          timestamp: { gte: thirtyDaysAgo } 
        } 
      }),
      prisma.booking.count({ where: { petOwnerId: userId } }),
      prisma.booking.count({ 
        where: { 
          petOwnerId: userId, 
          status: 'COMPLETED' 
        } 
      }),
      prisma.review.count({ where: { reviewerId: userId } }),
      prisma.payment.count({ 
        where: { 
          userId, 
          status: 'COMPLETED' 
        } 
      })
    ]);

    // Get activity breakdown by type
    const activityBreakdown = await prisma.activityLog.groupBy({
      by: ['action'],
      where: { userId },
      _count: true,
    });

    // Get recent activity trend (last 7 days)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayCount = await prisma.activityLog.count({
        where: {
          userId,
          timestamp: {
            gte: date,
            lt: nextDate
          }
        }
      });

      weeklyTrend.push({
        date: date.toISOString().split('T')[0],
        count: dayCount
      });
    }

    res.json({
      message: 'Activity statistics retrieved successfully',
      stats: {
        totalActivities,
        recentActivities,
        totalBookings,
        completedBookings,
        totalReviews,
        totalPayments,
        activityBreakdown: activityBreakdown.reduce((acc, curr) => {
          acc[curr.action] = curr._count;
          return acc;
        }, {} as Record<string, number>),
        weeklyTrend
      }
    });

  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve activity statistics',
      message: 'An error occurred while fetching activity statistics'
    });
  }
});

// Get notifications for user
router.get('/notifications', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const unreadOnly = req.query.unreadOnly === 'true';
    const offset = (page - 1) * limit;

    const whereClause: any = { userId: req.user!.userId };
    if (unreadOnly) {
      whereClause.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    const totalNotifications = await prisma.notification.count({
      where: whereClause
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: req.user!.userId,
        isRead: false
      }
    });

    res.json({
      message: 'Notifications retrieved successfully',
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total: totalNotifications,
        pages: Math.ceil(totalNotifications / limit),
      },
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: 'Failed to retrieve notifications',
      message: 'An error occurred while fetching notifications'
    });
  }
});

// Mark notification as read
router.patch('/notifications/:id/read', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.user!.userId
      }
    });

    if (!notification) {
      return res.status(404).json({
        error: 'Notification not found',
        message: 'Notification not found or you do not have permission to access it'
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.json({
      message: 'Notification marked as read',
      notification: updatedNotification
    });

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      error: 'Failed to mark notification as read',
      message: 'An error occurred while updating the notification'
    });
  }
});

// Mark all notifications as read
router.patch('/notifications/read-all', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId: req.user!.userId,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({
      message: 'All notifications marked as read',
      updatedCount: result.count
    });

  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      error: 'Failed to mark all notifications as read',
      message: 'An error occurred while updating notifications'
    });
  }
});

// Delete notification
router.delete('/notifications/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.user!.userId
      }
    });

    if (!notification) {
      return res.status(404).json({
        error: 'Notification not found',
        message: 'Notification not found or you do not have permission to delete it'
      });
    }

    await prisma.notification.delete({
      where: { id }
    });

    res.json({
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      error: 'Failed to delete notification',
      message: 'An error occurred while deleting the notification'
    });
  }
});

export default router;