import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  weight?: number;
  size: 'Small' | 'Medium' | 'Large' | 'Extra Large';
  color?: string;
  photo?: string;
  description?: string;
  medicalNotes?: string;
  emergencyContact?: string;
  microchipId?: string;
  lastVetVisit?: string;
}

interface PetCardProps {
  pet: Pet;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onMoreOptions?: () => void;
}

export const PetCard: React.FC<PetCardProps> = ({
  pet,
  onPress,
  onEdit,
  onDelete,
  onMoreOptions,
}) => {
  const getSizeIcon = (size: string) => {
    switch (size) {
      case 'SMALL': return 'paw-outline';
      case 'MEDIUM': return 'paw';
      case 'LARGE': return 'paw';
      case 'EXTRA_LARGE': return 'paw';
      default: return 'paw';
    }
  };

  const getSpeciesIcon = (species: string) => {
    switch (species.toLowerCase()) {
      case 'dog': return '🐕';
      case 'cat': return '🐱';
      case 'bird': return '🐦';
      case 'fish': return '🐠';
      case 'rabbit': return '🐰';
      default: return '🐾';
    }
  };

  const getSizeLabel = (size: string) => {
    switch (size) {
      case 'SMALL': return 'Small';
      case 'MEDIUM': return 'Medium';
      case 'LARGE': return 'Large';
      case 'EXTRA_LARGE': return 'Extra Large';
      default: return size;
    }
  };

  return (
    <GlassCard style={styles.container}>
      <TouchableOpacity onPress={onPress} style={styles.content}>
        <View style={styles.header}>
          <View style={styles.petInfo}>
            <View style={styles.iconContainer}>
              {pet.photo ? (
                <Image source={{ uri: pet.photo }} style={styles.petImage} />
              ) : (
                <Text style={styles.speciesEmoji}>{getSpeciesIcon(pet.species)}</Text>
              )}
            </View>
            <View style={styles.nameSection}>
              <Text style={styles.name}>{pet.name}</Text>
              <Text style={styles.breed}>
                {pet.breed || pet.species} {pet.age && `• ${pet.age} years old`}
              </Text>
            </View>
          </View>
          
          {onMoreOptions && (
            <TouchableOpacity onPress={onMoreOptions} style={styles.moreButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons name={getSizeIcon(pet.size) as any} size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{getSizeLabel(pet.size)}</Text>
          </View>
          
          {pet.weight && (
            <View style={styles.detailItem}>
              <Ionicons name="scale-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{pet.weight} kg</Text>
            </View>
          )}
          
          {pet.color && (
            <View style={styles.detailItem}>
              <Ionicons name="color-palette-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{pet.color}</Text>
            </View>
          )}
        </View>

        {pet.description && (
          <Text style={styles.description} numberOfLines={2}>
            {pet.description}
          </Text>
        )}

        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <Ionicons name="create-outline" size={18} color={Colors.primary} />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          )}
          
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.md,
  },
  
  content: {
    padding: 0,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.md,
  },
  
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.md,
    overflow: 'hidden',
  },
  
  petImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  
  speciesEmoji: {
    fontSize: 28,
  },
  
  nameSection: {
    flex: 1,
  },
  
  name: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.bold,
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  
  breed: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
  },
  
  moreButton: {
    padding: Layout.spacing.sm,
  },
  
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Layout.spacing.md,
  },
  
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Layout.spacing.lg,
    marginBottom: Layout.spacing.xs,
  },
  
  detailText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    marginLeft: Layout.spacing.xs,
  },
  
  description: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: Fonts.lineHeight.normal * Fonts.regular,
    marginBottom: Layout.spacing.md,
  },
  
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.sm,
  },
  
  actionText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    fontWeight: Fonts.mediumWeight,
    color: Colors.primary,
    marginLeft: Layout.spacing.xs,
  },
  
  deleteText: {
    color: Colors.error,
  },
});