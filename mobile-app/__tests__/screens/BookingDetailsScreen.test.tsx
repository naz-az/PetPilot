import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import BookingDetailsScreen from '../../src/screens/BookingDetailsScreen';
import { bookingAPI, reviewAPI } from '../../src/services/api';

// Mock dependencies
jest.mock('../../src/services/api');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
}));

const mockBookingAPI = bookingAPI as jest.Mocked<typeof bookingAPI>;
const mockReviewAPI = reviewAPI as jest.Mocked<typeof reviewAPI>;
const mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockRoute = {
  params: { bookingId: '1' }
};

const mockBooking = {
  id: '1',
  serviceName: 'Vet Visit',
  petName: 'Buddy',
  date: '2024-01-15',
  time: '10:00 AM',
  status: 'confirmed' as const,
  price: 35,
  pickupAddress: '123 Main St, City',
  dropoffAddress: 'Happy Paws Vet Clinic, 456 Oak Ave',
  notes: 'Annual checkup appointment',
  pilotInfo: {
    name: 'Sarah Johnson',
    phone: '+1 (555) 987-6543',
    rating: 4.8,
    vehicle: '2022 Honda CR-V',
    licensePlate: 'VET-123',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
  },
  trackingCode: 'PP-2024-001',
  estimatedDuration: 45,
  totalDistance: 8.2,
  specialInstructions: 'Pet carrier required for transport safety.',
  paymentMethod: 'Credit Card ending in 4567',
  paymentStatus: 'paid' as const,
};

describe('BookingDetailsScreen CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBookingAPI.getById.mockClear();
    mockBookingAPI.cancel.mockClear();
    mockReviewAPI.create.mockClear();
  });

  describe('READ Operations', () => {
    it('should load and display booking details successfully', async () => {
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: mockBooking }
      });

      const { getByText } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Vet Visit')).toBeTruthy();
        expect(getByText('Buddy')).toBeTruthy();
        expect(getByText('Sarah Johnson')).toBeTruthy();
        expect(getByText('2022 Honda CR-V')).toBeTruthy();
        expect(getByText('VET-123')).toBeTruthy();
        expect(getByText('$35')).toBeTruthy();
        expect(getByText('PP-2024-001')).toBeTruthy();
      });

      expect(mockBookingAPI.getById).toHaveBeenCalledWith('1');
    });

    it('should handle booking not found', async () => {
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: null }
      });

      const { getByText } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Booking Not Found')).toBeTruthy();
        expect(getByText('Booking not found')).toBeTruthy();
      });
    });

    it('should handle API errors during loading', async () => {
      mockBookingAPI.getById.mockRejectedValueOnce(new Error('Network error'));

      const { getByText } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Error', 'Failed to load booking details.');
      });
    });

    it('should show loading spinner while data is loading', () => {
      mockBookingAPI.getById.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { getByTestId } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      expect(getByTestId('loading-spinner')).toBeTruthy();
    });

    it('should display different booking statuses correctly', async () => {
      const completedBooking = { ...mockBooking, status: 'completed' as const };
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: completedBooking }
      });

      const { getByText } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('COMPLETED')).toBeTruthy();
      });
    });

    it('should show pilot avatar instead of default icon', async () => {
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: mockBooking }
      });

      const { getByTestId } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByTestId('pilot-avatar-image')).toBeTruthy();
      });
    });
  });

  describe('UPDATE Operations', () => {
    it('should cancel booking with confirmation', async () => {
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: mockBooking }
      });

      const { getByTestId } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const cancelButton = getByTestId('cancel-booking-button');
        fireEvent.press(cancelButton);
      });

      expect(mockAlert).toHaveBeenCalledWith(
        'Cancel Booking',
        expect.stringContaining('Are you sure you want to cancel this Vet Visit booking?'),
        expect.any(Array)
      );
    });

    it('should prevent cancelling completed bookings', async () => {
      const completedBooking = { ...mockBooking, status: 'completed' as const };
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: completedBooking }
      });

      const { getByTestId } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const cancelButton = getByTestId('cancel-booking-button');
        fireEvent.press(cancelButton);
      });

      expect(mockAlert).toHaveBeenCalledWith(
        'Cannot Cancel',
        'This booking cannot be cancelled.'
      );
    });

    it('should handle cancellation with refund information', async () => {
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: mockBooking }
      });

      mockBookingAPI.cancel.mockResolvedValueOnce({
        data: { success: true }
      });

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
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const cancelButton = getByTestId('cancel-booking-button');
        fireEvent.press(cancelButton);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Booking Cancelled',
          expect.stringContaining('Refund will be processed within 3-5 business days'),
          expect.any(Array)
        );
      });
    });

    it('should handle cancellation API errors', async () => {
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: mockBooking }
      });

      mockBookingAPI.cancel.mockRejectedValueOnce(new Error('Cancellation failed'));

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
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const cancelButton = getByTestId('cancel-booking-button');
        fireEvent.press(cancelButton);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Error',
          'Failed to cancel booking. Please try again.'
        );
      });
    });

    it('should track booking when track button is pressed', async () => {
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: mockBooking }
      });

      const { getByTestId } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const trackButton = getByTestId('track-booking-button');
        fireEvent.press(trackButton);
      });

      expect(mockAlert).toHaveBeenCalledWith(
        'Real-time Tracking',
        'Your pilot is currently en route. ETA: 15 minutes'
      );
    });
  });

  describe('CREATE Operations (Reviews)', () => {
    it('should open review modal for completed bookings', async () => {
      const completedBooking = { ...mockBooking, status: 'completed' as const };
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: completedBooking }
      });

      const { getByTestId, getByText } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const reviewButton = getByTestId('leave-review-button');
        fireEvent.press(reviewButton);
      });

      expect(getByText('Leave Review')).toBeTruthy();
    });

    it('should prevent review for non-completed bookings', async () => {
      const pendingBooking = { ...mockBooking, status: 'pending' as const };
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: pendingBooking }
      });

      const { getByTestId } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const reviewButton = getByTestId('leave-review-button');
        fireEvent.press(reviewButton);
      });

      expect(mockAlert).toHaveBeenCalledWith(
        'Review Not Available',
        'You can only review completed bookings'
      );
    });

    it('should submit review successfully', async () => {
      const completedBooking = { ...mockBooking, status: 'completed' as const };
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: completedBooking }
      });

      mockReviewAPI.create.mockResolvedValueOnce({
        data: { review: { id: '1', rating: 5, comment: 'Great service!' } }
      });

      const { getByTestId } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const reviewButton = getByTestId('leave-review-button');
        fireEvent.press(reviewButton);
      });

      // Fill review form
      const ratingStars = getByTestId('rating-stars');
      fireEvent.press(ratingStars, { nativeEvent: { rating: 5 } });

      const commentInput = getByTestId('review-comment-input');
      fireEvent.changeText(commentInput, 'Great service! Very professional.');

      const submitButton = getByTestId('submit-review-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Review Submitted',
          'Thank you for your feedback! Your review helps improve our service.',
          expect.any(Array)
        );
      });
    });

    it('should validate review rating', async () => {
      const completedBooking = { ...mockBooking, status: 'completed' as const };
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: completedBooking }
      });

      const { getByTestId } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const reviewButton = getByTestId('leave-review-button');
        fireEvent.press(reviewButton);
      });

      // Try to submit without rating
      const submitButton = getByTestId('submit-review-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Validation Error',
          expect.stringContaining('Please select a rating')
        );
      });
    });

    it('should validate review comment length', async () => {
      const completedBooking = { ...mockBooking, status: 'completed' as const };
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: completedBooking }
      });

      const { getByTestId } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const reviewButton = getByTestId('leave-review-button');
        fireEvent.press(reviewButton);
      });

      // Fill rating but short comment
      const ratingStars = getByTestId('rating-stars');
      fireEvent.press(ratingStars, { nativeEvent: { rating: 5 } });

      const commentInput = getByTestId('review-comment-input');
      fireEvent.changeText(commentInput, 'OK'); // Too short

      const submitButton = getByTestId('submit-review-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Validation Error',
          expect.stringContaining('Please provide a more detailed review')
        );
      });
    });

    it('should handle review submission errors', async () => {
      const completedBooking = { ...mockBooking, status: 'completed' as const };
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: completedBooking }
      });

      mockReviewAPI.create.mockRejectedValueOnce(new Error('Review submission failed'));

      const { getByTestId } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const reviewButton = getByTestId('leave-review-button');
        fireEvent.press(reviewButton);
      });

      // Fill and submit review
      const ratingStars = getByTestId('rating-stars');
      fireEvent.press(ratingStars, { nativeEvent: { rating: 5 } });

      const commentInput = getByTestId('review-comment-input');
      fireEvent.changeText(commentInput, 'Great service! Very professional.');

      const submitButton = getByTestId('submit-review-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Error',
          expect.stringContaining('Review submission failed')
        );
      });
    });
  });

  describe('Communication Operations', () => {
    it('should call pilot when call button is pressed', async () => {
      const Linking = require('react-native/Libraries/Linking/Linking');
      
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: mockBooking }
      });

      const { getByTestId } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const callButton = getByTestId('call-pilot-button');
        fireEvent.press(callButton);
      });

      expect(Linking.openURL).toHaveBeenCalledWith('tel:+1 (555) 987-6543');
    });

    it('should open message modal when message button is pressed', async () => {
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: mockBooking }
      });

      const { getByTestId, getByText } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const messageButton = getByTestId('message-pilot-button');
        fireEvent.press(messageButton);
      });

      expect(getByText('Message Sarah Johnson')).toBeTruthy();
    });
  });

  describe('Action Sheet Operations', () => {
    it('should show action sheet with correct options for confirmed booking', async () => {
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: mockBooking }
      });

      const { getByTestId, getByText } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const moreButton = getByTestId('more-options-button');
        fireEvent.press(moreButton);
      });

      expect(getByText('Call Pilot')).toBeTruthy();
      expect(getByText('Message Pilot')).toBeTruthy();
      expect(getByText('Track Booking')).toBeTruthy();
      expect(getByText('Cancel Booking')).toBeTruthy();
    });

    it('should show different options for completed booking', async () => {
      const completedBooking = { ...mockBooking, status: 'completed' as const };
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: completedBooking }
      });

      const { getByTestId, getByText } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const moreButton = getByTestId('more-options-button');
        fireEvent.press(moreButton);
      });

      expect(getByText('Leave Review')).toBeTruthy();
      expect(getByText('Book Again')).toBeTruthy();
    });

    it('should navigate to home when rebook is pressed', async () => {
      const completedBooking = { ...mockBooking, status: 'completed' as const };
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: completedBooking }
      });

      const { getByTestId } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const moreButton = getByTestId('more-options-button');
        fireEvent.press(moreButton);
      });

      const rebookButton = getByTestId('rebook-option');
      fireEvent.press(rebookButton);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
    });
  });

  describe('Refund Operations', () => {
    it('should request refund for cancelled paid booking', async () => {
      const cancelledBooking = { 
        ...mockBooking, 
        status: 'cancelled' as const, 
        paymentStatus: 'paid' as const 
      };
      
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: cancelledBooking }
      });

      const { getByTestId } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const moreButton = getByTestId('more-options-button');
        fireEvent.press(moreButton);
      });

      const refundButton = getByTestId('refund-option');
      fireEvent.press(refundButton);

      expect(mockAlert).toHaveBeenCalledWith(
        'Request Refund',
        'Are you sure you want to request a refund for this booking?',
        expect.any(Array)
      );
    });

    it('should process refund request when confirmed', async () => {
      const cancelledBooking = { 
        ...mockBooking, 
        status: 'cancelled' as const, 
        paymentStatus: 'paid' as const 
      };
      
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: cancelledBooking }
      });

      // Mock Alert.alert to auto-confirm refund
      mockAlert.mockImplementation((title, message, buttons) => {
        if (title === 'Request Refund') {
          const refundButton = buttons?.find(b => b.text === 'Request Refund');
          if (refundButton?.onPress) {
            refundButton.onPress();
          }
        }
      });

      const { getByTestId } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const moreButton = getByTestId('more-options-button');
        fireEvent.press(moreButton);
      });

      const refundButton = getByTestId('refund-option');
      fireEvent.press(refundButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Refund Requested',
          'Your refund request has been submitted and will be processed within 3-5 business days.'
        );
      });
    });
  });

  describe('Navigation Operations', () => {
    it('should go back when back button is pressed', async () => {
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: mockBooking }
      });

      const { getByTestId } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const backButton = getByTestId('back-button');
        fireEvent.press(backButton);
      });

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing pilot information gracefully', async () => {
      const bookingWithoutPilot = { ...mockBooking, pilotInfo: undefined };
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: bookingWithoutPilot }
      });

      const { queryByTestId } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(queryByTestId('pilot-section')).toBeFalsy();
      });
    });

    it('should handle missing payment information', async () => {
      const bookingWithoutPayment = { 
        ...mockBooking, 
        paymentMethod: undefined,
        paymentStatus: undefined 
      };
      
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: bookingWithoutPayment }
      });

      const { getByText } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Payment')).toBeTruthy(); // Section should still show
      });
    });
  });

  describe('Status Indicators', () => {
    it('should show correct status colors for different booking states', async () => {
      const pendingBooking = { ...mockBooking, status: 'pending' as const };
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: pendingBooking }
      });

      const { getByTestId } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        const statusIcon = getByTestId('status-icon');
        expect(statusIcon).toHaveProperty('style');
      });
    });

    it('should show payment status correctly', async () => {
      const unpaidBooking = { ...mockBooking, paymentStatus: 'pending' as const };
      mockBookingAPI.getById.mockResolvedValueOnce({
        data: { booking: unpaidBooking }
      });

      const { getByText } = render(
        <BookingDetailsScreen route={mockRoute} navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('PENDING')).toBeTruthy();
      });
    });
  });
});