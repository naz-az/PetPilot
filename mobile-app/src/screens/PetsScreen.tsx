import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import {
  ScreenHeader,
  EmptyState,
  LoadingSpinner,
  ActionSheet,
  ActionSheetOption,
} from '../components';
import { PetCard, Pet } from '../components/PetCard';
import { PetFormModal } from '../components/PetFormModal';
import { Colors } from '../constants/Colors';
import { petAPI } from '../services/api';

interface PetsScreenProps {
  navigation: any;
}

export default function PetsScreen({ navigation }: PetsScreenProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const loadPets = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      console.log('🐕 Loading pets...');
      const response = await petAPI.getAll();
      const fetchedPets = response.data.pets || [];
      setPets(fetchedPets);
      console.log('✅ Pets loaded:', fetchedPets.length);
    } catch (error) {
      console.error('❌ Error loading pets:', error);
      Alert.alert('Error', 'Failed to load pets. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadPets(false);
  };

  const handleAddPet = () => {
    setSelectedPet(null);
    setShowFormModal(true);
  };

  const handleEditPet = (pet: Pet) => {
    setSelectedPet(pet);
    setShowFormModal(true);
    setShowActionSheet(false);
  };

  const handleDeletePet = (pet: Pet) => {
    setShowActionSheet(false);
    Alert.alert(
      'Delete Pet',
      `Are you sure you want to delete ${pet.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePet(pet.id),
        },
      ]
    );
  };

  const deletePet = async (petId: string) => {
    try {
      console.log('🗑️ Deleting pet:', petId);
      await petAPI.delete(petId);
      console.log('✅ Pet deleted successfully');
      
      // Remove pet from local state
      setPets(prev => prev.filter(pet => pet.id !== petId));
      
      Alert.alert('Success', 'Pet deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting pet:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete pet');
    }
  };

  const handleViewPet = (pet: Pet) => {
    console.log('👁️ Viewing pet details:', pet.name);
    navigation.navigate('PetDetails', { petId: pet.id });
  };

  const handleMoreOptions = (pet: Pet) => {
    setSelectedPet(pet);
    setShowActionSheet(true);
  };

  const handleFormSubmit = async (petData: Pet) => {
    setFormLoading(true);
    try {
      console.log('💾 Saving pet:', petData);
      
      if (selectedPet) {
        // Update existing pet
        const response = await petAPI.update(selectedPet.id, petData);
        console.log('✅ Pet updated:', response.data);
        
        // Update pet in local state
        setPets(prev => prev.map(pet => 
          pet.id === selectedPet.id ? { ...pet, ...response.data.pet } : pet
        ));
        
        Alert.alert('Success', 'Pet updated successfully!');
      } else {
        // Create new pet
        const response = await petAPI.create(petData);
        console.log('✅ Pet created:', response.data);
        
        // Add new pet to local state
        setPets(prev => [response.data.pet, ...prev]);
        
        Alert.alert('Success', 'Pet added successfully!');
      }
    } catch (error: any) {
      console.error('❌ Error saving pet:', error);
      throw new Error(error.response?.data?.message || 'Failed to save pet');
    } finally {
      setFormLoading(false);
    }
  };

  const actionSheetOptions: ActionSheetOption[] = [
    {
      id: 'view',
      title: 'View Details',
      icon: 'eye-outline',
      onPress: () => selectedPet && handleViewPet(selectedPet),
    },
    {
      id: 'edit',
      title: 'Edit Pet',
      icon: 'create-outline',
      onPress: () => selectedPet && handleEditPet(selectedPet),
    },
    {
      id: 'delete',
      title: 'Delete Pet',
      icon: 'trash-outline',
      destructive: true,
      onPress: () => selectedPet && handleDeletePet(selectedPet),
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={[Colors.background, Colors.backgroundSecondary]}
          style={styles.gradient}
        >
          <ScreenHeader title="My Pets" subtitle="Manage your furry friends" />
          <LoadingSpinner text="Loading your pets..." />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[Colors.background, Colors.backgroundSecondary]}
        style={styles.gradient}
      >
        <ScreenHeader
          title="My Pets"
          subtitle={`${pets.length} ${pets.length === 1 ? 'pet' : 'pets'}`}
          rightIcon="add"
          onRightPress={handleAddPet}
        />

        {pets.length === 0 ? (
          <EmptyState
            icon="paw-outline"
            title="No Pets Yet"
            subtitle="Add your first pet to get started with PetPilot's services"
            buttonText="Add Your First Pet"
            onButtonPress={handleAddPet}
          />
        ) : (
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.primary}
                colors={[Colors.primary]}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {pets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onPress={() => handleViewPet(pet)}
                onEdit={() => handleEditPet(pet)}
                onDelete={() => handleDeletePet(pet)}
                onMoreOptions={() => handleMoreOptions(pet)}
              />
            ))}
          </ScrollView>
        )}

        <PetFormModal
          visible={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setSelectedPet(null);
          }}
          onSubmit={handleFormSubmit}
          editingPet={selectedPet}
          loading={formLoading}
        />

        <ActionSheet
          visible={showActionSheet}
          onClose={() => {
            setShowActionSheet(false);
            setSelectedPet(null);
          }}
          title={selectedPet ? `Options for ${selectedPet.name}` : undefined}
          options={actionSheetOptions}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  gradient: {
    flex: 1,
  },
  
  content: {
    flex: 1,
  },
  
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
});