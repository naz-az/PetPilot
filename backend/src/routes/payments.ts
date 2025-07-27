import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Create a payment for a booking
router.post(
  '/booking/:bookingId',
  authenticateToken,
  [
    body('paymentMethod').isIn(['card', 'apple_pay', 'google_pay', 'paypal']).withMessage('Invalid payment method'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters')
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
      const { paymentMethod, amount, currency = 'USD' } = req.body;

      // Verify booking exists and belongs to user
      const booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          petOwnerId: req.user!.userId
        }
      });

      if (!booking) {
        return res.status(404).json({
          error: 'Booking not found',
          message: 'Booking not found or you do not have permission to pay for it'
        });
      }

      // Check if payment already exists for this booking
      const existingPayment = await prisma.payment.findFirst({
        where: { bookingId }
      });

      if (existingPayment) {
        return res.status(400).json({
          error: 'Payment already exists',
          message: 'This booking has already been paid for'
        });
      }

      // In a real implementation, you would integrate with Stripe or another payment processor here
      // For now, we'll simulate the payment process
      const paymentIntent = `pi_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const payment = await prisma.payment.create({
        data: {
          userId: req.user!.userId,
          bookingId,
          amount,
          currency,
          paymentMethod,
          paymentIntent,
          status: 'COMPLETED', // In real implementation, this would start as PENDING
          processedAt: new Date()
        }
      });

      // Update booking with final price
      await prisma.booking.update({
        where: { id: bookingId },
        data: { finalPrice: amount }
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: req.user!.userId,
          title: 'Payment Successful',
          message: `Payment of $${amount} for your booking was successful`,
          type: 'PAYMENT_RECEIVED',
          data: {
            paymentId: payment.id,
            bookingId,
            amount
          }
        }
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user!.userId,
          action: 'payment_completed',
          details: {
            paymentId: payment.id,
            bookingId,
            amount,
            paymentMethod
          }
        }
      });

      res.status(201).json({
        message: 'Payment processed successfully',
        payment,
      });

    } catch (error) {
      console.error('Payment error:', error);
      res.status(500).json({
        error: 'Payment failed',
        message: 'An error occurred while processing the payment'
      });
    }
  }
);

// Get payment history for user
router.get('/history', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const payments = await prisma.payment.findMany({
      where: { userId: req.user!.userId },
      include: {
        booking: {
          select: {
            id: true,
            pickupLocation: true,
            dropoffLocation: true,
            scheduledTime: true,
            status: true,
            pet: {
              select: {
                id: true,
                name: true,
                species: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    const totalPayments = await prisma.payment.count({
      where: { userId: req.user!.userId }
    });

    const paymentStats = await prisma.payment.aggregate({
      where: { 
        userId: req.user!.userId,
        status: 'COMPLETED' 
      },
      _sum: { amount: true },
      _count: true
    });

    res.json({
      message: 'Payment history retrieved successfully',
      payments,
      stats: {
        totalAmount: paymentStats._sum.amount || 0,
        totalPayments: paymentStats._count
      },
      pagination: {
        page,
        limit,
        total: totalPayments,
        pages: Math.ceil(totalPayments / limit),
      },
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      error: 'Failed to retrieve payment history',
      message: 'An error occurred while fetching payment history'
    });
  }
});

// Get specific payment details
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findFirst({
      where: {
        id,
        userId: req.user!.userId
      },
      include: {
        booking: {
          select: {
            id: true,
            pickupLocation: true,
            dropoffLocation: true,
            scheduledTime: true,
            status: true,
            pet: {
              select: {
                id: true,
                name: true,
                species: true,
                breed: true
              }
            },
            pilot: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                pilotProfile: {
                  select: {
                    vehicleType: true,
                    licensePlate: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        error: 'Payment not found',
        message: 'Payment not found or you do not have permission to view it'
      });
    }

    res.json({
      message: 'Payment details retrieved successfully',
      payment,
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      error: 'Failed to retrieve payment',
      message: 'An error occurred while fetching payment details'
    });
  }
});

// Request refund
router.post(
  '/:id/refund',
  authenticateToken,
  [
    body('reason').trim().isLength({ min: 1, max: 500 }).withMessage('Refund reason is required and must be less than 500 characters'),
    body('amount').optional().isFloat({ min: 0.01 }).withMessage('Refund amount must be greater than 0')
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

      const { id } = req.params;
      const { reason, amount } = req.body;

      // Get payment details
      const payment = await prisma.payment.findFirst({
        where: {
          id,
          userId: req.user!.userId,
          status: 'COMPLETED'
        }
      });

      if (!payment) {
        return res.status(404).json({
          error: 'Payment not found',
          message: 'Payment not found or cannot be refunded'
        });
      }

      const refundAmount = amount || payment.amount;

      if (refundAmount > payment.amount) {
        return res.status(400).json({
          error: 'Invalid refund amount',
          message: 'Refund amount cannot exceed payment amount'
        });
      }

      // In a real implementation, you would process the refund with the payment processor
      // For now, we'll simulate the refund process
      const updatedPayment = await prisma.payment.update({
        where: { id },
        data: {
          status: refundAmount === payment.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
          refundAmount,
          refundReason: reason,
          updatedAt: new Date()
        }
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: req.user!.userId,
          title: 'Refund Processed',
          message: `Refund of $${refundAmount} has been processed`,
          type: 'PAYMENT_RECEIVED',
          data: {
            paymentId: payment.id,
            refundAmount,
            reason
          }
        }
      });

      res.json({
        message: 'Refund processed successfully',
        payment: updatedPayment,
      });

    } catch (error) {
      console.error('Refund error:', error);
      res.status(500).json({
        error: 'Refund failed',
        message: 'An error occurred while processing the refund'
      });
    }
  }
);

// Get payment methods (mock data for now)
router.get('/methods/available', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // In a real implementation, you would retrieve saved payment methods from Stripe or another provider
    const paymentMethods = [
      {
        id: 'pm_card_visa',
        type: 'card',
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true
      },
      {
        id: 'pm_apple_pay',
        type: 'apple_pay',
        isDefault: false
      },
      {
        id: 'pm_google_pay',
        type: 'google_pay',
        isDefault: false
      }
    ];

    res.json({
      message: 'Payment methods retrieved successfully',
      paymentMethods,
    });

  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      error: 'Failed to retrieve payment methods',
      message: 'An error occurred while fetching payment methods'
    });
  }
});

export default router;