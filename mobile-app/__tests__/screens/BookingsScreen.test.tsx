import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import BookingsScreen from '../../src/screens/BookingsScreen';
import { bookingAPI } from '../../src/services/api';

// Mock dependencies
jest.mock('../../src/services/api');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

const mockBookingAPI = bookingAPI as jest.Mocked<typeof bookingAPI>;
const mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
const mockNavigation = {
  navigate: jest.fn(),
};

const mockServices = [
  {
    id: '1',
    name: 'Pet Transport',
    description: 'Safe and comfortable transportation for your pet',
    price: 25,
    duration: 30,
    icon: 'car-outline',
    category: 'Transport',
    available: true,
  },
  {
    id: '2',
    name: 'Vet Visit',
    description: 'Express transport to veterinary appointments',
    price: 35,
    duration: 45,
    icon: 'medical-outline',
    category: 'Medical',
    available: true,
  },
  {
    id: '3',
    name: 'Emergency Transport',
    description: 'Priority emergency transportation',
    price: 50,
    duration: 20,
    icon: 'flash-outline',
    category: 'Emergency',
    available: false,
  },
];

const mockBookings = [
  {
    id: '1',
    serviceName: 'Vet Visit',
    petName: 'Buddy',
    date: '2024-01-15',
    time: '10:00 AM',
    status: 'confirmed' as const,
    price: 35,
    pickupAddress: '123 Main St, City',
    dropoffAddress: 'Happy Paws Vet Clinic',
    notes: 'Annual checkup',
  },
  {
    id: '2',
    serviceName: 'Pet Transport',
    petName: 'Whiskers',
    date: '2024-01-16',
    time: '2:30 PM',
    status: 'pending' as const,
    price: 25,
    pickupAddress: '123 Main St, City',
    dropoffAddress: '789 Park Blvd',
    notes: '',
  },
  {
    id: '3',
    serviceName: 'Emergency Transport',
    petName: 'Max',
    date: '2024-01-10',
    time: '3:15 PM',
    status: 'completed' as const,
    price: 50,
    pickupAddress: '123 Main St, City',
    dropoffAddress: 'Emergency Vet Clinic',
    notes: 'Emergency visit',
  },
];

const mockPets = [
  { id: '1', name: 'Buddy', species: 'Dog' },
  { id: '2', name: 'Whiskers', species: 'Cat' },
];

describe('BookingsScreen CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBookingAPI.getAll.mockClear();
    mockBookingAPI.create.mockClear();
    mockBookingAPI.cancel.mockClear();
  });

  describe('CREATE Operations', () => {
    it('should open booking form when service book button is pressed', async () => {
      const { getByTestId, getByText } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      // Switch to services tab
      const servicesTab = getByTestId('services-tab');
      fireEvent.press(servicesTab);

      await waitFor(() => {
        expect(getByText('Pet Transport')).toBeTruthy();
      });

      const bookButton = getByTestId('book-service-1');
      fireEvent.press(bookButton);

      await waitFor(() => {
        expect(getByText('Book Service')).toBeTruthy();
      });
    });

    it('should create booking successfully with valid data', async () => {
      const newBooking = {
        id: '4',
        serviceName: 'Pet Transport',
        petName: 'Buddy',
        date: '2024-01-20',
        time: '9:00 AM',
        status: 'pending' as const,
        price: 25,
        pickupAddress: '456 Oak St',
        dropoffAddress: '789 Pine Ave',
        notes: 'Handle with care',
      };

      mockBookingAPI.create.mockResolvedValueOnce({
        data: { booking: newBooking }
      });

      const { getByTestId, getByDisplayValue } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      // Open booking form
      const servicesTab = getByTestId('services-tab');
      fireEvent.press(servicesTab);

      const bookButton = getByTestId('book-service-1');
      fireEvent.press(bookButton);

      // Fill form
      const petSelect = getByTestId('pet-select');
      fireEvent(petSelect, 'onValueChange', 'Buddy');

      const dateInput = getByTestId('date-input');
      fireEvent.changeText(dateInput, '2024-01-20');

      const timeInput = getByTestId('time-input');
      fireEvent.changeText(timeInput, '9:00 AM');

      const pickupInput = getByTestId('pickup-address-input');
      fireEvent.changeText(pickupInput, '456 Oak St, City, State');

      const dropoffInput = getByTestId('dropoff-address-input');
      fireEvent.changeText(dropoffInput, '789 Pine Ave, City, State');

      const notesInput = getByTestId('notes-input');
      fireEvent.changeText(notesInput, 'Handle with care');

      // Submit booking
      const submitButton = getByTestId('submit-booking');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Booking Confirmed',
          'Your booking has been submitted successfully. You will receive a confirmation shortly.',
          expect.any(Array)
        );
      });
    });

    it('should validate required fields during booking creation', async () => {
      const { getByTestId } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      // Open booking form
      const servicesTab = getByTestId('services-tab');
      fireEvent.press(servicesTab);

      const bookButton = getByTestId('book-service-1');
      fireEvent.press(bookButton);

      // Try to submit without filling required fields
      const submitButton = getByTestId('submit-booking');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Validation Error',
          expect.stringContaining('Please select a pet')
        );
      });
    });

    it('should validate address fields properly', async () => {
      const { getByTestId } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      // Open booking form
      const servicesTab = getByTestId('services-tab');
      fireEvent.press(servicesTab);

      const bookButton = getByTestId('book-service-1');
      fireEvent.press(bookButton);

      // Fill form with short addresses
      const petSelect = getByTestId('pet-select');
      fireEvent(petSelect, 'onValueChange', 'Buddy');

      const dateInput = getByTestId('date-input');
      fireEvent.changeText(dateInput, '2024-01-20');

      const timeInput = getByTestId('time-input');
      fireEvent.changeText(timeInput, '9:00 AM');

      const pickupInput = getByTestId('pickup-address-input');
      fireEvent.changeText(pickupInput, 'Short'); // Too short

      const dropoffInput = getByTestId('dropoff-address-input');
      fireEvent.changeText(dropoffInput, 'Short'); // Too short

      const submitButton = getByTestId('submit-booking');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Validation Error',
          expect.stringContaining('complete pickup address')
        );
      });
    });

    it('should validate that pickup and dropoff addresses are different', async () => {
      const { getByTestId } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      // Open booking form
      const servicesTab = getByTestId('services-tab');
      fireEvent.press(servicesTab);

      const bookButton = getByTestId('book-service-1');
      fireEvent.press(bookButton);

      // Fill form with same addresses
      const petSelect = getByTestId('pet-select');
      fireEvent(petSelect, 'onValueChange', 'Buddy');

      const dateInput = getByTestId('date-input');
      fireEvent.changeText(dateInput, '2024-01-20');

      const timeInput = getByTestId('time-input');
      fireEvent.changeText(timeInput, '9:00 AM');

      const sameAddress = '123 Main Street, City, State 12345';
      const pickupInput = getByTestId('pickup-address-input');
      fireEvent.changeText(pickupInput, sameAddress);

      const dropoffInput = getByTestId('dropoff-address-input');
      fireEvent.changeText(dropoffInput, sameAddress);

      const submitButton = getByTestId('submit-booking');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Validation Error',
          expect.stringContaining('Pickup and drop-off addresses must be different')
        );
      });
    });

    it('should validate future dates only', async () => {
      const { getByTestId } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      // Open booking form
      const servicesTab = getByTestId('services-tab');
      fireEvent.press(servicesTab);

      const bookButton = getByTestId('book-service-1');
      fireEvent.press(bookButton);

      // Fill form with past date
      const petSelect = getByTestId('pet-select');
      fireEvent(petSelect, 'onValueChange', 'Buddy');

      const dateInput = getByTestId('date-input');
      fireEvent.changeText(dateInput, '2020-01-01'); // Past date

      const timeInput = getByTestId('time-input');
      fireEvent.changeText(timeInput, '9:00 AM');

      const pickupInput = getByTestId('pickup-address-input');
      fireEvent.changeText(pickupInput, '123 Main Street, City, State');

      const dropoffInput = getByTestId('dropoff-address-input');
      fireEvent.changeText(dropoffInput, '456 Oak Avenue, City, State');

      const submitButton = getByTestId('submit-booking');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Validation Error',
          expect.stringContaining('Please select a future date')
        );
      });
    });

    it('should handle service unavailability', async () => {
      const { getByTestId, getByText } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      // Switch to services tab
      const servicesTab = getByTestId('services-tab');
      fireEvent.press(servicesTab);

      await waitFor(() => {
        expect(getByText('Emergency Transport')).toBeTruthy();
      });

      // Try to book unavailable service
      const bookButton = getByTestId('book-service-3'); // Emergency service (unavailable)
      fireEvent.press(bookButton);

      expect(mockAlert).toHaveBeenCalledWith(
        'Service Unavailable',
        'This service is currently not available.'
      );
    });

    it('should prevent booking without pets', async () => {
      const { getByTestId } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      // Mock empty pets list
      const servicesTab = getByTestId('services-tab');
      fireEvent.press(servicesTab);

      const bookButton = getByTestId('book-service-1');
      fireEvent.press(bookButton);

      expect(mockAlert).toHaveBeenCalledWith(
        'No Pets Found',
        'Please add a pet to your profile before booking a service.',
        expect.any(Array)
      );
    });
  });

  describe('READ Operations', () => {
    it('should display services list', async () => {
      const { getByTestId, getByText } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      // Switch to services tab
      const servicesTab = getByTestId('services-tab');
      fireEvent.press(servicesTab);

      await waitFor(() => {
        expect(getByText('Pet Transport')).toBeTruthy();
        expect(getByText('Vet Visit')).toBeTruthy();
        expect(getByText('Emergency Transport')).toBeTruthy();
        expect(getByText('$25')).toBeTruthy();
        expect(getByText('$35')).toBeTruthy();
        expect(getByText('$50')).toBeTruthy();
      });
    });

    it('should display bookings list', async () => {
      const { getByTestId, getByText } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      // Switch to bookings tab
      const bookingsTab = getByTestId('bookings-tab');
      fireEvent.press(bookingsTab);

      await waitFor(() => {
        expect(getByText('Vet Visit - Buddy')).toBeTruthy();
        expect(getByText('Pet Transport - Whiskers')).toBeTruthy();
        expect(getByText('Emergency Transport - Max')).toBeTruthy();
      });
    });

    it('should switch between list and calendar view', async () => {
      const { getByTestId, getByText } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      // Switch to bookings tab
      const bookingsTab = getByTestId('bookings-tab');
      fireEvent.press(bookingsTab);

      await waitFor(() => {
        expect(getByTestId('list-view-button')).toBeTruthy();
        expect(getByTestId('calendar-view-button')).toBeTruthy();
      });

      // Switch to calendar view
      const calendarButton = getByTestId('calendar-view-button');
      fireEvent.press(calendarButton);

      await waitFor(() => {
        expect(getByTestId('calendar-view')).toBeTruthy();
      });

      // Switch back to list view
      const listButton = getByTestId('list-view-button');
      fireEvent.press(listButton);

      await waitFor(() => {
        expect(getByText('Vet Visit - Buddy')).toBeTruthy();
      });
    });

    it('should show empty state when no bookings exist', async () => {
      // Mock empty bookings
      const { getByTestId, getByText } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      const bookingsTab = getByTestId('bookings-tab');
      fireEvent.press(bookingsTab);

      await waitFor(() => {
        expect(getByText('No Bookings Yet')).toBeTruthy();
        expect(getByText('Your bookings will appear here after you book a service')).toBeTruthy();
        expect(getByText('Browse Services')).toBeTruthy();
      });
    });

    it('should handle refresh control', async () => {
      const { getByTestId } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      const scrollView = getByTestId('bookings-scroll-view');
      fireEvent(scrollView, 'refresh');

      // Should trigger data reload
      expect(getByTestId('refresh-control')).toBeTruthy();
    });
  });

  describe('UPDATE Operations', () => {
    it('should cancel booking with confirmation', async () => {
      const { getByTestId } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      // Switch to bookings tab
      const bookingsTab = getByTestId('bookings-tab');
      fireEvent.press(bookingsTab);

      await waitFor(() => {
        const cancelButton = getByTestId('cancel-booking-1');
        fireEvent.press(cancelButton);
      });

      expect(mockAlert).toHaveBeenCalledWith(
        'Cancel Booking',
        expect.stringContaining('Are you sure you want to cancel your Vet Visit booking for Buddy?'),
        expect.any(Array)
      );
    });

    it('should prevent cancelling completed bookings', async () => {
      const { getByTestId } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      // Switch to bookings tab
      const bookingsTab = getByTestId('bookings-tab');
      fireEvent.press(bookingsTab);

      await waitFor(() => {
        const cancelButton = getByTestId('cancel-booking-3'); // Completed booking
        fireEvent.press(cancelButton);
      });

      expect(mockAlert).toHaveBeenCalledWith(
        'Cannot Cancel',
        'This booking cannot be cancelled.'
      );
    });

    it('should update booking status to cancelled when confirmed', async () => {
      // Mock Alert.alert to auto-confirm cancellation
      mockAlert.mockImplementation((title, message, buttons) => {
        if (title === 'Cancel Booking') {
          const cancelButton = buttons?.find(b => b.text === 'Yes, Cancel');
          if (cancelButton?.onPress) {
            cancelButton.onPress();
          }
        }
      });

      const { getByTestId, getByText } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      // Switch to bookings tab
      const bookingsTab = getByTestId('bookings-tab');
      fireEvent.press(bookingsTab);

      await waitFor(() => {
        const cancelButton = getByTestId('cancel-booking-1');
        fireEvent.press(cancelButton);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Booking Cancelled',
          'Your booking has been cancelled successfully.',
          expect.any(Array)
        );
      });
    });

    it('should handle API errors during cancellation', async () => {
      mockBookingAPI.cancel.mockRejectedValueOnce(new Error('Cancel failed'));

      // Mock Alert.alert to auto-confirm cancellation
      mockAlert.mockImplementation((title, message, buttons) => {
        if (title === 'Cancel Booking') {
          const cancelButton = buttons?.find(b => b.text === 'Yes, Cancel');
          if (cancelButton?.onPress) {
            cancelButton.onPress();
          }
        }
      });

      const { getByTestId } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      const bookingsTab = getByTestId('bookings-tab');
      fireEvent.press(bookingsTab);

      await waitFor(() => {
        const cancelButton = getByTestId('cancel-booking-1');
        fireEvent.press(cancelButton);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Error',
          'Failed to cancel booking. Please try again.'
        );
      });
    });
  });

  describe('Navigation Operations', () => {
    it('should navigate to booking details when booking is pressed', async () => {
      const { getByTestId } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      // Switch to bookings tab
      const bookingsTab = getByTestId('bookings-tab');
      fireEvent.press(bookingsTab);

      await waitFor(() => {
        const bookingCard = getByTestId('booking-card-1');
        fireEvent.press(bookingCard);
      });

      expect(mockNavigation.navigate).toHaveBeenCalledWith('BookingDetails', { bookingId: '1' });
    });

    it('should navigate to calendar event when pressed', async () => {
      const { getByTestId } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      // Switch to bookings tab
      const bookingsTab = getByTestId('bookings-tab');
      fireEvent.press(bookingsTab);

      // Switch to calendar view
      const calendarButton = getByTestId('calendar-view-button');
      fireEvent.press(calendarButton);

      await waitFor(() => {
        const calendarEvent = getByTestId('calendar-event-1');
        fireEvent.press(calendarEvent);
      });

      expect(mockNavigation.navigate).toHaveBeenCalledWith('BookingDetails', { bookingId: '1' });
    });

    it('should switch to services tab from empty state', async () => {
      const { getByTestId, getByText } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      // Switch to bookings tab (assuming empty)
      const bookingsTab = getByTestId('bookings-tab');
      fireEvent.press(bookingsTab);

      await waitFor(() => {
        const browseButton = getByTestId('browse-services-button');
        fireEvent.press(browseButton);
      });

      expect(getByText('Pet Transport')).toBeTruthy(); // Should show services
    });
  });

  describe('Form State Management', () => {
    it('should reset form when modal is closed', async () => {
      const { getByTestId, queryByDisplayValue } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      // Open booking form
      const servicesTab = getByTestId('services-tab');
      fireEvent.press(servicesTab);

      const bookButton = getByTestId('book-service-1');
      fireEvent.press(bookButton);

      // Fill some data
      const notesInput = getByTestId('notes-input');
      fireEvent.changeText(notesInput, 'Test notes');

      // Close modal
      const closeButton = getByTestId('close-booking-form');
      fireEvent.press(closeButton);

      // Reopen modal
      fireEvent.press(bookButton);

      await waitFor(() => {
        expect(queryByDisplayValue('Test notes')).toBeFalsy(); // Form should be reset
      });
    });

    it('should show loading state during booking submission', async () => {
      let resolveBooking: (value: any) => void;
      const bookingPromise = new Promise((resolve) => {
        resolveBooking = resolve;
      });

      mockBookingAPI.create.mockReturnValueOnce(bookingPromise);

      const { getByTestId } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      // Open and fill booking form
      const servicesTab = getByTestId('services-tab');
      fireEvent.press(servicesTab);

      const bookButton = getByTestId('book-service-1');
      fireEvent.press(bookButton);

      // Fill required fields
      const petSelect = getByTestId('pet-select');
      fireEvent(petSelect, 'onValueChange', 'Buddy');

      const dateInput = getByTestId('date-input');
      fireEvent.changeText(dateInput, '2024-01-20');

      const timeInput = getByTestId('time-input');
      fireEvent.changeText(timeInput, '9:00 AM');

      const pickupInput = getByTestId('pickup-address-input');
      fireEvent.changeText(pickupInput, '123 Main Street, City, State');

      const dropoffInput = getByTestId('dropoff-address-input');
      fireEvent.changeText(dropoffInput, '456 Oak Avenue, City, State');

      // Submit booking
      const submitButton = getByTestId('submit-booking');
      fireEvent.press(submitButton);

      // Should show loading state
      expect(getByTestId('booking-loading')).toBeTruthy();

      // Resolve the promise
      resolveBooking!({ data: { booking: { id: '4' } } });

      await waitFor(() => {
        expect(getByTestId('booking-loading')).toBeFalsy();
      });
    });
  });

  describe('Service Filtering and Search', () => {
    it('should filter services by category', async () => {
      const { getByTestId, getByText, queryByText } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      const servicesTab = getByTestId('services-tab');
      fireEvent.press(servicesTab);

      // Apply transport filter
      const transportFilter = getByTestId('transport-filter');
      fireEvent.press(transportFilter);

      await waitFor(() => {
        expect(getByText('Pet Transport')).toBeTruthy();
        expect(queryByText('Vet Visit')).toBeFalsy(); // Should be filtered out
      });
    });

    it('should show all services when no filter is applied', async () => {
      const { getByTestId, getByText } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      const servicesTab = getByTestId('services-tab');
      fireEvent.press(servicesTab);

      const allFilter = getByTestId('all-filter');
      fireEvent.press(allFilter);

      await waitFor(() => {
        expect(getByText('Pet Transport')).toBeTruthy();
        expect(getByText('Vet Visit')).toBeTruthy();
        expect(getByText('Emergency Transport')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', async () => {
      const { getByTestId } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      expect(getByTestId('services-tab')).toHaveProperty('accessibilityLabel', 'Services tab');
      expect(getByTestId('bookings-tab')).toHaveProperty('accessibilityLabel', 'My bookings tab');
    });

    it('should support screen readers', async () => {
      const { getByTestId } = render(
        <BookingsScreen navigation={mockNavigation} />
      );

      const servicesTab = getByTestId('services-tab');
      expect(servicesTab).toHaveProperty('accessible', true);
    });
  });
});