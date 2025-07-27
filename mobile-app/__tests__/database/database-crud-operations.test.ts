import { Database } from 'sqlite3';
import { 
  initializeDatabase, 
  createTables, 
  insertUser, 
  updateUser, 
  deleteUser, 
  getUser,
  insertPet, 
  updatePet, 
  deletePet, 
  getPet, 
  getAllPets,
  insertBooking, 
  updateBooking, 
  deleteBooking, 
  getBooking, 
  getAllBookings,
  insertMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  getMedicalRecord,
  getAllMedicalRecords,
  insertReview,
  getReviewsByPilot,
  executeTransaction,
  migrateDatabase,
  backupDatabase,
  restoreDatabase
} from '../../src/services/database';

// Mock sqlite3 database
jest.mock('sqlite3');

describe('Database CRUD Operations', () => {
  let mockDb: jest.Mocked<Database>;
  
  beforeEach(() => {
    // Create a mock database instance
    mockDb = {
      run: jest.fn(),
      get: jest.fn(),
      all: jest.fn(),
      close: jest.fn(),
      serialize: jest.fn(),
      parallelize: jest.fn(),
      each: jest.fn(),
      prepare: jest.fn(),
      exec: jest.fn(),
      loadExtension: jest.fn(),
      interrupt: jest.fn(),
      configure: jest.fn(),
    } as any;

    // Mock successful database initialization
    (Database as jest.MockedClass<typeof Database>).mockImplementation(
      () => mockDb
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Database Initialization', () => {
    it('should initialize database successfully', async () => {
      mockDb.run.mockImplementation((sql, callback) => {
        callback?.call(mockDb, null);
        return mockDb;
      });

      const db = await initializeDatabase('test.db');

      expect(Database).toHaveBeenCalledWith('test.db');
      expect(db).toBe(mockDb);
    });

    it('should handle database initialization errors', async () => {
      (Database as jest.MockedClass<typeof Database>).mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await expect(initializeDatabase('invalid.db')).rejects.toThrow('Database connection failed');
    });

    it('should create all required tables', async () => {
      mockDb.run.mockImplementation((sql, callback) => {
        callback?.call(mockDb, null);
        return mockDb;
      });

      await createTables(mockDb);

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS users'),
        expect.any(Function)
      );
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS pets'),
        expect.any(Function)
      );
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS bookings'),
        expect.any(Function)
      );
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS medical_records'),
        expect.any(Function)
      );
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS reviews'),
        expect.any(Function)
      );
    });

    it('should handle table creation errors', async () => {
      mockDb.run.mockImplementation((sql, callback) => {
        callback?.call(mockDb, new Error('Table creation failed'));
        return mockDb;
      });

      await expect(createTables(mockDb)).rejects.toThrow('Table creation failed');
    });
  });

  describe('User CRUD Operations', () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      address: '123 Main St',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    describe('CREATE User', () => {
      it('should insert user successfully', async () => {
        mockDb.run.mockImplementation((sql, params, callback) => {
          callback?.call({ lastID: 1, changes: 1 }, null);
          return mockDb;
        });

        const userData = {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          address: '123 Main St',
        };

        const result = await insertUser(mockDb, userData);

        expect(mockDb.run).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO users'),
          expect.arrayContaining([
            userData.name,
            userData.email,
            userData.phone,
            userData.address
          ]),
          expect.any(Function)
        );

        expect(result.id).toBe(1);
        expect(result.changes).toBe(1);
      });

      it('should handle duplicate email constraint', async () => {
        mockDb.run.mockImplementation((sql, params, callback) => {
          const error = new Error('UNIQUE constraint failed: users.email');
          error.name = 'SQLITE_CONSTRAINT';
          callback?.call(mockDb, error);
          return mockDb;
        });

        const userData = {
          name: 'John Doe',
          email: 'existing@example.com',
          phone: '+1234567890',
          address: '123 Main St',
        };

        await expect(insertUser(mockDb, userData)).rejects.toThrow('UNIQUE constraint failed');
      });

      it('should validate required fields', async () => {
        const invalidUserData = {
          name: '',
          email: 'invalid-email',
          phone: '',
        };

        await expect(insertUser(mockDb, invalidUserData as any)).rejects.toThrow('Validation error');
      });

      it('should handle database transaction errors', async () => {
        mockDb.run.mockImplementation((sql, params, callback) => {
          callback?.call(mockDb, new Error('Database is locked'));
          return mockDb;
        });

        const userData = {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          address: '123 Main St',
        };

        await expect(insertUser(mockDb, userData)).rejects.toThrow('Database is locked');
      });
    });

    describe('READ User', () => {
      it('should get user by ID successfully', async () => {
        mockDb.get.mockImplementation((sql, params, callback) => {
          callback?.call(mockDb, null, mockUser);
          return mockDb;
        });

        const result = await getUser(mockDb, '1');

        expect(mockDb.get).toHaveBeenCalledWith(
          expect.stringContaining('SELECT * FROM users WHERE id = ?'),
          ['1'],
          expect.any(Function)
        );

        expect(result).toEqual(mockUser);
      });

      it('should return null for non-existent user', async () => {
        mockDb.get.mockImplementation((sql, params, callback) => {
          callback?.call(mockDb, null, undefined);
          return mockDb;
        });

        const result = await getUser(mockDb, '999');

        expect(result).toBeNull();
      });

      it('should get user by email', async () => {
        mockDb.get.mockImplementation((sql, params, callback) => {
          callback?.call(mockDb, null, mockUser);
          return mockDb;
        });

        const result = await getUserByEmail(mockDb, 'john@example.com');

        expect(mockDb.get).toHaveBeenCalledWith(
          expect.stringContaining('SELECT * FROM users WHERE email = ?'),
          ['john@example.com'],
          expect.any(Function)
        );

        expect(result).toEqual(mockUser);
      });

      it('should handle database query errors', async () => {
        mockDb.get.mockImplementation((sql, params, callback) => {
          callback?.call(mockDb, new Error('Database read error'));
          return mockDb;
        });

        await expect(getUser(mockDb, '1')).rejects.toThrow('Database read error');
      });
    });

    describe('UPDATE User', () => {
      it('should update user successfully', async () => {
        mockDb.run.mockImplementation((sql, params, callback) => {
          callback?.call({ changes: 1 }, null);
          return mockDb;
        });

        const updateData = {
          name: 'John Smith',
          phone: '+1987654321',
        };

        const result = await updateUser(mockDb, '1', updateData);

        expect(mockDb.run).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE users SET'),
          expect.arrayContaining([
            updateData.name,
            updateData.phone,
            '1'
          ]),
          expect.any(Function)
        );

        expect(result.changes).toBe(1);
      });

      it('should handle partial updates', async () => {
        mockDb.run.mockImplementation((sql, params, callback) => {
          callback?.call({ changes: 1 }, null);
          return mockDb;
        });

        const partialUpdate = { name: 'John Smith' };

        const result = await updateUser(mockDb, '1', partialUpdate);

        expect(result.changes).toBe(1);
      });

      it('should return 0 changes for non-existent user', async () => {
        mockDb.run.mockImplementation((sql, params, callback) => {
          callback?.call({ changes: 0 }, null);
          return mockDb;
        });

        const updateData = { name: 'Non Existent' };

        const result = await updateUser(mockDb, '999', updateData);

        expect(result.changes).toBe(0);
      });

      it('should validate update data', async () => {
        const invalidUpdate = { email: 'invalid-email' };

        await expect(updateUser(mockDb, '1', invalidUpdate)).rejects.toThrow('Validation error');
      });
    });

    describe('DELETE User', () => {
      it('should delete user successfully', async () => {
        mockDb.run.mockImplementation((sql, params, callback) => {
          callback?.call({ changes: 1 }, null);
          return mockDb;
        });

        const result = await deleteUser(mockDb, '1');

        expect(mockDb.run).toHaveBeenCalledWith(
          expect.stringContaining('DELETE FROM users WHERE id = ?'),
          ['1'],
          expect.any(Function)
        );

        expect(result.changes).toBe(1);
      });

      it('should return 0 changes for non-existent user', async () => {
        mockDb.run.mockImplementation((sql, params, callback) => {
          callback?.call({ changes: 0 }, null);
          return mockDb;
        });

        const result = await deleteUser(mockDb, '999');

        expect(result.changes).toBe(0);
      });

      it('should handle cascade deletion', async () => {
        // Mock transaction that deletes user and related data
        mockDb.serialize.mockImplementation((callback) => {
          callback?.call(mockDb);
          return mockDb;
        });

        mockDb.run
          .mockImplementationOnce((sql, params, callback) => {
            // Delete pets
            callback?.call({ changes: 2 }, null);
            return mockDb;
          })
          .mockImplementationOnce((sql, params, callback) => {
            // Delete bookings
            callback?.call({ changes: 3 }, null);
            return mockDb;
          })
          .mockImplementationOnce((sql, params, callback) => {
            // Delete user
            callback?.call({ changes: 1 }, null);
            return mockDb;
          });

        const result = await deleteUserWithCascade(mockDb, '1');

        expect(result.userDeleted).toBe(1);
        expect(result.petsDeleted).toBe(2);
        expect(result.bookingsDeleted).toBe(3);
      });
    });
  });

  describe('Pet CRUD Operations', () => {
    const mockPet = {
      id: '1',
      user_id: '1',
      name: 'Buddy',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: '3',
      weight: '65',
      size: 'Large',
      color: 'Golden',
      description: 'Friendly dog',
      photo_url: 'https://example.com/buddy.jpg',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    describe('CREATE Pet', () => {
      it('should insert pet successfully', async () => {
        mockDb.run.mockImplementation((sql, params, callback) => {
          callback?.call({ lastID: 1, changes: 1 }, null);
          return mockDb;
        });

        const petData = {
          user_id: '1',
          name: 'Buddy',
          species: 'Dog',
          breed: 'Golden Retriever',
          age: '3',
          weight: '65',
          size: 'Large',
          color: 'Golden',
          description: 'Friendly dog',
          photo_url: 'https://example.com/buddy.jpg',
        };

        const result = await insertPet(mockDb, petData);

        expect(mockDb.run).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO pets'),
          expect.arrayContaining([
            petData.user_id,
            petData.name,
            petData.species,
            petData.breed,
            petData.age,
            petData.weight,
            petData.size,
            petData.color,
            petData.description,
            petData.photo_url
          ]),
          expect.any(Function)
        );

        expect(result.id).toBe(1);
      });

      it('should validate pet data', async () => {
        const invalidPetData = {
          user_id: '',
          name: '',
          species: '',
        };

        await expect(insertPet(mockDb, invalidPetData as any)).rejects.toThrow('Validation error');
      });

      it('should handle foreign key constraint', async () => {
        mockDb.run.mockImplementation((sql, params, callback) => {
          const error = new Error('FOREIGN KEY constraint failed');
          error.name = 'SQLITE_CONSTRAINT';
          callback?.call(mockDb, error);
          return mockDb;
        });

        const petData = {
          user_id: '999', // Non-existent user
          name: 'Buddy',
          species: 'Dog',
        };

        await expect(insertPet(mockDb, petData as any)).rejects.toThrow('FOREIGN KEY constraint failed');
      });
    });

    describe('READ Pet Operations', () => {
      it('should get all pets for user', async () => {
        const mockPets = [mockPet, { ...mockPet, id: '2', name: 'Whiskers' }];

        mockDb.all.mockImplementation((sql, params, callback) => {
          callback?.call(mockDb, null, mockPets);
          return mockDb;
        });

        const result = await getAllPets(mockDb, '1');

        expect(mockDb.all).toHaveBeenCalledWith(
          expect.stringContaining('SELECT * FROM pets WHERE user_id = ?'),
          ['1'],
          expect.any(Function)
        );

        expect(result).toEqual(mockPets);
        expect(result).toHaveLength(2);
      });

      it('should get pet by ID', async () => {
        mockDb.get.mockImplementation((sql, params, callback) => {
          callback?.call(mockDb, null, mockPet);
          return mockDb;
        });

        const result = await getPet(mockDb, '1');

        expect(result).toEqual(mockPet);
      });

      it('should return empty array for user with no pets', async () => {
        mockDb.all.mockImplementation((sql, params, callback) => {
          callback?.call(mockDb, null, []);
          return mockDb;
        });

        const result = await getAllPets(mockDb, '999');

        expect(result).toEqual([]);
      });

      it('should get pets with medical history', async () => {
        const petWithMedical = {
          ...mockPet,
          medical_records: [
            {
              id: '1',
              title: 'Annual Checkup',
              visit_date: '2024-01-15',
              vet_name: 'Dr. Johnson',
            }
          ]
        };

        mockDb.all.mockImplementation((sql, params, callback) => {
          callback?.call(mockDb, null, [petWithMedical]);
          return mockDb;
        });

        const result = await getPetsWithMedicalHistory(mockDb, '1');

        expect(result[0].medical_records).toBeDefined();
        expect(result[0].medical_records).toHaveLength(1);
      });
    });

    describe('UPDATE Pet', () => {
      it('should update pet successfully', async () => {
        mockDb.run.mockImplementation((sql, params, callback) => {
          callback?.call({ changes: 1 }, null);
          return mockDb;
        });

        const updateData = {
          name: 'Buddy Updated',
          weight: '70',
        };

        const result = await updatePet(mockDb, '1', updateData);

        expect(mockDb.run).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE pets SET'),
          expect.arrayContaining([
            updateData.name,
            updateData.weight,
            expect.any(String), // updated_at timestamp
            '1'
          ]),
          expect.any(Function)
        );

        expect(result.changes).toBe(1);
      });

      it('should validate update data', async () => {
        const invalidUpdate = { weight: '-10' };

        await expect(updatePet(mockDb, '1', invalidUpdate)).rejects.toThrow('Validation error');
      });
    });

    describe('DELETE Pet', () => {
      it('should delete pet successfully', async () => {
        mockDb.run.mockImplementation((sql, params, callback) => {
          callback?.call({ changes: 1 }, null);
          return mockDb;
        });

        const result = await deletePet(mockDb, '1');

        expect(result.changes).toBe(1);
      });

      it('should handle cascade deletion of pet records', async () => {
        mockDb.serialize.mockImplementation((callback) => {
          callback?.call(mockDb);
          return mockDb;
        });

        mockDb.run
          .mockImplementationOnce((sql, params, callback) => {
            // Delete medical records
            callback?.call({ changes: 3 }, null);
            return mockDb;
          })
          .mockImplementationOnce((sql, params, callback) => {
            // Delete bookings
            callback?.call({ changes: 2 }, null);
            return mockDb;
          })
          .mockImplementationOnce((sql, params, callback) => {
            // Delete pet
            callback?.call({ changes: 1 }, null);
            return mockDb;
          });

        const result = await deletePetWithCascade(mockDb, '1');

        expect(result.petDeleted).toBe(1);
        expect(result.medicalRecordsDeleted).toBe(3);
        expect(result.bookingsDeleted).toBe(2);
      });
    });
  });

  describe('Booking CRUD Operations', () => {
    const mockBooking = {
      id: '1',
      user_id: '1',
      pet_id: '1',
      service_name: 'Pet Transport',
      pickup_address: '123 Main St',
      dropoff_address: '456 Oak Ave',
      scheduled_date: '2024-01-20',
      scheduled_time: '10:00:00',
      status: 'confirmed',
      price: 25.00,
      notes: 'Handle with care',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    describe('CREATE Booking', () => {
      it('should insert booking successfully', async () => {
        mockDb.run.mockImplementation((sql, params, callback) => {
          callback?.call({ lastID: 1, changes: 1 }, null);
          return mockDb;
        });

        const bookingData = {
          user_id: '1',
          pet_id: '1',
          service_name: 'Pet Transport',
          pickup_address: '123 Main St',
          dropoff_address: '456 Oak Ave',
          scheduled_date: '2024-01-20',
          scheduled_time: '10:00:00',
          status: 'pending',
          price: 25.00,
          notes: 'Handle with care',
        };

        const result = await insertBooking(mockDb, bookingData);

        expect(result.id).toBe(1);
      });

      it('should validate booking time slots', async () => {
        // Mock existing booking check
        mockDb.get.mockImplementation((sql, params, callback) => {
          callback?.call(mockDb, null, mockBooking); // Conflicting booking exists
          return mockDb;
        });

        const conflictingBooking = {
          user_id: '1',
          pet_id: '1',
          service_name: 'Pet Transport',
          scheduled_date: '2024-01-20',
          scheduled_time: '10:00:00', // Same time
        };

        await expect(insertBooking(mockDb, conflictingBooking as any))
          .rejects.toThrow('Time slot not available');
      });

      it('should validate booking date is in future', async () => {
        const pastBooking = {
          user_id: '1',
          pet_id: '1',
          scheduled_date: '2020-01-01',
          scheduled_time: '10:00:00',
        };

        await expect(insertBooking(mockDb, pastBooking as any))
          .rejects.toThrow('Cannot book for past dates');
      });
    });

    describe('READ Booking Operations', () => {
      it('should get all bookings for user', async () => {
        const mockBookings = [mockBooking, { ...mockBooking, id: '2' }];

        mockDb.all.mockImplementation((sql, params, callback) => {
          callback?.call(mockDb, null, mockBookings);
          return mockDb;
        });

        const result = await getAllBookings(mockDb, '1');

        expect(result).toEqual(mockBookings);
      });

      it('should get bookings with filters', async () => {
        const filteredBookings = [mockBooking];

        mockDb.all.mockImplementation((sql, params, callback) => {
          callback?.call(mockDb, null, filteredBookings);
          return mockDb;
        });

        const filters = {
          status: 'confirmed',
          date_range: {
            start: '2024-01-01',
            end: '2024-01-31'
          }
        };

        const result = await getBookingsWithFilters(mockDb, '1', filters);

        expect(mockDb.all).toHaveBeenCalledWith(
          expect.stringContaining('WHERE user_id = ? AND status = ? AND scheduled_date BETWEEN ? AND ?'),
          ['1', 'confirmed', '2024-01-01', '2024-01-31'],
          expect.any(Function)
        );
      });

      it('should get booking with pet and user details', async () => {
        const detailedBooking = {
          ...mockBooking,
          pet_name: 'Buddy',
          pet_species: 'Dog',
          user_name: 'John Doe',
          user_phone: '+1234567890',
        };

        mockDb.get.mockImplementation((sql, params, callback) => {
          callback?.call(mockDb, null, detailedBooking);
          return mockDb;
        });

        const result = await getBookingWithDetails(mockDb, '1');

        expect(result.pet_name).toBe('Buddy');
        expect(result.user_name).toBe('John Doe');
      });
    });

    describe('UPDATE Booking', () => {
      it('should update booking status', async () => {
        mockDb.run.mockImplementation((sql, params, callback) => {
          callback?.call({ changes: 1 }, null);
          return mockDb;
        });

        const result = await updateBookingStatus(mockDb, '1', 'in_progress');

        expect(mockDb.run).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE bookings SET status = ?'),
          ['in_progress', expect.any(String), '1'],
          expect.any(Function)
        );

        expect(result.changes).toBe(1);
      });

      it('should validate status transitions', async () => {
        // Mock current booking status
        mockDb.get.mockImplementation((sql, params, callback) => {
          callback?.call(mockDb, null, { ...mockBooking, status: 'completed' });
          return mockDb;
        });

        await expect(updateBookingStatus(mockDb, '1', 'cancelled'))
          .rejects.toThrow('Cannot cancel completed booking');
      });

      it('should reschedule booking', async () => {
        mockDb.run.mockImplementation((sql, params, callback) => {
          callback?.call({ changes: 1 }, null);
          return mockDb;
        });

        const newSchedule = {
          scheduled_date: '2024-01-21',
          scheduled_time: '14:00:00'
        };

        const result = await rescheduleBooking(mockDb, '1', newSchedule);

        expect(result.changes).toBe(1);
      });
    });

    describe('DELETE Booking', () => {
      it('should cancel booking (soft delete)', async () => {
        mockDb.run.mockImplementation((sql, params, callback) => {
          callback?.call({ changes: 1 }, null);
          return mockDb;
        });

        const result = await cancelBooking(mockDb, '1');

        expect(mockDb.run).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE bookings SET status = ?'),
          ['cancelled', expect.any(String), '1'],
          expect.any(Function)
        );

        expect(result.changes).toBe(1);
      });

      it('should hard delete booking', async () => {
        mockDb.run.mockImplementation((sql, params, callback) => {
          callback?.call({ changes: 1 }, null);
          return mockDb;
        });

        const result = await deleteBooking(mockDb, '1');

        expect(mockDb.run).toHaveBeenCalledWith(
          expect.stringContaining('DELETE FROM bookings WHERE id = ?'),
          ['1'],
          expect.any(Function)
        );

        expect(result.changes).toBe(1);
      });
    });
  });

  describe('Medical Records CRUD Operations', () => {
    const mockMedicalRecord = {
      id: '1',
      pet_id: '1',
      title: 'Annual Checkup',
      description: 'Routine health examination',
      diagnosis: 'Healthy',
      treatment: 'No treatment needed',
      medications: 'None',
      cost: 150.00,
      vet_name: 'Dr. Johnson',
      vet_clinic: 'Happy Paws Veterinary',
      visit_date: '2024-01-15',
      next_visit: '2024-07-15',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    };

    describe('CREATE Medical Record', () => {
      it('should insert medical record successfully', async () => {
        mockDb.run.mockImplementation((sql, params, callback) => {
          callback?.call({ lastID: 1, changes: 1 }, null);
          return mockDb;
        });

        const recordData = {
          pet_id: '1',
          title: 'Annual Checkup',
          description: 'Routine health examination',
          diagnosis: 'Healthy',
          treatment: 'No treatment needed',
          medications: 'None',
          cost: 150.00,
          vet_name: 'Dr. Johnson',
          vet_clinic: 'Happy Paws Veterinary',
          visit_date: '2024-01-15',
          next_visit: '2024-07-15',
        };

        const result = await insertMedicalRecord(mockDb, recordData);

        expect(result.id).toBe(1);
      });

      it('should validate medical record data', async () => {
        const invalidRecord = {
          pet_id: '',
          title: '',
          visit_date: 'invalid-date',
        };

        await expect(insertMedicalRecord(mockDb, invalidRecord as any))
          .rejects.toThrow('Validation error');
      });
    });

    describe('READ Medical Record Operations', () => {
      it('should get all medical records for pet', async () => {
        const mockRecords = [mockMedicalRecord, { ...mockMedicalRecord, id: '2' }];

        mockDb.all.mockImplementation((sql, params, callback) => {
          callback?.call(mockDb, null, mockRecords);
          return mockDb;
        });

        const result = await getAllMedicalRecords(mockDb, '1');

        expect(result).toEqual(mockRecords);
      });

      it('should get medical record by ID', async () => {
        mockDb.get.mockImplementation((sql, params, callback) => {
          callback?.call(mockDb, null, mockMedicalRecord);
          return mockDb;
        });

        const result = await getMedicalRecord(mockDb, '1');

        expect(result).toEqual(mockMedicalRecord);
      });

      it('should get medical records by date range', async () => {
        mockDb.all.mockImplementation((sql, params, callback) => {
          callback?.call(mockDb, null, [mockMedicalRecord]);
          return mockDb;
        });

        const result = await getMedicalRecordsByDateRange(
          mockDb, 
          '1', 
          '2024-01-01', 
          '2024-01-31'
        );

        expect(mockDb.all).toHaveBeenCalledWith(
          expect.stringContaining('WHERE pet_id = ? AND visit_date BETWEEN ? AND ?'),
          ['1', '2024-01-01', '2024-01-31'],
          expect.any(Function)
        );
      });
    });

    describe('UPDATE Medical Record', () => {
      it('should update medical record successfully', async () => {
        mockDb.run.mockImplementation((sql, params, callback) => {
          callback?.call({ changes: 1 }, null);
          return mockDb;
        });

        const updateData = {
          diagnosis: 'Minor ear infection',
          treatment: 'Antibiotic drops prescribed',
          medications: 'Otomax drops',
        };

        const result = await updateMedicalRecord(mockDb, '1', updateData);

        expect(result.changes).toBe(1);
      });
    });

    describe('DELETE Medical Record', () => {
      it('should delete medical record successfully', async () => {
        mockDb.run.mockImplementation((sql, params, callback) => {
          callback?.call({ changes: 1 }, null);
          return mockDb;
        });

        const result = await deleteMedicalRecord(mockDb, '1');

        expect(result.changes).toBe(1);
      });
    });
  });

  describe('Review CRUD Operations', () => {
    const mockReview = {
      id: '1',
      booking_id: '1',
      user_id: '1',
      pilot_id: 'pilot-1',
      rating: 5,
      comment: 'Excellent service!',
      created_at: '2024-01-20T15:00:00Z',
    };

    describe('CREATE Review', () => {
      it('should insert review successfully', async () => {
        mockDb.run.mockImplementation((sql, params, callback) => {
          callback?.call({ lastID: 1, changes: 1 }, null);
          return mockDb;
        });

        const reviewData = {
          booking_id: '1',
          user_id: '1',
          pilot_id: 'pilot-1',
          rating: 5,
          comment: 'Excellent service!',
        };

        const result = await insertReview(mockDb, reviewData);

        expect(result.id).toBe(1);
      });

      it('should prevent duplicate reviews', async () => {
        mockDb.get.mockImplementation((sql, params, callback) => {
          callback?.call(mockDb, null, mockReview); // Existing review
          return mockDb;
        });

        const duplicateReview = {
          booking_id: '1',
          user_id: '1',
          pilot_id: 'pilot-1',
          rating: 4,
          comment: 'Duplicate review',
        };

        await expect(insertReview(mockDb, duplicateReview))
          .rejects.toThrow('Review already exists for this booking');
      });

      it('should validate review rating', async () => {
        const invalidReview = {
          booking_id: '1',
          user_id: '1',
          pilot_id: 'pilot-1',
          rating: 6, // Invalid rating
          comment: 'Invalid rating',
        };

        await expect(insertReview(mockDb, invalidReview))
          .rejects.toThrow('Rating must be between 1 and 5');
      });
    });

    describe('READ Review Operations', () => {
      it('should get reviews by pilot', async () => {
        const pilotReviews = [mockReview, { ...mockReview, id: '2' }];

        mockDb.all.mockImplementation((sql, params, callback) => {
          callback?.call(mockDb, null, pilotReviews);
          return mockDb;
        });

        const result = await getReviewsByPilot(mockDb, 'pilot-1');

        expect(result).toEqual(pilotReviews);
      });

      it('should calculate pilot rating statistics', async () => {
        const reviews = [
          { ...mockReview, rating: 5 },
          { ...mockReview, id: '2', rating: 4 },
          { ...mockReview, id: '3', rating: 5 },
        ];

        mockDb.all.mockImplementation((sql, params, callback) => {
          callback?.call(mockDb, null, reviews);
          return mockDb;
        });

        const result = await getPilotRatingStats(mockDb, 'pilot-1');

        expect(result.averageRating).toBeCloseTo(4.67, 2);
        expect(result.totalReviews).toBe(3);
        expect(result.ratingDistribution[5]).toBe(2);
        expect(result.ratingDistribution[4]).toBe(1);
      });
    });
  });

  describe('Database Transactions', () => {
    it('should execute transaction successfully', async () => {
      mockDb.serialize.mockImplementation((callback) => {
        callback?.call(mockDb);
        return mockDb;
      });

      mockDb.run.mockImplementation((sql, params, callback) => {
        callback?.call({ changes: 1 }, null);
        return mockDb;
      });

      const transactionOperations = [
        () => insertUser(mockDb, { name: 'John', email: 'john@test.com' }),
        () => insertPet(mockDb, { user_id: '1', name: 'Buddy', species: 'Dog' }),
      ];

      const result = await executeTransaction(mockDb, transactionOperations);

      expect(result.success).toBe(true);
      expect(mockDb.serialize).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      mockDb.serialize.mockImplementation((callback) => {
        callback?.call(mockDb);
        return mockDb;
      });

      mockDb.run
        .mockImplementationOnce((sql, params, callback) => {
          callback?.call({ changes: 1 }, null); // First operation succeeds
          return mockDb;
        })
        .mockImplementationOnce((sql, params, callback) => {
          callback?.call(mockDb, new Error('Second operation fails')); // Second fails
          return mockDb;
        });

      const transactionOperations = [
        () => insertUser(mockDb, { name: 'John', email: 'john@test.com' }),
        () => insertPet(mockDb, { user_id: '999', name: 'Buddy', species: 'Dog' }),
      ];

      await expect(executeTransaction(mockDb, transactionOperations))
        .rejects.toThrow('Transaction failed');
    });
  });

  describe('Database Migrations', () => {
    it('should run migrations successfully', async () => {
      mockDb.get
        .mockImplementationOnce((sql, callback) => {
          callback?.call(mockDb, null, undefined); // No migrations table
          return mockDb;
        })
        .mockImplementationOnce((sql, callback) => {
          callback?.call(mockDb, null, { version: 0 }); // Current version
          return mockDb;
        });

      mockDb.run.mockImplementation((sql, callback) => {
        callback?.call(mockDb, null);
        return mockDb;
      });

      const migrations = [
        {
          version: 1,
          up: 'ALTER TABLE users ADD COLUMN avatar_url TEXT',
          down: 'ALTER TABLE users DROP COLUMN avatar_url'
        },
        {
          version: 2,
          up: 'CREATE INDEX idx_pets_user_id ON pets(user_id)',
          down: 'DROP INDEX idx_pets_user_id'
        }
      ];

      await migrateDatabase(mockDb, migrations);

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('ALTER TABLE users ADD COLUMN avatar_url'),
        expect.any(Function)
      );
    });

    it('should skip already applied migrations', async () => {
      mockDb.get.mockImplementation((sql, callback) => {
        callback?.call(mockDb, null, { version: 2 }); // Already at version 2
        return mockDb;
      });

      const migrations = [
        { version: 1, up: 'ALTER TABLE users ADD COLUMN avatar_url TEXT' },
        { version: 2, up: 'CREATE INDEX idx_pets_user_id ON pets(user_id)' }
      ];

      await migrateDatabase(mockDb, migrations);

      expect(mockDb.run).not.toHaveBeenCalledWith(
        expect.stringContaining('ALTER TABLE users ADD COLUMN avatar_url'),
        expect.any(Function)
      );
    });
  });

  describe('Database Backup and Restore', () => {
    it('should create database backup', async () => {
      const mockBackupData = {
        users: [{ id: '1', name: 'John Doe' }],
        pets: [{ id: '1', name: 'Buddy' }],
        bookings: [{ id: '1', status: 'confirmed' }],
      };

      mockDb.all
        .mockImplementationOnce((sql, callback) => {
          callback?.call(mockDb, null, mockBackupData.users);
          return mockDb;
        })
        .mockImplementationOnce((sql, callback) => {
          callback?.call(mockDb, null, mockBackupData.pets);
          return mockDb;
        })
        .mockImplementationOnce((sql, callback) => {
          callback?.call(mockDb, null, mockBackupData.bookings);
          return mockDb;
        });

      const backup = await backupDatabase(mockDb);

      expect(backup.users).toEqual(mockBackupData.users);
      expect(backup.pets).toEqual(mockBackupData.pets);
      expect(backup.bookings).toEqual(mockBackupData.bookings);
      expect(backup.timestamp).toBeDefined();
    });

    it('should restore database from backup', async () => {
      const backupData = {
        users: [{ id: '1', name: 'John Doe' }],
        pets: [{ id: '1', name: 'Buddy' }],
        bookings: [{ id: '1', status: 'confirmed' }],
        timestamp: '2024-01-20T12:00:00Z'
      };

      mockDb.serialize.mockImplementation((callback) => {
        callback?.call(mockDb);
        return mockDb;
      });

      mockDb.run.mockImplementation((sql, callback) => {
        callback?.call(mockDb, null);
        return mockDb;
      });

      await restoreDatabase(mockDb, backupData);

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM users'),
        expect.any(Function)
      );
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.any(Array),
        expect.any(Function)
      );
    });
  });

  describe('Database Performance', () => {
    it('should create indexes for better query performance', async () => {
      mockDb.run.mockImplementation((sql, callback) => {
        callback?.call(mockDb, null);
        return mockDb;
      });

      await createIndexes(mockDb);

      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_pets_user_id'),
        expect.any(Function)
      );
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_bookings_user_id'),
        expect.any(Function)
      );
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_bookings_status'),
        expect.any(Function)
      );
    });

    it('should analyze query performance', async () => {
      const queryPlan = [
        { detail: 'SCAN TABLE pets' },
        { detail: 'USE INDEX idx_pets_user_id' }
      ];

      mockDb.all.mockImplementation((sql, callback) => {
        callback?.call(mockDb, null, queryPlan);
        return mockDb;
      });

      const result = await analyzeQuery(mockDb, 'SELECT * FROM pets WHERE user_id = ?');

      expect(result).toEqual(queryPlan);
      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('EXPLAIN QUERY PLAN'),
        expect.any(Function)
      );
    });
  });
});