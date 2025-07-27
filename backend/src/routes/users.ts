import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get current user profile
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        userType: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    res.json({
      message: 'Profile retrieved successfully',
      user,
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve profile',
      message: 'An error occurred while fetching user profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { firstName, lastName, phone, username } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
        ...(username && { username }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        userType: true,
        isVerified: true,
        updatedAt: true,
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });

  } catch (error: any) {
    console.error('Update profile error:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'Username already taken',
        message: 'This username is already in use'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to update profile',
      message: 'An error occurred while updating profile'
    });
  }
});

// Get user's pets
router.get('/pets', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const pets = await prisma.pet.findMany({
      where: { 
        ownerId: req.user!.userId,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      message: 'Pets retrieved successfully',
      pets,
      count: pets.length,
    });

  } catch (error) {
    console.error('Get pets error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve pets',
      message: 'An error occurred while fetching pets'
    });
  }
});

// Get user's bookings
router.get('/bookings', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const bookings = await prisma.booking.findMany({
      where: { petOwnerId: req.user!.userId },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
          }
        },
        pilot: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
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
      where: { petOwnerId: req.user!.userId }
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

export default router;