import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import {
  ScreenHeader,
  GlassCard,
  GlassButton,
  LoadingSpinner,
  PetFormModal,
  ActionSheet,
  MedicalHistoryModal,
} from '../components';
import type { Pet } from '../components/PetCard';
import type { ActionSheetOption } from '../components/ActionSheet';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';
import { petAPI } from '../services/api';

type PetDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'PetDetails'>;

export default function PetDetailsScreen({ route, navigation }: PetDetailsScreenProps) {
  const { petId } = route.params;
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [medicalHistoryVisible, setMedicalHistoryVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    loadPetDetails();
  }, [petId]);

  const loadPetDetails = async () => {
    try {
      console.log('Loading pet details for:', petId);
      // Try to get pet from API first, fall back to mock data
      try {
        const response = await petAPI.getById(petId);
        setPet(response.data.pet);
      } catch (apiError) {
        console.log('API call failed, using mock data for petId:', petId);
        // Generate different mock data based on petId
        const mockPets: { [key: string]: Pet } = {
          '1': {
            id: petId,
            name: 'Buddy',
            species: 'Dog',
            breed: 'Golden Retriever',
            age: 3,
            weight: 65,
            size: 'Large',
            color: 'Golden',
            photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop&crop=face',
            description: 'Friendly and energetic dog who loves playing fetch and going on walks.',
            medicalNotes: 'Up to date on all vaccinations. Allergic to chicken.',
            emergencyContact: 'Dr. Smith - (555) 123-4567',
            microchipId: 'ABC123456789',
            lastVetVisit: '2024-01-15',
          },
          '2': {
            id: petId,
            name: 'Luna',
            species: 'Cat',
            breed: 'Persian',
            age: 2,
            weight: 12,
            size: 'Medium',
            color: 'White',
            photo: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop&crop=face',
            description: 'Calm and affectionate cat who enjoys quiet environments and gentle pets.',
            medicalNotes: 'Spayed. Regular flea treatment required.',
            emergencyContact: 'Dr. Johnson - (555) 234-5678',
            microchipId: 'XYZ987654321',
            lastVetVisit: '2024-02-20',
          },
          '3': {
            id: petId,
            name: 'Max',
            species: 'Dog',
            breed: 'German Shepherd',
            age: 5,
            weight: 80,
            size: 'Large',
            color: 'Black and Tan',
            photo: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=400&fit=crop&crop=face',
            description: 'Intelligent and loyal working dog. Great with children and very protective.',
            medicalNotes: 'Hip dysplasia monitoring required. Regular exercise recommended.',
            emergencyContact: 'Dr. Wilson - (555) 345-6789',
            microchipId: 'DEF456123789',
            lastVetVisit: '2024-01-30',
          },
          '4': {
            id: petId,
            name: 'Bella',
            species: 'Dog',
            breed: 'Labrador',
            age: 1,
            weight: 45,
            size: 'Medium',
            color: 'Chocolate',
            photo: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop&crop=face',
            description: 'Young and playful puppy who loves swimming and playing with toys.',
            medicalNotes: 'Puppy vaccinations in progress. Next shot due in 2 weeks.',
            emergencyContact: 'Dr. Brown - (555) 456-7890',
            microchipId: 'GHI789456123',
            lastVetVisit: '2024-02-10',
          },
          '5': {
            id: petId,
            name: 'Whiskers',
            species: 'Cat',
            breed: 'Maine Coon',
            age: 4,
            weight: 18,
            size: 'Large',
            color: 'Tabby',
            photo: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=400&h=400&fit=crop&crop=face',
            description: 'Large, gentle giant who loves to be brushed and enjoys high perches.',
            medicalNotes: 'Regular grooming required. Prone to hairballs.',
            emergencyContact: 'Dr. Davis - (555) 567-8901',
            microchipId: 'JKL123789456',
            lastVetVisit: '2024-02-05',
          },
        };
        
        const mockPet = mockPets[petId] || {
          id: petId,
          name: 'Unknown Pet',
          species: 'Dog',
          breed: 'Mixed',
          age: 2,
          weight: 30,
          size: 'Medium',
          color: 'Brown',
          photo: undefined,
          description: 'A lovely pet waiting to be discovered.',
          medicalNotes: 'Regular checkups recommended.',
          emergencyContact: 'Local Vet - (555) 000-0000',
          microchipId: 'UNKNOWN',
          lastVetVisit: '2024-01-01',
        };
        
        setPet(mockPet);
      }
    } catch (error) {
      console.error('Error loading pet details:', error);
      Alert.alert('Error', 'Failed to load pet details.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditModalVisible(true);
  };

  const handleSavePet = async (updatedPet: Pet) => {
    setEditLoading(true);
    try {
      console.log('Updating pet:', updatedPet);
      setPet(updatedPet);
      setEditModalVisible(false);
      Alert.alert('Success', 'Pet updated successfully!');
    } catch (error) {
      console.error('Error updating pet:', error);
      Alert.alert('Error', 'Failed to update pet.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Pet',
      `Are you sure you want to delete ${pet?.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            console.log('Deleting pet:', petId);
            navigation.goBack();
            Alert.alert('Deleted', `${pet?.name} has been removed.`);
          },
        },
      ]
    );
  };

  const handleBookTransport = () => {
    // Navigate back to main tabs (Bookings is within the tab navigator)
    navigation.navigate('Home');
  };

  const handleViewMedicalHistory = () => {
    setMedicalHistoryVisible(true);
  };

  const handleScheduleVetVisit = () => {
    // Open medical history modal with appointments tab active
    setMedicalHistoryVisible(true);
  };

  const actionSheetOptions: ActionSheetOption[] = [
    {
      id: 'edit',
      title: 'Edit Pet',
      icon: 'pencil',
      onPress: handleEdit,
    },
    {
      id: 'book',
      title: 'Book Transport',
      icon: 'car',
      onPress: handleBookTransport,
    },
    {
      id: 'medical',
      title: 'Medical History',
      icon: 'medical',
      onPress: handleViewMedicalHistory,
    },
    {
      id: 'schedule',
      title: 'Schedule Vet Visit',
      icon: 'calendar',
      onPress: handleScheduleVetVisit,
    },
    {
      id: 'delete',
      title: 'Delete Pet',
      icon: 'trash',
      onPress: handleDelete,
      destructive: true,
    },
  ];

  const getSpeciesIcon = (species: string) => {
    switch (species.toLowerCase()) {
      case 'dog':
        return '🐕';
      case 'cat':
        return '🐱';
      case 'bird':
        return '🐦';
      case 'rabbit':
        return '🐰';
      case 'fish':
        return '🐠';
      default:
        return '🐾';
    }
  };

  const getSizeColor = (size: string) => {
    switch (size.toLowerCase()) {
      case 'small':
        return Colors.success || '#34C759';
      case 'medium':
        return Colors.warning || '#FFA500';
      case 'large':
        return Colors.error || '#FF3B30';
      default:
        return Colors.primary;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={[Colors.background, Colors.backgroundSecondary]}
          style={styles.gradient}
        >
          <LoadingSpinner />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={[Colors.background, Colors.backgroundSecondary]}
          style={styles.gradient}
        >
          <ScreenHeader
            title="Pet Not Found"
            showBack
            onBack={() => navigation.goBack()}
          />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Pet not found</Text>
          </View>
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
          title={pet.name}
          subtitle={`${pet.breed} • ${pet.age} years old`}
          showBack
          onBack={() => navigation.goBack()}
          rightAction={
            <TouchableOpacity
              onPress={() => setActionSheetVisible(true)}
              style={styles.actionButton}
            >
              <Ionicons name="ellipsis-horizontal" size={24} color={Colors.text} />
            </TouchableOpacity>
          }
        />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Pet Photo & Basic Info */}
            <GlassCard style={styles.section}>
              <View style={styles.petHeader}>
                <View style={styles.petImageContainer}>
                  {pet.photo ? (
                    <Image source={{ uri: pet.photo }} style={styles.petImage} />
                  ) : (
                    <View style={styles.petImagePlaceholder}>
                      <Text style={styles.petEmoji}>{getSpeciesIcon(pet.species)}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.petBasicInfo}>
                  <Text style={styles.petName}>{pet.name}</Text>
                  <Text style={styles.petBreed}>{pet.breed}</Text>
                  
                  <View style={styles.petTags}>
                    <View style={[styles.tag, { backgroundColor: getSizeColor(pet.size) + '20' }]}>
                      <Text style={[styles.tagText, { color: getSizeColor(pet.size) }]}>
                        {pet.size}
                      </Text>
                    </View>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{pet.age} years</Text>
                    </View>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{pet.weight} lbs</Text>
                    </View>
                  </View>
                </View>
              </View>

              {pet.description && (
                <Text style={styles.description}>{pet.description}</Text>
              )}
            </GlassCard>

            {/* Quick Actions */}
            <GlassCard style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity style={styles.quickAction} onPress={handleBookTransport}>
                  <Ionicons name="car" size={24} color={Colors.primary} />
                  <Text style={styles.quickActionText}>Book Transport</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.quickAction} onPress={handleViewMedicalHistory}>
                  <Ionicons name="medical" size={24} color={Colors.info || '#007AFF'} />
                  <Text style={styles.quickActionText}>Medical History</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.quickAction} onPress={handleScheduleVetVisit}>
                  <Ionicons name="calendar" size={24} color={Colors.success || '#34C759'} />
                  <Text style={styles.quickActionText}>Schedule Visit</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>

            {/* Detailed Information */}
            <GlassCard style={styles.section}>
              <Text style={styles.sectionTitle}>Pet Information</Text>
              
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Species</Text>
                  <Text style={styles.infoValue}>{pet.species}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Color</Text>
                  <Text style={styles.infoValue}>{pet.color}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Weight</Text>
                  <Text style={styles.infoValue}>{pet.weight} lbs</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Size</Text>
                  <Text style={styles.infoValue}>{pet.size}</Text>
                </View>
              </View>
            </GlassCard>

            {/* Medical Information */}
            {(pet.medicalNotes || pet.emergencyContact || pet.microchipId || pet.lastVetVisit) && (
              <GlassCard style={styles.section}>
                <Text style={styles.sectionTitle}>Medical Information</Text>
                
                {pet.medicalNotes && (
                  <View style={styles.medicalItem}>
                    <Text style={styles.medicalLabel}>Medical Notes</Text>
                    <Text style={styles.medicalValue}>{pet.medicalNotes}</Text>
                  </View>
                )}
                
                {pet.emergencyContact && (
                  <View style={styles.medicalItem}>
                    <Text style={styles.medicalLabel}>Emergency Vet</Text>
                    <Text style={styles.medicalValue}>{pet.emergencyContact}</Text>
                  </View>
                )}
                
                {pet.microchipId && (
                  <View style={styles.medicalItem}>
                    <Text style={styles.medicalLabel}>Microchip ID</Text>
                    <Text style={styles.medicalValue}>{pet.microchipId}</Text>
                  </View>
                )}
                
                {pet.lastVetVisit && (
                  <View style={styles.medicalItem}>
                    <Text style={styles.medicalLabel}>Last Vet Visit</Text>
                    <Text style={styles.medicalValue}>
                      {new Date(pet.lastVetVisit).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </GlassCard>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <GlassButton
                title="Edit Pet"
                onPress={handleEdit}
                variant="outline"
                style={styles.editButton}
              />
              <GlassButton
                title="Book Transport"
                onPress={handleBookTransport}
                style={styles.bookButton}
              />
            </View>
          </View>
        </ScrollView>

        <ActionSheet
          visible={actionSheetVisible}
          onClose={() => setActionSheetVisible(false)}
          options={actionSheetOptions}
        />

        {pet && (
          <PetFormModal
            visible={editModalVisible}
            onClose={() => setEditModalVisible(false)}
            onSubmit={handleSavePet}
            editingPet={pet}
            loading={editLoading}
          />
        )}

        {pet && (
          <MedicalHistoryModal
            visible={medicalHistoryVisible}
            onClose={() => setMedicalHistoryVisible(false)}
            petId={pet.id}
            petName={pet.name}
          />
        )}
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

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl,
  },

  section: {
    marginBottom: Layout.spacing.lg,
  },

  sectionTitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.bold,
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },

  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  petHeader: {
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },

  petImageContainer: {
    marginBottom: Layout.spacing.md,
  },

  petImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  petImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
  },

  petEmoji: {
    fontSize: 48,
  },

  petBasicInfo: {
    alignItems: 'center',
  },

  petName: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.xxl,
    fontWeight: Fonts.bold,
    color: Colors.text,
    marginBottom: 4,
  },

  petBreed: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.md,
  },

  petTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Layout.spacing.sm,
  },

  tag: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  tagText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.text,
    fontWeight: Fonts.mediumWeight,
  },

  description: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    paddingTop: Layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },

  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  quickAction: {
    alignItems: 'center',
    padding: Layout.spacing.md,
  },

  quickActionText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.text,
    marginTop: Layout.spacing.xs,
    textAlign: 'center',
  },

  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  infoItem: {
    width: '48%',
    marginBottom: Layout.spacing.md,
  },

  infoLabel: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  infoValue: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.text,
    fontWeight: Fonts.semibold,
  },

  medicalItem: {
    marginBottom: Layout.spacing.md,
  },

  medicalLabel: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: Fonts.semibold,
  },

  medicalValue: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.text,
    lineHeight: 20,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    marginTop: Layout.spacing.lg,
  },

  editButton: {
    flex: 1,
  },

  bookButton: {
    flex: 2,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
  },

  errorText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});