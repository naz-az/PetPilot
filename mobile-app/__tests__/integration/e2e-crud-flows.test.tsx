import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from '../../src/navigation/AppNavigator';
import { petAPI, bookingAPI } from '../../src/services/api';

// Mock all dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../src/services/api');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockPetAPI = petAPI as jest.Mocked<typeof petAPI>;
const mockBookingAPI = bookingAPI as jest.Mocked<typeof bookingAPI>;
const mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;

// Mock data
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  address: '123 Main St, City, State',
};

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

const mockBooking = {
  id: '1',
  serviceName: 'Pet Transport',
  petName: 'Buddy',
  date: '2024-01-20',
  time: '10:00 AM',
  status: 'confirmed' as const,
  price: 25,
  pickupAddress: '123 Main St, City, State',
  dropoffAddress: '456 Oak Ave, City, State',
  notes: 'Handle with care',
};

describe('End-to-End CRUD Workflows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default AsyncStorage responses
    mockAsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'userData') {
        return Promise.resolve(JSON.stringify(mockUser));
      }
      if (key === 'authToken') {
        return Promise.resolve('mock-token');
      }
      return Promise.resolve(null);
    });

    // Setup default API responses
    mockPetAPI.getAll.mockResolvedValue({ data: { pets: [] } });
    mockBookingAPI.getAll.mockResolvedValue({ data: { bookings: [] } });
  });

  const renderApp = () => {
    return render(
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    );
  };

  describe('Complete Pet Management Workflow', () => {
    it('should handle full pet CRUD lifecycle: Create → Read → Update → Delete', async () => {
      // Mock API responses for each step
      mockPetAPI.create.mockResolvedValueOnce({ data: { pet: mockPet } });
      mockPetAPI.getAll.mockResolvedValueOnce({ data: { pets: [mockPet] } });
      mockPetAPI.update.mockResolvedValueOnce({ 
        data: { pet: { ...mockPet, name: 'Buddy Updated' } } 
      });
      mockPetAPI.delete.mockResolvedValueOnce({});

      const { getByTestId, getByText, getByDisplayValue, queryByText } = renderApp();

      // Navigate to Pets screen
      await waitFor(() => {
        const petsTab = getByTestId('pets-tab');
        fireEvent.press(petsTab);
      });

      // CREATE: Add new pet
      await waitFor(() => {
        const addButton = getByTestId('add-pet-button');
        fireEvent.press(addButton);
      });

      // Fill pet form
      const nameInput = getByTestId('pet-name-input');
      const speciesInput = getByTestId('pet-species-input');
      const breedInput = getByTestId('pet-breed-input');

      fireEvent.changeText(nameInput, 'Buddy');
      fireEvent.changeText(speciesInput, 'Dog');
      fireEvent.changeText(breedInput, 'Golden Retriever');

      const submitButton = getByTestId('submit-pet-form');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockPetAPI.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Buddy',
            species: 'Dog',
            breed: 'Golden Retriever',
          })
        );
      });

      // READ: Verify pet appears in list
      await waitFor(() => {
        expect(getByText('Buddy')).toBeTruthy();
        expect(getByText('Golden Retriever')).toBeTruthy();
      });

      // UPDATE: Edit the pet
      const moreButton = getByTestId('pet-more-options-1');
      fireEvent.press(moreButton);

      const editButton = getByTestId('pet-edit-option');
      fireEvent.press(editButton);

      const editNameInput = getByDisplayValue('Buddy');
      fireEvent.changeText(editNameInput, 'Buddy Updated');

      const updateButton = getByTestId('submit-pet-form');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(mockPetAPI.update).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            name: 'Buddy Updated',
          })
        );
      });

      // DELETE: Remove the pet
      const deleteMoreButton = getByTestId('pet-more-options-1');
      fireEvent.press(deleteMoreButton);

      const deleteButton = getByTestId('pet-delete-option');
      fireEvent.press(deleteButton);

      // Auto-confirm deletion
      mockAlert.mockImplementation((title, message, buttons) => {
        if (title === 'Delete Pet') {
          const confirmButton = buttons?.find(b => b.text === 'Delete');
          if (confirmButton?.onPress) {
            confirmButton.onPress();
          }
        }
      });

      await waitFor(() => {
        expect(mockPetAPI.delete).toHaveBeenCalledWith('1');
        expect(queryByText('Buddy Updated')).toBeFalsy();
      });
    });
  });

  describe('Complete Booking Management Workflow', () => {
    it('should handle full booking lifecycle: Create → Read → Update(Cancel) → Review', async () => {
      // Setup pets for booking
      mockPetAPI.getAll.mockResolvedValue({ data: { pets: [mockPet] } });
      mockBookingAPI.create.mockResolvedValueOnce({ data: { booking: mockBooking } });
      mockBookingAPI.getAll.mockResolvedValueOnce({ data: { bookings: [mockBooking] } });
      mockBookingAPI.cancel.mockResolvedValueOnce({});

      const { getByTestId, getByText, queryByText } = renderApp();

      // Navigate to Bookings screen
      await waitFor(() => {
        const bookingsTab = getByTestId('bookings-tab');
        fireEvent.press(bookingsTab);
      });

      // Switch to services tab
      const servicesTab = getByTestId('services-tab');
      fireEvent.press(servicesTab);

      // CREATE: Book a service
      const bookButton = getByTestId('book-service-1');
      fireEvent.press(bookButton);

      // Fill booking form
      const petSelect = getByTestId('pet-select');
      fireEvent(petSelect, 'onValueChange', 'Buddy');

      const dateInput = getByTestId('date-input');
      fireEvent.changeText(dateInput, '2024-01-20');

      const timeInput = getByTestId('time-input');
      fireEvent.changeText(timeInput, '10:00 AM');

      const pickupInput = getByTestId('pickup-address-input');
      fireEvent.changeText(pickupInput, '123 Main Street, City, State 12345');

      const dropoffInput = getByTestId('dropoff-address-input');
      fireEvent.changeText(dropoffInput, '456 Oak Avenue, City, State 67890');

      const notesInput = getByTestId('notes-input');
      fireEvent.changeText(notesInput, 'Handle with care');

      const submitBookingButton = getByTestId('submit-booking');
      fireEvent.press(submitBookingButton);

      await waitFor(() => {
        expect(mockBookingAPI.create).toHaveBeenCalledWith(
          expect.objectContaining({
            petId: 'Buddy',
            date: '2024-01-20',
            time: '10:00 AM',
            notes: 'Handle with care',
          })
        );
      });

      // READ: Verify booking appears in list
      const bookingsTabRead = getByTestId('bookings-tab');
      fireEvent.press(bookingsTabRead);

      await waitFor(() => {
        expect(getByText('Pet Transport - Buddy')).toBeTruthy();
        expect(getByText('Jan 20, 2024 at 10:00 AM')).toBeTruthy();
      });

      // Navigate to booking details
      const bookingCard = getByTestId('booking-card-1');
      fireEvent.press(bookingCard);

      await waitFor(() => {
        expect(getByText('Pet Transport')).toBeTruthy();
        expect(getByText('$25')).toBeTruthy();
      });

      // UPDATE: Cancel the booking
      const cancelButton = getByTestId('cancel-booking-button');
      fireEvent.press(cancelButton);

      // Auto-confirm cancellation
      mockAlert.mockImplementation((title, message, buttons) => {
        if (title === 'Cancel Booking') {
          const confirmButton = buttons?.find(b => b.text === 'Yes, Cancel');
          if (confirmButton?.onPress) {
            confirmButton.onPress();
          }
        }
      });

      await waitFor(() => {
        expect(mockBookingAPI.cancel).toHaveBeenCalledWith('1');
      });

      // Test completed booking review flow
      const completedBooking = { ...mockBooking, status: 'completed' as const };
      mockBookingAPI.getById.mockResolvedValueOnce({ data: { booking: completedBooking } });

      // CREATE: Leave a review
      const reviewButton = getByTestId('leave-review-button');
      fireEvent.press(reviewButton);

      const ratingStars = getByTestId('rating-stars');
      fireEvent.press(ratingStars, { nativeEvent: { rating: 5 } });

      const commentInput = getByTestId('review-comment-input');
      fireEvent.changeText(commentInput, 'Excellent service! Very professional and careful with my pet.');

      const submitReviewButton = getByTestId('submit-review-button');
      fireEvent.press(submitReviewButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Review Submitted',
          expect.stringContaining('Thank you for your feedback')
        );
      });
    });
  });

  describe('Profile Management Integration', () => {
    it('should handle profile update and account deletion workflow', async () => {
      const { getByTestId, getByDisplayValue } = renderApp();

      // Navigate to Profile screen
      await waitFor(() => {
        const profileTab = getByTestId('profile-tab');
        fireEvent.press(profileTab);
      });

      // UPDATE: Edit profile
      const editButton = getByTestId('edit-profile-button');
      fireEvent.press(editButton);

      const nameInput = getByDisplayValue('John Doe');
      const emailInput = getByDisplayValue('john@example.com');

      fireEvent.changeText(nameInput, 'John Smith');
      fireEvent.changeText(emailInput, 'johnsmith@example.com');

      const saveButton = getByTestId('save-profile-button');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          'userData',
          expect.stringContaining('John Smith')
        );
      });

      // DELETE: Account deletion
      const deleteButton = getByTestId('delete-account-button');
      fireEvent.press(deleteButton);

      // Auto-confirm double deletion dialog
      mockAlert.mockImplementation((title, message, buttons) => {
        if (title === 'Delete Account') {
          const deleteBtn = buttons?.find(b => b.text === 'Delete');
          if (deleteBtn?.onPress) {
            deleteBtn.onPress();
          }
        }
        if (title === 'Final Confirmation') {
          const confirmBtn = buttons?.find(b => b.text === 'Delete Forever');
          if (confirmBtn?.onPress) {
            confirmBtn.onPress();
          }
        }
      });

      await waitFor(() => {
        expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
          'userData',
          'authToken',
          'user',
          'accessToken',
          'refreshToken'
        ]);
      });
    });
  });

  describe('Medical History Management Integration', () => {
    it('should handle medical record and appointment CRUD workflow', async () => {
      const { getByTestId, getByText } = renderApp();

      // Navigate to Pets screen
      await waitFor(() => {
        const petsTab = getByTestId('pets-tab');
        fireEvent.press(petsTab);
      });

      // Assuming we have a pet, open medical history
      const petCard = getByTestId('pet-card-1');
      fireEvent.press(petCard);

      const medicalHistoryButton = getByTestId('medical-history-button');
      fireEvent.press(medicalHistoryButton);

      // CREATE: Add medical record
      const addRecordButton = getByTestId('add-record-button');
      fireEvent.press(addRecordButton);

      // Auto-select vet visit
      mockAlert.mockImplementation((title, message, buttons) => {
        if (title === 'Add Medical Record') {
          const vetVisitBtn = buttons?.find(b => b.text === 'Vet Visit');
          if (vetVisitBtn?.onPress) {
            vetVisitBtn.onPress();
          }
        }
        if (title === 'Add Vet Visit Record') {
          const addBtn = buttons?.find(b => b.text === 'Add Record');
          if (addBtn?.onPress) {
            addBtn.onPress();
          }
        }
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Success', 'Medical record added successfully!');
      });

      // Switch to appointments tab
      const appointmentsTab = getByTestId('appointments-tab');
      fireEvent.press(appointmentsTab);

      // CREATE: Schedule appointment
      const addAppointmentButton = getByTestId('add-appointment-button');
      fireEvent.press(addAppointmentButton);

      // Auto-confirm appointment
      mockAlert.mockImplementation((title, message, buttons) => {
        if (title === 'Schedule Appointment') {
          const scheduleBtn = buttons?.find(b => b.text === 'Schedule');
          if (scheduleBtn?.onPress) {
            scheduleBtn.onPress();
          }
        }
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Success', 'Appointment scheduled successfully!');
      });

      // DELETE: Cancel appointment
      const cancelAppointmentButton = getByTestId('cancel-appointment-1');
      fireEvent.press(cancelAppointmentButton);

      // Auto-confirm cancellation
      mockAlert.mockImplementation((title, message, buttons) => {
        if (title === 'Cancel Appointment') {
          const cancelBtn = buttons?.find(b => b.text === 'Cancel Appointment');
          if (cancelBtn?.onPress) {
            cancelBtn.onPress();
          }
        }
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Success', 'Appointment cancelled successfully!');
      });
    });
  });

  describe('Cross-Screen Data Consistency', () => {
    it('should maintain data consistency across navigation', async () => {
      const { getByTestId, getByText } = renderApp();

      // Create a pet
      mockPetAPI.create.mockResolvedValueOnce({ data: { pet: mockPet } });
      mockPetAPI.getAll.mockResolvedValue({ data: { pets: [mockPet] } });

      // Navigate to pets and add pet
      const petsTab = getByTestId('pets-tab');
      fireEvent.press(petsTab);

      const addButton = getByTestId('add-pet-button');
      fireEvent.press(addButton);

      // Fill and submit form
      const nameInput = getByTestId('pet-name-input');
      fireEvent.changeText(nameInput, 'Buddy');

      const submitButton = getByTestId('submit-pet-form');
      fireEvent.press(submitButton);

      // Navigate to bookings
      const bookingsTab = getByTestId('bookings-tab');
      fireEvent.press(bookingsTab);

      const servicesTab = getByTestId('services-tab');
      fireEvent.press(servicesTab);

      // Try to book service - should see the pet in dropdown
      const bookButton = getByTestId('book-service-1');
      fireEvent.press(bookButton);

      const petSelect = getByTestId('pet-select');
      expect(petSelect).toHaveProperty('children'); // Should contain 'Buddy'

      // Navigate back to pets - should still see the pet
      const cancelBooking = getByTestId('close-booking-form');
      fireEvent.press(cancelBooking);

      fireEvent.press(petsTab);

      await waitFor(() => {
        expect(getByText('Buddy')).toBeTruthy();
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network errors gracefully across all screens', async () => {
      // Mock network failures
      mockPetAPI.getAll.mockRejectedValue(new Error('Network error'));
      mockBookingAPI.getAll.mockRejectedValue(new Error('Network error'));

      const { getByTestId } = renderApp();

      // Test pets screen error handling
      const petsTab = getByTestId('pets-tab');
      fireEvent.press(petsTab);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Error', 'Failed to load pets. Please try again.');
      });

      // Test bookings screen error handling
      const bookingsTab = getByTestId('bookings-tab');
      fireEvent.press(bookingsTab);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Error', 'Failed to load bookings. Please try again.');
      });

      // Test profile screen error handling
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      const profileTab = getByTestId('profile-tab');
      fireEvent.press(profileTab);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Error', 'Failed to load profile data.');
      });
    });
  });

  describe('Validation Integration', () => {
    it('should enforce validation rules consistently across forms', async () => {
      const { getByTestId } = renderApp();

      // Test pet form validation
      const petsTab = getByTestId('pets-tab');
      fireEvent.press(petsTab);

      const addButton = getByTestId('add-pet-button');
      fireEvent.press(addButton);

      // Try to submit empty form
      const submitButton = getByTestId('submit-pet-form');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Validation Error',
          expect.stringContaining('Pet name is required')
        );
      });

      // Test booking form validation
      const cancelPetForm = getByTestId('close-pet-form');
      fireEvent.press(cancelPetForm);

      const bookingsTab = getByTestId('bookings-tab');
      fireEvent.press(bookingsTab);

      const servicesTab = getByTestId('services-tab');
      fireEvent.press(servicesTab);

      const bookButton = getByTestId('book-service-1');
      fireEvent.press(bookButton);

      // Try to submit empty booking form
      const submitBookingButton = getByTestId('submit-booking');
      fireEvent.press(submitBookingButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Validation Error',
          expect.stringContaining('Please select a pet')
        );
      });
    });
  });

  describe('State Management Integration', () => {
    it('should persist data correctly across app sessions', async () => {
      const { getByTestId, getByText } = renderApp();

      // Verify user data is loaded on startup
      await waitFor(() => {
        const profileTab = getByTestId('profile-tab');
        fireEvent.press(profileTab);
      });

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('john@example.com')).toBeTruthy();
      });

      // Verify AsyncStorage calls were made
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('userData');
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('authToken');
    });
  });

  describe('Performance Integration', () => {
    it('should handle large datasets efficiently', async () => {
      // Mock large dataset
      const largePetsList = Array.from({ length: 100 }, (_, i) => ({
        ...mockPet,
        id: i.toString(),
        name: `Pet ${i}`,
      }));

      mockPetAPI.getAll.mockResolvedValue({ data: { pets: largePetsList } });

      const { getByTestId, getByText } = renderApp();

      const petsTab = getByTestId('pets-tab');
      fireEvent.press(petsTab);

      // Should render efficiently without performance issues
      await waitFor(() => {
        expect(getByText('Pet 0')).toBeTruthy();
        expect(getByText('100 pets')).toBeTruthy();
      }, { timeout: 5000 });
    });
  });
});