import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Modal } from './Modal';
import { GlassButton } from './GlassButton';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

export interface ConfirmationDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  loading?: boolean;
}

export default function ConfirmationDialog({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  icon,
  iconColor,
  loading = false,
}: ConfirmationDialogProps) {
  const getIconColor = () => {
    if (iconColor) return iconColor;
    if (confirmVariant === 'danger') return Colors.error || '#FF3B30';
    return Colors.primary;
  };

  const getConfirmButtonProps = () => {
    if (confirmVariant === 'danger') {
      return {
        style: { backgroundColor: Colors.error || '#FF3B30' },
        textStyle: { color: Colors.text },
      };
    }
    return {};
  };

  return (
    <Modal visible={visible} onClose={onClose} closeOnBackdrop={!loading}>
      <View style={styles.container}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '20' }]}>
            <Ionicons name={icon} size={48} color={getIconColor()} />
          </View>
        )}

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.buttons}>
          <GlassButton
            title={cancelText}
            onPress={onClose}
            variant="outline"
            style={styles.cancelButton}
            disabled={loading}
          />
          <GlassButton
            title={loading ? 'Please wait...' : confirmText}
            onPress={onConfirm}
            style={StyleSheet.flatten([styles.confirmButton, getConfirmButtonProps().style])}
            textStyle={getConfirmButtonProps().textStyle}
            loading={loading}
            disabled={loading}
          />
        </View>
      </View>
    </Modal>
  );
}

// Pre-defined confirmation dialogs for common use cases
export const DeleteConfirmationDialog = (props: Omit<ConfirmationDialogProps, 'icon' | 'iconColor' | 'confirmVariant'>) => (
  <ConfirmationDialog
    {...props}
    icon="trash"
    confirmVariant="danger"
    confirmText="Delete"
  />
);

export const LogoutConfirmationDialog = (props: Omit<ConfirmationDialogProps, 'icon' | 'iconColor' | 'confirmVariant'>) => (
  <ConfirmationDialog
    {...props}
    icon="log-out"
    confirmVariant="danger"
    confirmText="Logout"
  />
);

export const CancelConfirmationDialog = (props: Omit<ConfirmationDialogProps, 'icon' | 'iconColor' | 'confirmVariant'>) => (
  <ConfirmationDialog
    {...props}
    icon="close-circle"
    confirmVariant="danger"
    confirmText="Cancel Booking"
  />
);

export const SaveConfirmationDialog = (props: Omit<ConfirmationDialogProps, 'icon' | 'iconColor'>) => (
  <ConfirmationDialog
    {...props}
    icon="checkmark-circle"
    confirmText="Save Changes"
  />
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.lg,
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  title: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.xl,
    fontWeight: Fonts.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
  },

  message: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Layout.spacing.xl,
    paddingHorizontal: Layout.spacing.md,
  },

  buttons: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    width: '100%',
  },

  cancelButton: {
    flex: 1,
  },

  confirmButton: {
    flex: 1,
  },
});