import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from './Modal';
import { GlassButton } from './GlassButton';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  pilotName: string;
  pilotId: string;
  bookingId?: string;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  pilotName,
  pilotId,
  bookingId,
  onSubmit,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(rating, comment.trim());
      onClose();
      setRating(0);
      setComment('');
      Alert.alert('Success', 'Thank you for your review!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={40}
              color={star <= rating ? Colors.warning : Colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getRatingText = () => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select a rating';
    }
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Rate Your Experience</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.pilotName}>How was your experience with {pilotName}?</Text>

          {renderStars()}

          <Text style={styles.ratingText}>{getRatingText()}</Text>

          <Text style={styles.commentLabel}>Tell us more about your experience:</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Write your review here (optional)..."
            placeholderTextColor={Colors.textSecondary}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />

          <Text style={styles.characterCount}>{comment.length}/500</Text>
        </View>

        <View style={styles.footer}>
          <GlassButton
            title="Cancel"
            onPress={onClose}
            variant="outline"
            style={styles.cancelButton}
          />
          <GlassButton
            title="Submit Review"
            onPress={handleSubmit}
            loading={loading}
            disabled={rating === 0}
            style={styles.submitButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: Layout.window.height * 0.7,
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
    alignItems: 'center',
  },

  pilotName: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
  },

  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Layout.spacing.md,
  },

  starButton: {
    marginHorizontal: Layout.spacing.xs,
    padding: Layout.spacing.xs,
  },

  ratingText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.semibold,
    color: Colors.primary,
    marginBottom: Layout.spacing.xl,
  },

  commentLabel: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.text,
    alignSelf: 'flex-start',
    marginBottom: Layout.spacing.sm,
  },

  commentInput: {
    width: '100%',
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.text,
    minHeight: 100,
    marginBottom: Layout.spacing.xs,
  },

  characterCount: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    alignSelf: 'flex-end',
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