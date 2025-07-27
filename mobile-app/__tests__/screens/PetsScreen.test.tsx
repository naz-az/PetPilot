import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import PetsScreen from '../../src/screens/PetsScreen';
import { petAPI } from '../../src/services/api';

// Mock dependencies
jest.mock('../../src/services/api');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn((callback) => callback()),
}));

const mockPetAPI = petAPI as jest.Mocked<typeof petAPI>;
const mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
const mockNavigation = {
  navigate: jest.fn(),
};

const mockPets = [
  {
    id: '1',
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: '3',
    weight: '65',
    size: 'Large' as const,
    color: 'Golden',
    description: 'Friendly and energetic',
    photo: 'https://example.com/buddy.jpg',
  },
  {
    id: '2',
    name: 'Whiskers',
    species: 'Cat',
    breed: 'Persian',
    age: '2',
    weight: '8',
    size: 'Small' as const,
    color: 'White',
    description: 'Calm and cuddly',
    photo: 'https://example.com/whiskers.jpg',
  },
];

describe('PetsScreen CRUD Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPetAPI.getAll.mockClear();
    mockPetAPI.create.mockClear();
    mockPetAPI.update.mockClear();
    mockPetAPI.delete.mockClear();
  });

  describe('CREATE Operations', () => {
    it('should open add pet modal when add button is pressed', async () => {
      mockPetAPI.getAll.mockResolvedValueOnce({
        data: { pets: mockPets }
      });

      const { getByTestId, getByText } = render(
        <PetsScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Buddy')).toBeTruthy();
      });

      const addButton = getByTestId('add-pet-button');
      fireEvent.press(addButton);

      await waitFor(() => {
        expect(getByText('Add Pet')).toBeTruthy();
      });
    });

    it('should create a new pet successfully', async () => {
      const newPet = {
        id: '3',
        name: 'Max',
        species: 'Dog',
        breed: 'Labrador',
        age: '1',
        weight: '45',
        size: 'Medium' as const,
        color: 'Black',
        description: 'Playful puppy',
        photo: '',
      };

      mockPetAPI.getAll.mockResolvedValueOnce({
        data: { pets: mockPets }
      });

      mockPetAPI.create.mockResolvedValueOnce({
        data: { pet: newPet }
      });

      const { getByTestId, getByDisplayValue } = render(
        <PetsScreen navigation={mockNavigation} />
      );

      // Open add pet modal
      await waitFor(() => {
        const addButton = getByTestId('add-pet-button');
        fireEvent.press(addButton);
      });

      // Fill form
      const nameInput = getByTestId('pet-name-input');
      const speciesInput = getByTestId('pet-species-input');
      const breedInput = getByTestId('pet-breed-input');

      fireEvent.changeText(nameInput, 'Max');
      fireEvent.changeText(speciesInput, 'Dog');
      fireEvent.changeText(breedInput, 'Labrador');

      // Submit form
      const submitButton = getByTestId('submit-pet-form');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockPetAPI.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Max',
            species: 'Dog',
            breed: 'Labrador',
          })
        );
        expect(mockAlert).toHaveBeenCalledWith('Success', 'Pet added successfully!');
      });
    });

    it('should validate required fields when creating pet', async () => {
      mockPetAPI.getAll.mockResolvedValueOnce({
        data: { pets: mockPets }
      });

      const { getByTestId } = render(
        <PetsScreen navigation={mockNavigation} />
      );

      // Open add pet modal
      await waitFor(() => {
        const addButton = getByTestId('add-pet-button');
        fireEvent.press(addButton);
      });

      // Try to submit without filling required fields
      const submitButton = getByTestId('submit-pet-form');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Validation Error',
          expect.stringContaining('Pet name is required')
        );
      });

      expect(mockPetAPI.create).not.toHaveBeenCalled();
    });

    it('should handle API errors during pet creation', async () => {
      mockPetAPI.getAll.mockResolvedValueOnce({
        data: { pets: mockPets }
      });

      mockPetAPI.create.mockRejectedValueOnce({
        response: { data: { message: 'Network error' } }
      });

      const { getByTestId } = render(
        <PetsScreen navigation={mockNavigation} />
      );

      // Open add pet modal and fill form
      await waitFor(() => {
        const addButton = getByTestId('add-pet-button');
        fireEvent.press(addButton);
      });

      const nameInput = getByTestId('pet-name-input');
      const speciesInput = getByTestId('pet-species-input');

      fireEvent.changeText(nameInput, 'Max');
      fireEvent.changeText(speciesInput, 'Dog');

      const submitButton = getByTestId('submit-pet-form');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Error',
          expect.stringContaining('Network error')
        );
      });
    });
  });

  describe('READ Operations', () => {
    it('should load and display pets successfully', async () => {
      mockPetAPI.getAll.mockResolvedValueOnce({
        data: { pets: mockPets }
      });

      const { getByText } = render(
        <PetsScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('Buddy')).toBeTruthy();
        expect(getByText('Whiskers')).toBeTruthy();
        expect(getByText('Golden Retriever')).toBeTruthy();
        expect(getByText('Persian')).toBeTruthy();
      });

      expect(mockPetAPI.getAll).toHaveBeenCalledTimes(1);
    });

    it('should handle empty pets list', async () => {
      mockPetAPI.getAll.mockResolvedValueOnce({
        data: { pets: [] }
      });

      const { getByText } = render(
        <PetsScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('No Pets Yet')).toBeTruthy();
        expect(getByText('Add your first pet to get started with PetPilot\'s services')).toBeTruthy();
      });
    });

    it('should handle API errors during pet loading', async () => {
      mockPetAPI.getAll.mockRejectedValueOnce(new Error('Network error'));

      const { getByText } = render(
        <PetsScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Error', 'Failed to load pets. Please try again.');
      });
    });

    it('should refresh pets list when pull-to-refresh is used', async () => {
      mockPetAPI.getAll.mockResolvedValue({
        data: { pets: mockPets }
      });

      const { getByTestId } = render(
        <PetsScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByTestId('pets-scroll-view')).toBeTruthy();
      });

      // Simulate pull-to-refresh
      const scrollView = getByTestId('pets-scroll-view');
      fireEvent(scrollView, 'refresh');

      await waitFor(() => {
        expect(mockPetAPI.getAll).toHaveBeenCalledTimes(2); // Initial load + refresh
      });
    });
  });

  describe('UPDATE Operations', () => {
    it('should open edit modal with pre-filled data', async () => {
      mockPetAPI.getAll.mockResolvedValueOnce({
        data: { pets: mockPets }
      });

      const { getByTestId, getByDisplayValue } = render(
        <PetsScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByTestId('pet-card-1')).toBeTruthy();
      });

      // Open pet action sheet
      const moreButton = getByTestId('pet-more-options-1');
      fireEvent.press(moreButton);

      // Select edit option
      const editButton = getByTestId('pet-edit-option');
      fireEvent.press(editButton);

      await waitFor(() => {
        expect(getByDisplayValue('Buddy')).toBeTruthy();
        expect(getByDisplayValue('Dog')).toBeTruthy();
        expect(getByDisplayValue('Golden Retriever')).toBeTruthy();
      });
    });

    it('should update pet successfully', async () => {
      const updatedPet = { ...mockPets[0], name: 'Buddy Updated', age: '4' };

      mockPetAPI.getAll.mockResolvedValueOnce({
        data: { pets: mockPets }
      });

      mockPetAPI.update.mockResolvedValueOnce({
        data: { pet: updatedPet }
      });

      const { getByTestId, getByDisplayValue } = render(
        <PetsScreen navigation={mockNavigation} />
      );

      // Open edit modal
      await waitFor(() => {
        const moreButton = getByTestId('pet-more-options-1');
        fireEvent.press(moreButton);
      });

      const editButton = getByTestId('pet-edit-option');
      fireEvent.press(editButton);

      // Update pet name
      const nameInput = getByDisplayValue('Buddy');
      fireEvent.changeText(nameInput, 'Buddy Updated');

      // Submit update
      const submitButton = getByTestId('submit-pet-form');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockPetAPI.update).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            name: 'Buddy Updated',
          })
        );
        expect(mockAlert).toHaveBeenCalledWith('Success', 'Pet updated successfully!');
      });
    });

    it('should validate data during pet update', async () => {
      mockPetAPI.getAll.mockResolvedValueOnce({
        data: { pets: mockPets }
      });

      const { getByTestId, getByDisplayValue } = render(
        <PetsScreen navigation={mockNavigation} />
      );

      // Open edit modal
      await waitFor(() => {
        const moreButton = getByTestId('pet-more-options-1');
        fireEvent.press(moreButton);
      });

      const editButton = getByTestId('pet-edit-option');
      fireEvent.press(editButton);

      // Clear required field
      const nameInput = getByDisplayValue('Buddy');
      fireEvent.changeText(nameInput, '');

      // Try to submit
      const submitButton = getByTestId('submit-pet-form');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Validation Error',
          expect.stringContaining('Pet name is required')
        );
      });

      expect(mockPetAPI.update).not.toHaveBeenCalled();
    });

    it('should handle update API errors', async () => {
      mockPetAPI.getAll.mockResolvedValueOnce({
        data: { pets: mockPets }
      });

      mockPetAPI.update.mockRejectedValueOnce({
        response: { data: { message: 'Update failed' } }
      });

      const { getByTestId, getByDisplayValue } = render(
        <PetsScreen navigation={mockNavigation} />
      );

      // Open edit modal and make changes
      await waitFor(() => {
        const moreButton = getByTestId('pet-more-options-1');
        fireEvent.press(moreButton);
      });

      const editButton = getByTestId('pet-edit-option');
      fireEvent.press(editButton);

      const nameInput = getByDisplayValue('Buddy');
      fireEvent.changeText(nameInput, 'Updated Name');

      const submitButton = getByTestId('submit-pet-form');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Error',
          expect.stringContaining('Update failed')
        );
      });
    });
  });

  describe('DELETE Operations', () => {
    it('should show confirmation dialog before deleting pet', async () => {
      mockPetAPI.getAll.mockResolvedValueOnce({
        data: { pets: mockPets }
      });

      const { getByTestId } = render(
        <PetsScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        const moreButton = getByTestId('pet-more-options-1');
        fireEvent.press(moreButton);
      });

      const deleteButton = getByTestId('pet-delete-option');
      fireEvent.press(deleteButton);

      expect(mockAlert).toHaveBeenCalledWith(
        'Delete Pet',
        'Are you sure you want to delete Buddy? This action cannot be undone.',
        expect.any(Array)
      );
    });

    it('should delete pet successfully when confirmed', async () => {
      mockPetAPI.getAll.mockResolvedValueOnce({
        data: { pets: mockPets }
      });

      mockPetAPI.delete.mockResolvedValueOnce({});

      // Mock Alert.alert to auto-confirm deletion
      mockAlert.mockImplementation((title, message, buttons) => {
        if (title === 'Delete Pet') {
          const deleteButton = buttons?.find(b => b.text === 'Delete');
          if (deleteButton?.onPress) {
            deleteButton.onPress();
          }
        }
      });

      const { getByTestId, queryByText } = render(
        <PetsScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        const moreButton = getByTestId('pet-more-options-1');
        fireEvent.press(moreButton);
      });

      const deleteButton = getByTestId('pet-delete-option');
      fireEvent.press(deleteButton);

      await waitFor(() => {
        expect(mockPetAPI.delete).toHaveBeenCalledWith('1');
        expect(mockAlert).toHaveBeenCalledWith('Success', 'Pet deleted successfully');
        expect(queryByText('Buddy')).toBeFalsy(); // Pet should be removed from list
      });
    });

    it('should handle delete API errors', async () => {
      mockPetAPI.getAll.mockResolvedValueOnce({
        data: { pets: mockPets }
      });

      mockPetAPI.delete.mockRejectedValueOnce({
        response: { data: { message: 'Delete failed' } }
      });

      // Mock Alert.alert to auto-confirm deletion
      mockAlert.mockImplementation((title, message, buttons) => {
        if (title === 'Delete Pet') {
          const deleteButton = buttons?.find(b => b.text === 'Delete');
          if (deleteButton?.onPress) {
            deleteButton.onPress();
          }
        }
      });

      const { getByTestId } = render(
        <PetsScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        const moreButton = getByTestId('pet-more-options-1');
        fireEvent.press(moreButton);
      });

      const deleteButton = getByTestId('pet-delete-option');
      fireEvent.press(deleteButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Error',
          expect.stringContaining('Delete failed')
        );
      });
    });

    it('should cancel deletion when user chooses cancel', async () => {
      mockPetAPI.getAll.mockResolvedValueOnce({
        data: { pets: mockPets }
      });

      // Mock Alert.alert to simulate cancel
      mockAlert.mockImplementation((title, message, buttons) => {
        if (title === 'Delete Pet') {
          const cancelButton = buttons?.find(b => b.text === 'Cancel');
          if (cancelButton?.onPress) {
            cancelButton.onPress();
          }
        }
      });

      const { getByTestId, getByText } = render(
        <PetsScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        const moreButton = getByTestId('pet-more-options-1');
        fireEvent.press(moreButton);
      });

      const deleteButton = getByTestId('pet-delete-option');
      fireEvent.press(deleteButton);

      await waitFor(() => {
        expect(mockPetAPI.delete).not.toHaveBeenCalled();
        expect(getByText('Buddy')).toBeTruthy(); // Pet should still be visible
      });
    });
  });

  describe('Navigation Operations', () => {
    it('should navigate to pet details when pet card is pressed', async () => {
      mockPetAPI.getAll.mockResolvedValueOnce({
        data: { pets: mockPets }
      });

      const { getByTestId } = render(
        <PetsScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        const petCard = getByTestId('pet-card-1');
        fireEvent.press(petCard);
      });

      expect(mockNavigation.navigate).toHaveBeenCalledWith('PetDetails', { petId: '1' });
    });

    it('should show action sheet with correct options', async () => {
      mockPetAPI.getAll.mockResolvedValueOnce({
        data: { pets: mockPets }
      });

      const { getByTestId, getByText } = render(
        <PetsScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        const moreButton = getByTestId('pet-more-options-1');
        fireEvent.press(moreButton);
      });

      expect(getByText('Options for Buddy')).toBeTruthy();
      expect(getByText('View Details')).toBeTruthy();
      expect(getByText('Edit Pet')).toBeTruthy();
      expect(getByText('Delete Pet')).toBeTruthy();
    });
  });

  describe('UI State Management', () => {
    it('should show loading spinner while pets are loading', () => {
      mockPetAPI.getAll.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { getByTestId } = render(
        <PetsScreen navigation={mockNavigation} />
      );

      expect(getByTestId('loading-spinner')).toBeTruthy();
      expect(getByTestId('loading-text')).toBeTruthy();
    });

    it('should update pet count in header', async () => {
      mockPetAPI.getAll.mockResolvedValueOnce({
        data: { pets: mockPets }
      });

      const { getByText } = render(
        <PetsScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('2 pets')).toBeTruthy();
      });
    });

    it('should show singular pet text for one pet', async () => {
      mockPetAPI.getAll.mockResolvedValueOnce({
        data: { pets: [mockPets[0]] }
      });

      const { getByText } = render(
        <PetsScreen navigation={mockNavigation} />
      );

      await waitFor(() => {
        expect(getByText('1 pet')).toBeTruthy();
      });
    });

    it('should close modal when form is submitted successfully', async () => {
      mockPetAPI.getAll.mockResolvedValueOnce({
        data: { pets: mockPets }
      });

      mockPetAPI.create.mockResolvedValueOnce({
        data: { pet: { id: '3', name: 'New Pet', species: 'Dog' } }
      });

      const { getByTestId, queryByText } = render(
        <PetsScreen navigation={mockNavigation} />
      );

      // Open modal
      await waitFor(() => {
        const addButton = getByTestId('add-pet-button');
        fireEvent.press(addButton);
      });

      expect(queryByText('Add Pet')).toBeTruthy();

      // Fill and submit form
      const nameInput = getByTestId('pet-name-input');
      const speciesInput = getByTestId('pet-species-input');

      fireEvent.changeText(nameInput, 'New Pet');
      fireEvent.changeText(speciesInput, 'Dog');

      const submitButton = getByTestId('submit-pet-form');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(queryByText('Add Pet')).toBeFalsy(); // Modal should be closed
      });
    });
  });
});