import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from './Modal';
import { GlassInput } from './GlassInput';
import { GlassButton } from './GlassButton';
import ImagePickerModal from './ImagePickerModal';
import { Pet } from './PetCard';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

interface PetFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (petData: Pet) => Promise<void>;
  editingPet?: Pet | null;
  loading?: boolean;
}

export const PetFormModal: React.FC<PetFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  editingPet,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    weight: '',
    size: 'Medium' as Pet['size'],
    color: '',
    description: '',
    photo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showImagePicker, setShowImagePicker] = useState(false);

  const sizeOptions = [
    { value: 'Small', label: 'Small' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Large', label: 'Large' },
    { value: 'Extra Large', label: 'Extra Large' },
  ];

  useEffect(() => {
    if (editingPet) {
      setFormData({
        name: editingPet.name || '',
        species: editingPet.species || '',
        breed: editingPet.breed || '',
        age: editingPet.age?.toString() || '',
        weight: editingPet.weight?.toString() || '',
        size: editingPet.size || 'Medium',
        color: editingPet.color || '',
        description: editingPet.description || '',
        photo: editingPet.photo || '',
      });
    } else {
      setFormData({
        name: '',
        species: '',
        breed: '',
        age: '',
        weight: '',
        size: 'Medium',
        color: '',
        description: '',
        photo: '',
      });
    }
    setErrors({});
  }, [editingPet, visible]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Pet name is required';
    }

    if (!formData.species.trim()) {
      newErrors.species = 'Species is required';
    }

    if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) < 0)) {
      newErrors.age = 'Please enter a valid age';
    }

    if (formData.weight && (isNaN(Number(formData.weight)) || Number(formData.weight) <= 0)) {
      newErrors.weight = 'Please enter a valid weight';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const petData: Pet = {
        id: editingPet?.id || Date.now().toString(),
        name: formData.name.trim(),
        species: formData.species.trim(),
        breed: formData.breed.trim() || undefined,
        age: formData.age ? Number(formData.age) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        size: formData.size,
        color: formData.color.trim() || undefined,
        description: formData.description.trim() || undefined,
        photo: formData.photo || undefined,
      };

      await onSubmit(petData);
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save pet information');
    }
  };

  const handleImageSelected = (imageUri: string) => {
    setFormData(prev => ({ ...prev, photo: imageUri }));
  };

  const handlePhotoPress = () => {
    setShowImagePicker(true);
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {editingPet ? 'Edit Pet' : 'Add New Pet'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Photo Section */}
          <View style={styles.photoSection}>
            <Text style={styles.sectionLabel}>Pet Photo</Text>
            <TouchableOpacity style={styles.photoContainer} onPress={handlePhotoPress}>
              {formData.photo ? (
                <Image source={{ uri: formData.photo }} style={styles.petPhoto} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera" size={32} color={Colors.textSecondary} />
                  <Text style={styles.photoPlaceholderText}>Add Photo</Text>
                </View>
              )}
              <View style={styles.photoEditIcon}>
                <Ionicons name="pencil" size={16} color={Colors.text} />
              </View>
            </TouchableOpacity>
          </View>

          <GlassInput
            placeholder="Pet Name"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            icon="paw"
            error={errors.name}
          />

          <GlassInput
            placeholder="Species (e.g., Dog, Cat, Bird)"
            value={formData.species}
            onChangeText={(value) => handleInputChange('species', value)}
            icon="leaf-outline"
            error={errors.species}
          />

          <GlassInput
            placeholder="Breed (optional)"
            value={formData.breed}
            onChangeText={(value) => handleInputChange('breed', value)}
            icon="ribbon-outline"
          />

          <View style={styles.row}>
            <GlassInput
              placeholder="Age"
              value={formData.age}
              onChangeText={(value) => handleInputChange('age', value)}
              keyboardType="numeric"
              icon="time-outline"
              containerStyle={styles.halfWidth}
              error={errors.age}
            />

            <GlassInput
              placeholder="Weight (kg)"
              value={formData.weight}
              onChangeText={(value) => handleInputChange('weight', value)}
              keyboardType="numeric"
              icon="scale-outline"
              containerStyle={styles.halfWidth}
              error={errors.weight}
            />
          </View>

          <View style={styles.sizeSection}>
            <Text style={styles.sectionTitle}>Size</Text>
            <View style={styles.sizeOptions}>
              {sizeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sizeOption,
                    formData.size === option.value && styles.sizeOptionSelected,
                  ]}
                  onPress={() => handleInputChange('size', option.value)}
                >
                  <Text
                    style={[
                      styles.sizeOptionText,
                      formData.size === option.value && styles.sizeOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <GlassInput
            placeholder="Color (optional)"
            value={formData.color}
            onChangeText={(value) => handleInputChange('color', value)}
            icon="color-palette-outline"
          />

          <GlassInput
            placeholder="Description (optional)"
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            multiline
            numberOfLines={3}
            icon="document-text-outline"
            containerStyle={styles.descriptionInput}
          />
        </ScrollView>

        <View style={styles.footer}>
          <GlassButton
            title="Cancel"
            onPress={onClose}
            variant="outline"
            style={styles.cancelButton}
          />
          <GlassButton
            title={editingPet ? 'Update Pet' : 'Add Pet'}
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      </View>

      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onImageSelected={handleImageSelected}
        title="Pet Photo"
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: Layout.window.height * 0.9,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  
  title: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.xl,
    fontWeight: Fonts.bold,
    color: Colors.text,
  },
  
  closeButton: {
    padding: Layout.spacing.xs,
  },
  
  content: {
    maxHeight: Layout.window.height * 0.6,
  },

  photoSection: {
    marginBottom: Layout.spacing.xl,
    alignItems: 'center',
  },

  sectionLabel: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },

  photoContainer: {
    position: 'relative',
  },

  petPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.primary,
  },

  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 2,
    borderColor: Colors.glassBorder,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },

  photoPlaceholderText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.xs,
  },

  photoEditIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  halfWidth: {
    flex: 1,
    marginHorizontal: Layout.spacing.xs,
  },
  
  sizeSection: {
    marginBottom: Layout.spacing.md,
  },
  
  sectionTitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    fontWeight: Fonts.mediumWeight,
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  
  sizeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  sizeOption: {
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: Layout.radius.sm,
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    marginRight: Layout.spacing.sm,
    marginBottom: Layout.spacing.sm,
  },
  
  sizeOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  
  sizeOptionText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    fontWeight: Fonts.mediumWeight,
  },
  
  sizeOptionTextSelected: {
    color: Colors.text,
  },
  
  descriptionInput: {
    marginBottom: Layout.spacing.lg,
  },
  
  footer: {
    flexDirection: 'row',
    marginTop: Layout.spacing.lg,
    paddingTop: Layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },
  
  cancelButton: {
    flex: 1,
    marginRight: Layout.spacing.sm,
  },
  
  submitButton: {
    flex: 1,
    marginLeft: Layout.spacing.sm,
  },
});