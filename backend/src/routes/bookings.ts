import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware for booking creation
const validateBooking = [
  body('petId').notEmpty().withMessage('Pet ID is required'),
  body('pickupLocation').trim().isLength({ min: 1 }).withMessage('Pickup location is required'),
  body('dropoffLocation').trim().isLength({ min: 1 }).withMessage('Dropoff location is required'),
  body('scheduledTime').isISO8601().withMessage('Valid scheduled time is required'),
  body('pickupLat').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid pickup latitude'),
  body('pickupLng').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid pickup longitude'),
  body('dropoffLat').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid dropoff latitude'),
  body('dropoffLng').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid dropoff longitude'),
  body('estimatedPrice').isFloat({ min: 0 }).withMessage('Valid estimated price is required'),
  body('services').optional().isArray().withMessage('Services must be an array'),
];

// Create a new booking
router.post('/', authenticateToken, validateBooking, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const {
      petId,
      pickupLocation,
      dropoffLocation,
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      scheduledTime,
      estimatedPrice,
      distance,
      duration,
      notes,
      services = []
    } = req.body;

    // Verify pet belongs to user
    const pet = await prisma.pet.findFirst({
      where: { 
        id: petId,
        ownerId: req.user!.userId,
        isActive: true
      }
    });

    if (!pet) {
      return res.status(404).json({ 
        error: 'Pet not found',
        message: 'Pet not found or you do not have permission to book for this pet'
      });
    }

    // Create booking with services
    const booking = await prisma.booking.create({
      data: {
        petOwnerId: req.user!.userId,
        petId,
        pickupLocation,
        dropoffLocation,
        pickupLat,
        pickupLng,
        dropoffLat,
        dropoffLng,
        scheduledTime: new Date(scheduledTime),
        estimatedPrice,
        distance,
        duration,
        notes,
        services: {
          create: services.map((service: any) => ({
            serviceId: service.serviceId,
            price: service.price,
          }))
        }
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            size: true,
          }
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                category: true,
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ 
      error: 'Failed to create booking',
      message: 'An error occurred while creating the booking'
    });
  }
});

// Get bookings for the authenticated user
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const offset = (page - 1) * limit;

    const whereClause: any = { petOwnerId: req.user!.userId };
    if (status) {
      whereClause.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            size: true,
            photo: true,
          }
        },
        pilot: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            pilotProfile: {
              select: {
                rating: true,
                vehicleType: true,
              }
            }
          }
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                category: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    const totalBookings = await prisma.booking.count({
      where: whereClause
    });

    res.json({
      message: 'Bookings retrieved successfully',
      bookings,
      pagination: {
        page,
        limit,
        total: totalBookings,
        pages: Math.ceil(totalBookings / limit),
      },
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve bookings',
      message: 'An error occurred while fetching bookings'
    });
  }
});

// Get a specific booking by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findFirst({
      where: { 
        id,
        petOwnerId: req.user!.userId
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            size: true,
            weight: true,
            photo: true,
          }
        },
        pilot: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
            pilotProfile: {
              select: {
                rating: true,
                vehicleType: true,
                vehicleModel: true,
                licensePlate: true,
              }
            }
          }
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                description: true,
                category: true,
              }
            }
          }
        },
        tracking: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ 
        error: 'Booking not found',
        message: 'Booking not found or you do not have permission to view it'
      });
    }

    res.json({
      message: 'Booking retrieved successfully',
      booking,
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve booking',
      message: 'An error occurred while fetching the booking'
    });
  }
});

// Cancel a booking
router.patch('/:id/cancel', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if booking exists and belongs to user
    const existingBooking = await prisma.booking.findFirst({
      where: { 
        id,
        petOwnerId: req.user!.userId
      }
    });

    if (!existingBooking) {
      return res.status(404).json({ 
        error: 'Booking not found',
        message: 'Booking not found or you do not have permission to cancel it'
      });
    }

    // Check if booking can be cancelled
    if (!['PENDING', 'ACCEPTED'].includes(existingBooking.status)) {
      return res.status(400).json({ 
        error: 'Cannot cancel booking',
        message: 'Booking cannot be cancelled in its current status'
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    res.json({
      message: 'Booking cancelled successfully',
      booking: updatedBooking,
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ 
      error: 'Failed to cancel booking',
      message: 'An error occurred while cancelling the booking'
    });
  }
});

// Add a message to booking
router.post('/:id/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Message required',
        message: 'Please provide a message'
      });
    }

    // Check if booking exists and belongs to user
    const existingBooking = await prisma.booking.findFirst({
      where: { 
        id,
        petOwnerId: req.user!.userId
      }
    });

    if (!existingBooking) {
      return res.status(404).json({ 
        error: 'Booking not found',
        message: 'Booking not found or you do not have permission to message for it'
      });
    }

    const bookingMessage = await prisma.bookingMessage.create({
      data: {
        bookingId: id,
        message: message.trim(),
        isFromPilot: false, // Message is from pet owner
      }
    });

    res.status(201).json({
      message: 'Message sent successfully',
      bookingMessage,
    });

  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      message: 'An error occurred while sending the message'
    });
  }
});

export default router;