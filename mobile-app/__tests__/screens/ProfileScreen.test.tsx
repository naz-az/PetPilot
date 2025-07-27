import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileScreen from '../../src/screens/ProfileScreen';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;

describe('ProfileScreen CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockClear();
    mockAsyncStorage.setItem.mockClear();
    mockAsyncStorage.removeItem.mockClear();
    mockAsyncStorage.multiRemove.mockClear();
  });

  describe('READ Operations', () => {
    it('should load user profile from AsyncStorage successfully', async () => {
      const mockUserData = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockUserData));

      const { getByText } = render(<ProfileScreen />);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('john@example.com')).toBeTruthy();
      });

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('userData');
    });

    it('should handle missing user data with fallback profile', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const { getByText } = render(<ProfileScreen />);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy(); // Fallback profile
      });
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      const { getByText } = render(<ProfileScreen />);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Error', 'Failed to load profile data.');
      });
    });
  });

  describe('UPDATE Operations', () => {
    it('should open profile edit modal when edit button is pressed', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com'
      }));

      const { getByTestId, getByText } = render(<ProfileScreen />);

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });

      const editButton = getByTestId('edit-profile-button');
      fireEvent.press(editButton);

      await waitFor(() => {
        expect(getByText('Edit Profile')).toBeTruthy();
      });
    });

    it('should save updated profile data successfully', async () => {
      const originalData = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com'
      };

      const updatedData = {
        id: '1',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1234567890',
        address: '123 Test St'
      };

      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(originalData))
        .mockResolvedValueOnce(JSON.stringify(originalData));

      const { getByTestId, getByDisplayValue } = render(<ProfileScreen />);

      await waitFor(() => {
        const editButton = getByTestId('edit-profile-button');
        fireEvent.press(editButton);
      });

      // Fill form with new data
      const nameInput = getByDisplayValue('John Doe');
      const emailInput = getByDisplayValue('john@example.com');

      fireEvent.changeText(nameInput, 'Jane Smith');
      fireEvent.changeText(emailInput, 'jane@example.com');

      const saveButton = getByTestId('save-profile-button');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          'userData',
          expect.stringContaining('Jane Smith')
        );
        expect(mockAlert).toHaveBeenCalledWith('Success', 'Profile updated successfully!');
      });
    });

    it('should validate email format during update', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com'
      }));

      const { getByTestId, getByDisplayValue } = render(<ProfileScreen />);

      await waitFor(() => {
        const editButton = getByTestId('edit-profile-button');
        fireEvent.press(editButton);
      });

      const emailInput = getByDisplayValue('john@example.com');
      fireEvent.changeText(emailInput, 'invalid-email');

      const saveButton = getByTestId('save-profile-button');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Validation Error',
          'Please enter a valid email address.'
        );
      });

      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should require name field during update', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com'
      }));

      const { getByTestId, getByDisplayValue } = render(<ProfileScreen />);

      await waitFor(() => {
        const editButton = getByTestId('edit-profile-button');
        fireEvent.press(editButton);
      });

      const nameInput = getByDisplayValue('John Doe');
      fireEvent.changeText(nameInput, '');

      const saveButton = getByTestId('save-profile-button');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Validation Error', 'Name is required.');
      });
    });
  });

  describe('DELETE Operations', () => {
    it('should show account deletion confirmation dialog', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com'
      }));

      const { getByTestId } = render(<ProfileScreen />);

      await waitFor(() => {
        const deleteButton = getByTestId('delete-account-button');
        fireEvent.press(deleteButton);
      });

      expect(mockAlert).toHaveBeenCalledWith(
        'Delete Account',
        'Are you sure you want to delete your account? This action cannot be undone.',
        expect.any(Array)
      );
    });

    it('should delete account and clear all data when confirmed', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com'
      }));

      // Mock Alert.alert to auto-confirm deletion
      mockAlert.mockImplementation((title, message, buttons) => {
        if (title === 'Delete Account') {
          const deleteButton = buttons?.find(b => b.text === 'Delete');
          if (deleteButton?.onPress) {
            deleteButton.onPress();
          }
        }
        if (title === 'Final Confirmation') {
          const confirmButton = buttons?.find(b => b.text === 'Delete Forever');
          if (confirmButton?.onPress) {
            confirmButton.onPress();
          }
        }
      });

      const { getByTestId } = render(<ProfileScreen />);

      await waitFor(() => {
        const deleteButton = getByTestId('delete-account-button');
        fireEvent.press(deleteButton);
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

    it('should handle deletion errors gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com'
      }));

      mockAsyncStorage.multiRemove.mockRejectedValueOnce(new Error('Deletion failed'));

      // Mock Alert.alert to auto-confirm deletion
      mockAlert.mockImplementation((title, message, buttons) => {
        if (title === 'Delete Account') {
          const deleteButton = buttons?.find(b => b.text === 'Delete');
          if (deleteButton?.onPress) {
            deleteButton.onPress();
          }
        }
        if (title === 'Final Confirmation') {
          const confirmButton = buttons?.find(b => b.text === 'Delete Forever');
          if (confirmButton?.onPress) {
            confirmButton.onPress();
          }
        }
      });

      const { getByTestId } = render(<ProfileScreen />);

      await waitFor(() => {
        const deleteButton = getByTestId('delete-account-button');
        fireEvent.press(deleteButton);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Error', 'Failed to delete account. Please try again.');
      });
    });
  });

  describe('Logout Operations', () => {
    it('should clear user data on logout', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com'
      }));

      // Mock Alert.alert to auto-confirm logout
      mockAlert.mockImplementation((title, message, buttons) => {
        if (title === 'Logout') {
          const logoutButton = buttons?.find(b => b.text === 'Logout');
          if (logoutButton?.onPress) {
            logoutButton.onPress();
          }
        }
      });

      const { getByTestId } = render(<ProfileScreen />);

      await waitFor(() => {
        const logoutButton = getByTestId('logout-button');
        fireEvent.press(logoutButton);
      });

      await waitFor(() => {
        expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
          'accessToken',
          'refreshToken',
          'user'
        ]);
      });
    });
  });

  describe('Settings Operations', () => {
    it('should toggle notification settings', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com'
      }));

      const { getByTestId } = render(<ProfileScreen />);

      await waitFor(() => {
        const notificationToggle = getByTestId('notifications-toggle');
        fireEvent(notificationToggle, 'onValueChange', false);
      });

      // Should update state successfully
      expect(getByTestId('notifications-toggle').props.value).toBe(false);
    });

    it('should open payment methods modal', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com'
      }));

      const { getByTestId, getByText } = render(<ProfileScreen />);

      await waitFor(() => {
        const paymentButton = getByTestId('payment-methods-button');
        fireEvent.press(paymentButton);
      });

      expect(getByText('Payment Methods')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should show error state when profile fails to load', async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      const { getByText } = render(<ProfileScreen />);

      await waitFor(() => {
        expect(getByText('Failed to load profile')).toBeTruthy();
      });
    });

    it('should handle profile save errors', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com'
      }));

      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Save error'));

      const { getByTestId } = render(<ProfileScreen />);

      await waitFor(() => {
        const editButton = getByTestId('edit-profile-button');
        fireEvent.press(editButton);
      });

      const saveButton = getByTestId('save-profile-button');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Error',
          'Failed to update profile. Please try again.'
        );
      });
    });
  });

  describe('UI State Management', () => {
    it('should show loading spinner while profile is loading', () => {
      mockAsyncStorage.getItem.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { getByTestId } = render(<ProfileScreen />);

      expect(getByTestId('loading-spinner')).toBeTruthy();
    });

    it('should close edit modal when cancel is pressed', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com'
      }));

      const { getByTestId, queryByText } = render(<ProfileScreen />);

      await waitFor(() => {
        const editButton = getByTestId('edit-profile-button');
        fireEvent.press(editButton);
      });

      expect(queryByText('Edit Profile')).toBeTruthy();

      const cancelButton = getByTestId('cancel-edit-button');
      fireEvent.press(cancelButton);

      await waitFor(() => {
        expect(queryByText('Edit Profile')).toBeFalsy();
      });
    });
  });
});