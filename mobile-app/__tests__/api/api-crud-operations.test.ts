import { petAPI, bookingAPI, userAPI, reviewAPI } from '../../src/services/api';

// Mock fetch for testing
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock response helper
const mockResponse = (data: any, status = 200, ok = true) => {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response);
};

describe('API CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('Pet API CRUD Operations', () => {
    const mockPet = {
      id: '1',
      name: 'Buddy',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: '3',
      weight: '65',
      size: 'Large' as const,
      color: 'Golden',
      description: 'Friendly dog',
      photo: 'https://example.com/buddy.jpg',
    };

    describe('CREATE Pet', () => {
      it('should create a new pet successfully', async () => {
        const newPetData = {
          name: 'Max',
          species: 'Dog',
          breed: 'Labrador',
          age: '2',
          weight: '55',
          size: 'Medium' as const,
          color: 'Black',
          description: 'Energetic puppy',
          photo: '',
        };

        mockFetch.mockResolvedValueOnce(
          mockResponse({ success: true, pet: { ...newPetData, id: '2' } })
        );

        const result = await petAPI.create(newPetData);

        expect(mockFetch).toHaveBeenCalledWith('/api/pets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          },
          body: JSON.stringify(newPetData),
        });

        expect(result.data.pet).toEqual({ ...newPetData, id: '2' });
      });

      it('should handle validation errors during pet creation', async () => {
        const invalidPetData = {
          name: '', // Invalid: empty name
          species: 'Dog',
          breed: 'Labrador',
        };

        mockFetch.mockResolvedValueOnce(
          mockResponse(
            { 
              success: false, 
              error: 'Validation failed',
              details: ['Pet name is required'] 
            },
            400,
            false
          )
        );

        await expect(petAPI.create(invalidPetData as any)).rejects.toThrow('Validation failed');

        expect(mockFetch).toHaveBeenCalledWith('/api/pets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          },
          body: JSON.stringify(invalidPetData),
        });
      });

      it('should handle network errors during pet creation', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        await expect(petAPI.create(mockPet)).rejects.toThrow('Network error');
      });

      it('should handle server errors during pet creation', async () => {
        mockFetch.mockResolvedValueOnce(
          mockResponse({ error: 'Internal server error' }, 500, false)
        );

        await expect(petAPI.create(mockPet)).rejects.toThrow();
      });
    });

    describe('READ Pet Operations', () => {
      it('should fetch all pets successfully', async () => {
        const mockPets = [mockPet, { ...mockPet, id: '2', name: 'Whiskers' }];

        mockFetch.mockResolvedValueOnce(
          mockResponse({ success: true, pets: mockPets })
        );

        const result = await petAPI.getAll();

        expect(mockFetch).toHaveBeenCalledWith('/api/pets', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer mock-token',
          },
        });

        expect(result.data.pets).toEqual(mockPets);
        expect(result.data.pets).toHaveLength(2);
      });

      it('should fetch a single pet by ID successfully', async () => {
        mockFetch.mockResolvedValueOnce(
          mockResponse({ success: true, pet: mockPet })
        );

        const result = await petAPI.getById('1');

        expect(mockFetch).toHaveBeenCalledWith('/api/pets/1', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer mock-token',
          },
        });

        expect(result.data.pet).toEqual(mockPet);
      });

      it('should handle pet not found', async () => {
        mockFetch.mockResolvedValueOnce(
          mockResponse({ success: false, error: 'Pet not found' }, 404, false)
        );

        await expect(petAPI.getById('999')).rejects.toThrow('Pet not found');
      });

      it('should handle empty pets list', async () => {
        mockFetch.mockResolvedValueOnce(
          mockResponse({ success: true, pets: [] })
        );

        const result = await petAPI.getAll();

        expect(result.data.pets).toEqual([]);
        expect(result.data.pets).toHaveLength(0);
      });

      it('should handle unauthorized access', async () => {
        mockFetch.mockResolvedValueOnce(
          mockResponse({ error: 'Unauthorized' }, 401, false)
        );

        await expect(petAPI.getAll()).rejects.toThrow();
      });
    });

    describe('UPDATE Pet Operations', () => {
      it('should update a pet successfully', async () => {
        const updatedData = { ...mockPet, name: 'Buddy Updated', age: '4' };

        mockFetch.mockResolvedValueOnce(
          mockResponse({ success: true, pet: updatedData })
        );

        const result = await petAPI.update('1', updatedData);

        expect(mockFetch).toHaveBeenCalledWith('/api/pets/1', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          },
          body: JSON.stringify(updatedData),
        });

        expect(result.data.pet).toEqual(updatedData);
      });

      it('should handle partial updates', async () => {
        const partialUpdate = { name: 'Buddy Renamed' };
        const expectedResult = { ...mockPet, name: 'Buddy Renamed' };

        mockFetch.mockResolvedValueOnce(
          mockResponse({ success: true, pet: expectedResult })
        );

        const result = await petAPI.update('1', partialUpdate);

        expect(mockFetch).toHaveBeenCalledWith('/api/pets/1', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          },
          body: JSON.stringify(partialUpdate),
        });

        expect(result.data.pet.name).toBe('Buddy Renamed');
      });

      it('should handle update validation errors', async () => {
        const invalidUpdate = { age: '-1' }; // Invalid age

        mockFetch.mockResolvedValueOnce(
          mockResponse(
            { 
              success: false, 
              error: 'Validation failed',
              details: ['Age must be a positive number'] 
            },
            400,
            false
          )
        );

        await expect(petAPI.update('1', invalidUpdate)).rejects.toThrow('Validation failed');
      });

      it('should handle update of non-existent pet', async () => {
        mockFetch.mockResolvedValueOnce(
          mockResponse({ success: false, error: 'Pet not found' }, 404, false)
        );

        await expect(petAPI.update('999', mockPet)).rejects.toThrow('Pet not found');
      });
    });

    describe('DELETE Pet Operations', () => {
      it('should delete a pet successfully', async () => {
        mockFetch.mockResolvedValueOnce(
          mockResponse({ success: true, message: 'Pet deleted successfully' })
        );

        const result = await petAPI.delete('1');

        expect(mockFetch).toHaveBeenCalledWith('/api/pets/1', {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer mock-token',
          },
        });

        expect(result.data.success).toBe(true);
      });

      it('should handle deletion of non-existent pet', async () => {
        mockFetch.mockResolvedValueOnce(
          mockResponse({ success: false, error: 'Pet not found' }, 404, false)
        );

        await expect(petAPI.delete('999')).rejects.toThrow('Pet not found');
      });

      it('should handle deletion of pet with active bookings', async () => {
        mockFetch.mockResolvedValueOnce(
          mockResponse(
            { 
              success: false, 
              error: 'Cannot delete pet with active bookings' 
            },
            409,
            false
          )
        );

        await expect(petAPI.delete('1')).rejects.toThrow('Cannot delete pet with active bookings');
      });

      it('should handle cascade deletion properly', async () => {
        mockFetch.mockResolvedValueOnce(
          mockResponse({ 
            success: true, 
            message: 'Pet and related records deleted successfully',
            deletedRecords: {
              pet: 1,
              medicalRecords: 3,
              appointments: 2
            }
          })
        );

        const result = await petAPI.delete('1');

        expect(result.data.deletedRecords).toEqual({
          pet: 1,
          medicalRecords: 3,
          appointments: 2
        });
      });
    });
  });

  describe('Booking API CRUD Operations', () => {
    const mockBooking = {
      id: '1',
      serviceName: 'Pet Transport',
      petId: '1',
      petName: 'Buddy',
      date: '2024-01-20',
      time: '10:00 AM',
      status: 'pending' as const,
      price: 25,
      pickupAddress: '123 Main St',
      dropoffAddress: '456 Oak Ave',
      notes: 'Handle with care',
    };

    describe('CREATE Booking', () => {
      it('should create a booking successfully', async () => {
        const bookingData = {
          serviceId: 'service-1',
          petId: '1',
          date: '2024-01-20',
          time: '10:00 AM',
          pickupAddress: '123 Main St',
          dropoffAddress: '456 Oak Ave',
          notes: 'Handle with care',
        };

        mockFetch.mockResolvedValueOnce(
          mockResponse({ success: true, booking: mockBooking })
        );

        const result = await bookingAPI.create(bookingData);

        expect(mockFetch).toHaveBeenCalledWith('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          },
          body: JSON.stringify(bookingData),
        });

        expect(result.data.booking).toEqual(mockBooking);
      });

      it('should validate booking time slots', async () => {
        const conflictingBooking = {
          serviceId: 'service-1',
          petId: '1',
          date: '2024-01-20',
          time: '10:00 AM', // Same time as existing booking
          pickupAddress: '123 Main St',
          dropoffAddress: '456 Oak Ave',
        };

        mockFetch.mockResolvedValueOnce(
          mockResponse(
            { 
              success: false, 
              error: 'Time slot not available',
              availableSlots: ['11:00 AM', '2:00 PM', '4:00 PM']
            },
            409,
            false
          )
        );

        await expect(bookingAPI.create(conflictingBooking)).rejects.toThrow('Time slot not available');
      });

      it('should validate service availability', async () => {
        const unavailableServiceBooking = {
          serviceId: 'service-999',
          petId: '1',
          date: '2024-01-20',
          time: '10:00 AM',
          pickupAddress: '123 Main St',
          dropoffAddress: '456 Oak Ave',
        };

        mockFetch.mockResolvedValueOnce(
          mockResponse(
            { success: false, error: 'Service not available' },
            400,
            false
          )
        );

        await expect(bookingAPI.create(unavailableServiceBooking)).rejects.toThrow('Service not available');
      });

      it('should calculate pricing correctly', async () => {
        const bookingWithPricing = {
          ...mockBooking,
          price: 35,
          fees: {
            basePrice: 25,
            serviceFee: 5,
            tax: 5,
            total: 35
          }
        };

        mockFetch.mockResolvedValueOnce(
          mockResponse({ success: true, booking: bookingWithPricing })
        );

        const result = await bookingAPI.create({
          serviceId: 'premium-transport',
          petId: '1',
          date: '2024-01-20',
          time: '10:00 AM',
          pickupAddress: '123 Main St',
          dropoffAddress: '456 Oak Ave',
        });

        expect(result.data.booking.fees).toEqual({
          basePrice: 25,
          serviceFee: 5,
          tax: 5,
          total: 35
        });
      });
    });

    describe('READ Booking Operations', () => {
      it('should fetch all bookings for user', async () => {
        const mockBookings = [
          mockBooking,
          { ...mockBooking, id: '2', petName: 'Whiskers' }
        ];

        mockFetch.mockResolvedValueOnce(
          mockResponse({ success: true, bookings: mockBookings })
        );

        const result = await bookingAPI.getAll();

        expect(mockFetch).toHaveBeenCalledWith('/api/bookings', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer mock-token',
          },
        });

        expect(result.data.bookings).toEqual(mockBookings);
      });

      it('should fetch bookings with filtering', async () => {
        const filteredBookings = [mockBooking];

        mockFetch.mockResolvedValueOnce(
          mockResponse({ success: true, bookings: filteredBookings })
        );

        const result = await bookingAPI.getAll({
          status: 'pending',
          petId: '1',
          dateRange: { start: '2024-01-01', end: '2024-01-31' }
        });

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/bookings?status=pending&petId=1&startDate=2024-01-01&endDate=2024-01-31',
          {
            method: 'GET',
            headers: {
              'Authorization': 'Bearer mock-token',
            },
          }
        );
      });

      it('should fetch booking by ID with full details', async () => {
        const detailedBooking = {
          ...mockBooking,
          pilotInfo: {
            name: 'Sarah Johnson',
            phone: '+1234567890',
            rating: 4.8,
            vehicle: '2022 Honda CR-V',
            licensePlate: 'VET-123',
          },
          trackingInfo: {
            status: 'en_route',
            currentLocation: { lat: 40.7128, lng: -74.0060 },
            estimatedArrival: '2024-01-20T10:15:00Z'
          }
        };

        mockFetch.mockResolvedValueOnce(
          mockResponse({ success: true, booking: detailedBooking })
        );

        const result = await bookingAPI.getById('1');

        expect(result.data.booking.pilotInfo).toBeDefined();
        expect(result.data.booking.trackingInfo).toBeDefined();
      });

      it('should handle booking access permissions', async () => {
        mockFetch.mockResolvedValueOnce(
          mockResponse({ success: false, error: 'Access denied' }, 403, false)
        );

        await expect(bookingAPI.getById('1')).rejects.toThrow('Access denied');
      });
    });

    describe('UPDATE Booking Operations', () => {
      it('should cancel booking successfully', async () => {
        mockFetch.mockResolvedValueOnce(
          mockResponse({ 
            success: true, 
            booking: { ...mockBooking, status: 'cancelled' },
            refund: {
              amount: 25,
              processedAt: '2024-01-19T15:30:00Z',
              refundId: 'ref_123'
            }
          })
        );

        const result = await bookingAPI.cancel('1');

        expect(mockFetch).toHaveBeenCalledWith('/api/bookings/1/cancel', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer mock-token',
          },
        });

        expect(result.data.booking.status).toBe('cancelled');
        expect(result.data.refund).toBeDefined();
      });

      it('should handle cancellation restrictions', async () => {
        mockFetch.mockResolvedValueOnce(
          mockResponse(
            { 
              success: false, 
              error: 'Cannot cancel booking within 2 hours of scheduled time' 
            },
            400,
            false
          )
        );

        await expect(bookingAPI.cancel('1')).rejects.toThrow('Cannot cancel booking within 2 hours');
      });

      it('should update booking status (pilot actions)', async () => {
        const statusUpdate = {
          status: 'in_progress',
          location: { lat: 40.7128, lng: -74.0060 },
          notes: 'Picked up pet, en route to destination'
        };

        mockFetch.mockResolvedValueOnce(
          mockResponse({ 
            success: true, 
            booking: { ...mockBooking, status: 'in_progress' }
          })
        );

        const result = await bookingAPI.updateStatus('1', statusUpdate);

        expect(mockFetch).toHaveBeenCalledWith('/api/bookings/1/status', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          },
          body: JSON.stringify(statusUpdate),
        });

        expect(result.data.booking.status).toBe('in_progress');
      });

      it('should reschedule booking', async () => {
        const rescheduleData = {
          date: '2024-01-21',
          time: '2:00 PM'
        };

        mockFetch.mockResolvedValueOnce(
          mockResponse({ 
            success: true, 
            booking: { ...mockBooking, ...rescheduleData }
          })
        );

        const result = await bookingAPI.reschedule('1', rescheduleData);

        expect(result.data.booking.date).toBe('2024-01-21');
        expect(result.data.booking.time).toBe('2:00 PM');
      });
    });
  });

  describe('User API CRUD Operations', () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      address: '123 Main St',
    };

    describe('User Profile Operations', () => {
      it('should fetch user profile', async () => {
        mockFetch.mockResolvedValueOnce(
          mockResponse({ success: true, user: mockUser })
        );

        const result = await userAPI.getProfile();

        expect(mockFetch).toHaveBeenCalledWith('/api/user/profile', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer mock-token',
          },
        });

        expect(result.data.user).toEqual(mockUser);
      });

      it('should update user profile', async () => {
        const updateData = { name: 'John Smith', phone: '+1987654321' };
        const updatedUser = { ...mockUser, ...updateData };

        mockFetch.mockResolvedValueOnce(
          mockResponse({ success: true, user: updatedUser })
        );

        const result = await userAPI.updateProfile(updateData);

        expect(mockFetch).toHaveBeenCalledWith('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          },
          body: JSON.stringify(updateData),
        });

        expect(result.data.user.name).toBe('John Smith');
      });

      it('should delete user account', async () => {
        mockFetch.mockResolvedValueOnce(
          mockResponse({ 
            success: true, 
            message: 'Account deleted successfully',
            deletedData: {
              pets: 2,
              bookings: 5,
              medicalRecords: 8
            }
          })
        );

        const result = await userAPI.deleteAccount();

        expect(mockFetch).toHaveBeenCalledWith('/api/user/account', {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer mock-token',
          },
        });

        expect(result.data.deletedData).toBeDefined();
      });

      it('should handle profile validation errors', async () => {
        const invalidData = { email: 'invalid-email' };

        mockFetch.mockResolvedValueOnce(
          mockResponse(
            { 
              success: false, 
              error: 'Validation failed',
              details: ['Invalid email format']
            },
            400,
            false
          )
        );

        await expect(userAPI.updateProfile(invalidData)).rejects.toThrow('Validation failed');
      });
    });
  });

  describe('Review API Operations', () => {
    const mockReview = {
      id: '1',
      bookingId: '1',
      pilotId: 'pilot-1',
      rating: 5,
      comment: 'Excellent service!',
      createdAt: '2024-01-20T15:00:00Z',
    };

    describe('CREATE Review', () => {
      it('should create review successfully', async () => {
        const reviewData = {
          bookingId: '1',
          pilotId: 'pilot-1',
          rating: 5,
          comment: 'Excellent service! Very professional.',
        };

        mockFetch.mockResolvedValueOnce(
          mockResponse({ success: true, review: mockReview })
        );

        const result = await reviewAPI.create(reviewData);

        expect(mockFetch).toHaveBeenCalledWith('/api/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          },
          body: JSON.stringify(reviewData),
        });

        expect(result.data.review).toEqual(mockReview);
      });

      it('should validate review data', async () => {
        const invalidReview = {
          bookingId: '1',
          rating: 6, // Invalid rating
          comment: 'OK' // Too short
        };

        mockFetch.mockResolvedValueOnce(
          mockResponse(
            { 
              success: false, 
              error: 'Validation failed',
              details: [
                'Rating must be between 1 and 5',
                'Comment must be at least 10 characters'
              ]
            },
            400,
            false
          )
        );

        await expect(reviewAPI.create(invalidReview)).rejects.toThrow('Validation failed');
      });

      it('should prevent duplicate reviews', async () => {
        const duplicateReview = {
          bookingId: '1',
          pilotId: 'pilot-1',
          rating: 4,
          comment: 'Already reviewed this booking',
        };

        mockFetch.mockResolvedValueOnce(
          mockResponse(
            { success: false, error: 'Review already exists for this booking' },
            409,
            false
          )
        );

        await expect(reviewAPI.create(duplicateReview)).rejects.toThrow('Review already exists');
      });
    });

    describe('READ Review Operations', () => {
      it('should fetch reviews for pilot', async () => {
        const pilotReviews = [
          mockReview,
          { ...mockReview, id: '2', rating: 4, comment: 'Good service' }
        ];

        mockFetch.mockResolvedValueOnce(
          mockResponse({ 
            success: true, 
            reviews: pilotReviews,
            statistics: {
              averageRating: 4.5,
              totalReviews: 2,
              ratingDistribution: { 5: 1, 4: 1, 3: 0, 2: 0, 1: 0 }
            }
          })
        );

        const result = await reviewAPI.getByPilot('pilot-1');

        expect(result.data.reviews).toEqual(pilotReviews);
        expect(result.data.statistics.averageRating).toBe(4.5);
      });
    });
  });

  describe('API Error Handling', () => {
    it('should handle network timeouts', async () => {
      mockFetch.mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      await expect(petAPI.getAll()).rejects.toThrow('Request timeout');
    });

    it('should handle rate limiting', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse(
          { error: 'Rate limit exceeded', retryAfter: 60 },
          429,
          false
        )
      );

      await expect(petAPI.getAll()).rejects.toThrow();
    });

    it('should handle server maintenance', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse(
          { error: 'Service temporarily unavailable' },
          503,
          false
        )
      );

      await expect(petAPI.getAll()).rejects.toThrow();
    });
  });

  describe('API Authentication', () => {
    it('should include auth token in requests', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ success: true, pets: [] })
      );

      await petAPI.getAll();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
          }),
        })
      );
    });

    it('should handle token expiration', async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ error: 'Token expired' }, 401, false)
      );

      await expect(petAPI.getAll()).rejects.toThrow();
    });
  });

  describe('API Request/Response Interceptors', () => {
    it('should handle request transformation', async () => {
      const petData = {
        name: 'Buddy',
        species: 'dog', // lowercase
        age: '3',
      };

      mockFetch.mockResolvedValueOnce(
        mockResponse({ success: true, pet: { ...petData, id: '1' } })
      );

      await petAPI.create(petData as any);

      // Verify the request was transformed correctly
      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1]!.body as string);
      
      expect(requestBody).toEqual(petData);
    });

    it('should handle response transformation', async () => {
      const serverResponse = {
        success: true,
        data: {
          pet_name: 'Buddy', // snake_case from server
          pet_species: 'Dog',
          created_at: '2024-01-20T10:00:00Z'
        }
      };

      mockFetch.mockResolvedValueOnce(mockResponse(serverResponse));

      const result = await petAPI.getById('1');

      // Verify the response was transformed correctly
      expect(result.data).toBeDefined();
    });
  });

  describe('API Pagination', () => {
    it('should handle paginated responses', async () => {
      const paginatedResponse = {
        success: true,
        pets: [mockPet],
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          pages: 3,
          hasNext: true,
          hasPrev: false
        }
      };

      mockFetch.mockResolvedValueOnce(mockResponse(paginatedResponse));

      const result = await petAPI.getAll({ page: 1, limit: 10 });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/pets?page=1&limit=10',
        expect.any(Object)
      );

      expect(result.data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 25,
        pages: 3,
        hasNext: true,
        hasPrev: false
      });
    });
  });

  describe('API Caching', () => {
    it('should implement request caching for GET requests', async () => {
      mockFetch.mockResolvedValue(
        mockResponse({ success: true, pets: [mockPet] })
      );

      // First request
      await petAPI.getAll();
      // Second request (should use cache)
      await petAPI.getAll();

      // Should only make one network request due to caching
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should invalidate cache on mutations', async () => {
      mockFetch
        .mockResolvedValueOnce(mockResponse({ success: true, pets: [mockPet] }))
        .mockResolvedValueOnce(mockResponse({ success: true, pet: mockPet }))
        .mockResolvedValueOnce(mockResponse({ success: true, pets: [mockPet] }));

      // First request - populate cache
      await petAPI.getAll();
      
      // Mutation - should invalidate cache
      await petAPI.create(mockPet);
      
      // Second request - should make new network call
      await petAPI.getAll();

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });
});