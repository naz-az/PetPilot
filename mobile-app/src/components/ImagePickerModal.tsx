import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Modal } from './Modal';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (imageUri: string) => void;
  title?: string;
}

export default function ImagePickerModal({
  visible,
  onClose,
  onImageSelected,
  title = 'Select Photo',
}: ImagePickerModalProps) {
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'We need camera and photo library permissions to select images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  };

  const handleTakePhoto = async () => {
    try {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
        onClose();
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleSelectFromLibrary = async () => {
    try {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
        onClose();
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove the current photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            onImageSelected('');
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
        <Text style={styles.subtitle}>Choose how you'd like to add a photo</Text>

        <View style={styles.options}>
          <TouchableOpacity style={styles.option} onPress={handleTakePhoto}>
            <View style={[styles.optionIcon, { backgroundColor: Colors.primary + '20' }]}>
              <Ionicons name="camera" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.optionTitle}>Take Photo</Text>
            <Text style={styles.optionSubtitle}>Use your camera to take a new photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handleSelectFromLibrary}>
            <View style={[styles.optionIcon, { backgroundColor: Colors.info + '20' || '#007AFF20' }]}>
              <Ionicons name="images" size={32} color={Colors.info || '#007AFF'} />
            </View>
            <Text style={styles.optionTitle}>Choose from Library</Text>
            <Text style={styles.optionSubtitle}>Select an existing photo from your gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handleRemovePhoto}>
            <View style={[styles.optionIcon, { backgroundColor: Colors.error + '20' || '#FF3B3020' }]}>
              <Ionicons name="trash" size={32} color={Colors.error || '#FF3B30'} />
            </View>
            <Text style={styles.optionTitle}>Remove Photo</Text>
            <Text style={styles.optionSubtitle}>Remove the current photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>📸 Photo Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Use good lighting for the best quality</Text>
            <Text style={styles.tipItem}>• Center your pet in the frame</Text>
            <Text style={styles.tipItem}>• Square photos work best for profiles</Text>
            <Text style={styles.tipItem}>• Make sure your pet is clearly visible</Text>
          </View>
        </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: Layout.window.height * 0.9,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  subtitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xl,
    textAlign: 'center',
  },

  options: {
    gap: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  optionTitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    marginBottom: 4,
    flex: 1,
  },

  optionSubtitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },

  tips: {
    backgroundColor: Colors.backgroundCard,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  tipsTitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },

  tipsList: {
    gap: Layout.spacing.xs,
  },

  tipItem: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});