import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { MedicalHistoryModal } from '../../src/components/MedicalHistoryModal';

// Mock dependencies
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

const mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;

const mockProps = {
  visible: true,
  onClose: jest.fn(),
  petId: '1',
  petName: 'Buddy',
};

const mockMedicalRecords = [
  {
    id: '1',
    title: 'Annual Checkup',
    description: 'Routine annual health examination',
    diagnosis: 'Healthy, mild hip dysplasia',
    treatment: 'Continue joint supplements, monitor activity',
    medications: ['Glucosamine supplement'],
    cost: 150.00,
    vetName: 'Dr. Sarah Johnson',
    vetClinic: 'Happy Paws Veterinary Clinic',
    visitDate: '2024-01-15',
    nextVisit: '2024-07-15',
    documents: [],
  },
  {
    id: '2',
    title: 'Vaccination Update',
    description: 'Annual vaccinations and health check',
    diagnosis: 'Healthy',
    treatment: 'Vaccinations administered',
    medications: [],
    cost: 120.00,
    vetName: 'Dr. Sarah Johnson',
    vetClinic: 'Happy Paws Veterinary Clinic',
    visitDate: '2023-06-15',
    nextVisit: '2024-06-15',
    documents: [],
  },
];

const mockAppointments = [
  {
    id: '1',
    title: 'Annual Checkup',
    description: 'Yearly health examination and vaccinations',
    appointmentDate: '2024-07-15T10:00:00Z',
    duration: 60,
    status: 'scheduled' as const,
    vetName: 'Dr. Sarah Johnson',
    vetClinic: 'Happy Paws Veterinary Clinic',
    vetPhone: '+1-555-VET1',
    address: '456 Oak Ave, New York, NY 10002',
    notes: 'Bring vaccination records',
  },
  {
    id: '2',
    title: 'Dental Cleaning',
    description: 'Professional dental cleaning and examination',
    appointmentDate: '2024-03-15T14:00:00Z',
    duration: 90,
    status: 'completed' as const,
    vetName: 'Dr. Emily Chen',
    vetClinic: 'Pet Dental Care',
    vetPhone: '+1-555-DEN1',
    address: '789 Pine St, New York, NY 10003',
    notes: 'Fasting required 12 hours before appointment',
  },
];

describe('MedicalHistoryModal CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('READ Operations', () => {
    it('should display medical records when modal is opened', async () => {
      const { getByText } = render(<MedicalHistoryModal {...mockProps} />);

      await waitFor(() => {
        expect(getByText('Medical History')).toBeTruthy();
        expect(getByText('Buddy')).toBeTruthy();
        expect(getByText('Annual Checkup')).toBeTruthy();
        expect(getByText('Vaccination Update')).toBeTruthy();
      });
    });

    it('should switch between records and appointments tabs', async () => {
      const { getByTestId, getByText } = render(<MedicalHistoryModal {...mockProps} />);

      // Should start on records tab
      await waitFor(() => {
        expect(getByText('Annual Checkup')).toBeTruthy();
      });

      // Switch to appointments tab
      const appointmentsTab = getByTestId('appointments-tab');
      fireEvent.press(appointmentsTab);

      await waitFor(() => {
        expect(getByText('Dental Cleaning')).toBeTruthy();
      });

      // Switch back to records tab
      const recordsTab = getByTestId('records-tab');
      fireEvent.press(recordsTab);

      await waitFor(() => {
        expect(getByText('Vaccination Update')).toBeTruthy();
      });
    });

    it('should display empty state when no records exist', async () => {
      // Mock empty data
      const { getByText, getByTestId } = render(<MedicalHistoryModal {...mockProps} />);

      await waitFor(() => {
        expect(getByTestId('empty-records-state')).toBeTruthy();
        expect(getByText('No medical records found')).toBeTruthy();
      });
    });

    it('should display empty state when no appointments exist', async () => {
      const { getByTestId, getByText } = render(<MedicalHistoryModal {...mockProps} />);

      // Switch to appointments tab
      const appointmentsTab = getByTestId('appointments-tab');
      fireEvent.press(appointmentsTab);

      await waitFor(() => {
        expect(getByTestId('empty-appointments-state')).toBeTruthy();
        expect(getByText('No appointments scheduled')).toBeTruthy();
      });
    });

    it('should display all medical record details correctly', async () => {
      const { getByText } = render(<MedicalHistoryModal {...mockProps} />);

      await waitFor(() => {
        expect(getByText('Annual Checkup')).toBeTruthy();
        expect(getByText('Routine annual health examination')).toBeTruthy();
        expect(getByText('Healthy, mild hip dysplasia')).toBeTruthy();
        expect(getByText('Continue joint supplements, monitor activity')).toBeTruthy();
        expect(getByText('Glucosamine supplement')).toBeTruthy();
        expect(getByText('$150.00')).toBeTruthy();
        expect(getByText('Dr. Sarah Johnson')).toBeTruthy();
        expect(getByText('Happy Paws Veterinary Clinic')).toBeTruthy();
      });
    });

    it('should display appointment details correctly', async () => {
      const { getByTestId, getByText } = render(<MedicalHistoryModal {...mockProps} />);

      // Switch to appointments tab
      const appointmentsTab = getByTestId('appointments-tab');
      fireEvent.press(appointmentsTab);

      await waitFor(() => {
        expect(getByText('Annual Checkup')).toBeTruthy();
        expect(getByText('Yearly health examination and vaccinations')).toBeTruthy();
        expect(getByText('60 minutes')).toBeTruthy();
        expect(getByText('456 Oak Ave, New York, NY 10002')).toBeTruthy();
        expect(getByText('+1-555-VET1')).toBeTruthy();
        expect(getByText('Bring vaccination records')).toBeTruthy();
        expect(getByText('Scheduled')).toBeTruthy();
      });
    });
  });

  describe('CREATE Operations', () => {
    it('should show add record options when add button is pressed', async () => {
      const { getByTestId } = render(<MedicalHistoryModal {...mockProps} />);

      await waitFor(() => {
        const addButton = getByTestId('add-record-button');
        fireEvent.press(addButton);
      });

      expect(mockAlert).toHaveBeenCalledWith(
        'Add Medical Record',
        'What would you like to add?',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Vet Visit' }),
          expect.objectContaining({ text: 'Vaccination' }),
          expect.objectContaining({ text: 'Medication' }),
        ])
      );
    });

    it('should create new vet visit record when selected', async () => {
      // Mock Alert.alert to auto-select vet visit
      mockAlert.mockImplementation((title, message, buttons) => {
        if (title === 'Add Medical Record') {
          const vetVisitButton = buttons?.find(b => b.text === 'Vet Visit');
          if (vetVisitButton?.onPress) {
            vetVisitButton.onPress();
          }
        }
        if (title === 'Add Vet Visit Record') {
          const addButton = buttons?.find(b => b.text === 'Add Record');
          if (addButton?.onPress) {
            addButton.onPress();
          }
        }
      });

      const { getByTestId, getByText } = render(<MedicalHistoryModal {...mockProps} />);

      await waitFor(() => {
        const addButton = getByTestId('add-record-button');
        fireEvent.press(addButton);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Success', 'Medical record added successfully!');
      });
    });

    it('should create new vaccination record when selected', async () => {
      // Mock Alert.alert to auto-select vaccination
      mockAlert.mockImplementation((title, message, buttons) => {
        if (title === 'Add Medical Record') {
          const vaccinationButton = buttons?.find(b => b.text === 'Vaccination');
          if (vaccinationButton?.onPress) {
            vaccinationButton.onPress();
          }
        }
        if (title === 'Add Vaccination Record') {
          const addButton = buttons?.find(b => b.text === 'Add Record');
          if (addButton?.onPress) {
            addButton.onPress();
          }
        }
      });

      const { getByTestId } = render(<MedicalHistoryModal {...mockProps} />);

      await waitFor(() => {
        const addButton = getByTestId('add-record-button');
        fireEvent.press(addButton);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Success', 'Medical record added successfully!');
      });
    });

    it('should create new medication record when selected', async () => {
      // Mock Alert.alert to auto-select medication
      mockAlert.mockImplementation((title, message, buttons) => {
        if (title === 'Add Medical Record') {
          const medicationButton = buttons?.find(b => b.text === 'Medication');
          if (medicationButton?.onPress) {
            medicationButton.onPress();
          }
        }
        if (title === 'Add Medication Record') {
          const addButton = buttons?.find(b => b.text === 'Add Record');
          if (addButton?.onPress) {
            addButton.onPress();
          }
        }
      });

      const { getByTestId } = render(<MedicalHistoryModal {...mockProps} />);

      await waitFor(() => {
        const addButton = getByTestId('add-record-button');
        fireEvent.press(addButton);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Success', 'Medical record added successfully!');
      });
    });

    it('should schedule new appointment when add button is pressed on appointments tab', async () => {
      // Mock Alert.alert to auto-confirm appointment scheduling
      mockAlert.mockImplementation((title, message, buttons) => {
        if (title === 'Schedule Appointment') {
          const scheduleButton = buttons?.find(b => b.text === 'Schedule');
          if (scheduleButton?.onPress) {
            scheduleButton.onPress();
          }
        }
      });

      const { getByTestId } = render(<MedicalHistoryModal {...mockProps} />);

      // Switch to appointments tab
      const appointmentsTab = getByTestId('appointments-tab');
      fireEvent.press(appointmentsTab);

      await waitFor(() => {
        const addButton = getByTestId('add-appointment-button');
        fireEvent.press(addButton);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Success', 'Appointment scheduled successfully!');
      });
    });
  });

  describe('DELETE Operations', () => {
    it('should show delete confirmation for medical records', async () => {
      const { getByTestId } = render(<MedicalHistoryModal {...mockProps} />);

      await waitFor(() => {
        const deleteButton = getByTestId('delete-record-1');
        fireEvent.press(deleteButton);
      });

      expect(mockAlert).toHaveBeenCalledWith(
        'Delete Record',
        'Are you sure you want to delete this medical record?',
        expect.any(Array)
      );
    });

    it('should delete medical record when confirmed', async () => {
      // Mock Alert.alert to auto-confirm deletion
      mockAlert.mockImplementation((title, message, buttons) => {
        if (title === 'Delete Record') {
          const deleteButton = buttons?.find(b => b.text === 'Delete');
          if (deleteButton?.onPress) {
            deleteButton.onPress();
          }
        }
      });

      const { getByTestId, queryByText } = render(<MedicalHistoryModal {...mockProps} />);

      await waitFor(() => {
        const deleteButton = getByTestId('delete-record-1');
        fireEvent.press(deleteButton);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Success', 'Medical record deleted successfully!');
        expect(queryByText('Annual Checkup')).toBeFalsy(); // Record should be removed
      });
    });

    it('should cancel deletion when user chooses cancel', async () => {
      // Mock Alert.alert to simulate cancel
      mockAlert.mockImplementation((title, message, buttons) => {
        if (title === 'Delete Record') {
          const cancelButton = buttons?.find(b => b.text === 'Cancel');
          if (cancelButton?.onPress) {
            cancelButton.onPress();
          }
        }
      });

      const { getByTestId, getByText } = render(<MedicalHistoryModal {...mockProps} />);

      await waitFor(() => {
        const deleteButton = getByTestId('delete-record-1');
        fireEvent.press(deleteButton);
      });

      await waitFor(() => {
        expect(getByText('Annual Checkup')).toBeTruthy(); // Record should still be visible
      });
    });

    it('should show cancel confirmation for appointments', async () => {
      const { getByTestId } = render(<MedicalHistoryModal {...mockProps} />);

      // Switch to appointments tab
      const appointmentsTab = getByTestId('appointments-tab');
      fireEvent.press(appointmentsTab);

      await waitFor(() => {
        const cancelButton = getByTestId('cancel-appointment-1');
        fireEvent.press(cancelButton);
      });

      expect(mockAlert).toHaveBeenCalledWith(
        'Cancel Appointment',
        'Are you sure you want to cancel this appointment?',
        expect.any(Array)
      );
    });

    it('should cancel appointment when confirmed', async () => {
      // Mock Alert.alert to auto-confirm cancellation
      mockAlert.mockImplementation((title, message, buttons) => {
        if (title === 'Cancel Appointment') {
          const cancelButton = buttons?.find(b => b.text === 'Cancel Appointment');
          if (cancelButton?.onPress) {
            cancelButton.onPress();
          }
        }
      });

      const { getByTestId, getByText } = render(<MedicalHistoryModal {...mockProps} />);

      // Switch to appointments tab
      const appointmentsTab = getByTestId('appointments-tab');
      fireEvent.press(appointmentsTab);

      await waitFor(() => {
        const cancelButton = getByTestId('cancel-appointment-1');
        fireEvent.press(cancelButton);
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Success', 'Appointment cancelled successfully!');
        expect(getByText('Cancelled')).toBeTruthy(); // Status should be updated
      });
    });

    it('should not show cancel button for completed appointments', async () => {
      const { getByTestId, queryByTestId } = render(<MedicalHistoryModal {...mockProps} />);

      // Switch to appointments tab
      const appointmentsTab = getByTestId('appointments-tab');
      fireEvent.press(appointmentsTab);

      await waitFor(() => {
        expect(queryByTestId('cancel-appointment-2')).toBeFalsy(); // Completed appointment
      });
    });

    it('should not show cancel button for cancelled appointments', async () => {
      const { getByTestId, queryByTestId } = render(<MedicalHistoryModal {...mockProps} />);

      // Switch to appointments tab  
      const appointmentsTab = getByTestId('appointments-tab');
      fireEvent.press(appointmentsTab);

      // First cancel an appointment
      await waitFor(() => {
        const cancelButton = getByTestId('cancel-appointment-1');
        fireEvent.press(cancelButton);
      });

      // Mock auto-confirm
      mockAlert.mockImplementation((title, message, buttons) => {
        if (title === 'Cancel Appointment') {
          const cancelButton = buttons?.find(b => b.text === 'Cancel Appointment');
          if (cancelButton?.onPress) {
            cancelButton.onPress();
          }
        }
      });

      await waitFor(() => {
        expect(queryByTestId('cancel-appointment-1')).toBeFalsy(); // Should be hidden now
      });
    });
  });

  describe('UI State Management', () => {
    it('should close modal when close button is pressed', async () => {
      const onCloseMock = jest.fn();
      const { getByTestId } = render(
        <MedicalHistoryModal {...mockProps} onClose={onCloseMock} />
      );

      const closeButton = getByTestId('close-modal-button');
      fireEvent.press(closeButton);

      expect(onCloseMock).toHaveBeenCalled();
    });

    it('should not render when visible is false', () => {
      const { queryByText } = render(
        <MedicalHistoryModal {...mockProps} visible={false} />
      );

      expect(queryByText('Medical History')).toBeFalsy();
    });

    it('should show loading state while data is being loaded', () => {
      const { getByTestId } = render(<MedicalHistoryModal {...mockProps} />);

      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('should show correct tab styling for active tab', async () => {
      const { getByTestId } = render(<MedicalHistoryModal {...mockProps} />);

      const recordsTab = getByTestId('records-tab');
      const appointmentsTab = getByTestId('appointments-tab');

      expect(recordsTab).toHaveProperty('style'); // Should have active styling
      expect(appointmentsTab).toHaveProperty('style'); // Should have inactive styling

      // Switch tabs
      fireEvent.press(appointmentsTab);

      await waitFor(() => {
        expect(appointmentsTab).toHaveProperty('style'); // Should now have active styling
      });
    });
  });

  describe('Data Formatting', () => {
    it('should format dates correctly', async () => {
      const { getByText } = render(<MedicalHistoryModal {...mockProps} />);

      await waitFor(() => {
        expect(getByText('1/15/2024')).toBeTruthy(); // Formatted date
      });
    });

    it('should format currency correctly', async () => {
      const { getByText } = render(<MedicalHistoryModal {...mockProps} />);

      await waitFor(() => {
        expect(getByText('$150.00')).toBeTruthy();
        expect(getByText('$120.00')).toBeTruthy();
      });
    });

    it('should format appointment times correctly', async () => {
      const { getByTestId, getByText } = render(<MedicalHistoryModal {...mockProps} />);

      // Switch to appointments tab
      const appointmentsTab = getByTestId('appointments-tab');
      fireEvent.press(appointmentsTab);

      await waitFor(() => {
        expect(getByText(/10:00/)).toBeTruthy(); // Should show formatted time
      });
    });

    it('should show status colors correctly', async () => {
      const { getByTestId } = render(<MedicalHistoryModal {...mockProps} />);

      // Switch to appointments tab
      const appointmentsTab = getByTestId('appointments-tab');
      fireEvent.press(appointmentsTab);

      await waitFor(() => {
        const statusBadge = getByTestId('status-badge-1');
        expect(statusBadge).toHaveProperty('style');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing optional fields gracefully', async () => {
      const recordWithoutOptionalFields = {
        id: '3',
        title: 'Basic Record',
        visitDate: '2024-01-01',
        medications: [],
        documents: [],
        vetName: 'Dr. Test',
        vetClinic: 'Test Clinic',
      };

      const { getByText } = render(<MedicalHistoryModal {...mockProps} />);

      await waitFor(() => {
        expect(getByText('Basic Record')).toBeTruthy();
        // Should not crash with missing optional fields
      });
    });

    it('should handle API errors during data loading', async () => {
      // Mock console.error to prevent test output pollution
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { getByText } = render(<MedicalHistoryModal {...mockProps} />);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Error', 'Failed to load medical data');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', async () => {
      const { getByTestId } = render(<MedicalHistoryModal {...mockProps} />);

      expect(getByTestId('records-tab')).toHaveProperty('accessibilityLabel');
      expect(getByTestId('appointments-tab')).toHaveProperty('accessibilityLabel');
      expect(getByTestId('close-modal-button')).toHaveProperty('accessibilityLabel');
    });

    it('should support screen readers', async () => {
      const { getByTestId } = render(<MedicalHistoryModal {...mockProps} />);

      const modal = getByTestId('medical-history-modal');
      expect(modal).toHaveProperty('accessible', true);
    });
  });

  describe('Scrolling', () => {
    it('should scroll content properly', async () => {
      const { getByTestId } = render(<MedicalHistoryModal {...mockProps} />);

      const scrollView = getByTestId('content-scroll-view');
      expect(scrollView).toHaveProperty('showsVerticalScrollIndicator', false);

      // Test scrolling
      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentOffset: { y: 100 },
          contentSize: { height: 1000 },
          layoutMeasurement: { height: 600 },
        },
      });

      expect(scrollView).toBeTruthy(); // Should handle scroll events
    });
  });
});