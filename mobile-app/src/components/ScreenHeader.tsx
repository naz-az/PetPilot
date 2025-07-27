import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  onBack?: () => void; // Alternative name for onBackPress
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  rightText?: string;
  rightAction?: React.ReactNode; // Custom right action component
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  onBack,
  rightIcon,
  onRightPress,
  rightText,
  rightAction,
}) => {
  const handleBackPress = onBack || onBackPress;
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </TouchableOpacity>
        )}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      
      {rightAction ? (
        rightAction
      ) : (rightIcon || rightText) ? (
        <TouchableOpacity onPress={onRightPress} style={styles.rightButton}>
          {rightIcon && (
            <Ionicons name={rightIcon} size={24} color={Colors.primary} />
          )}
          {rightText && (
            <Text style={styles.rightText}>{rightText}</Text>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    paddingTop: Layout.spacing.xl,
  },
  
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  backButton: {
    marginRight: Layout.spacing.md,
    padding: Layout.spacing.xs,
  },
  
  titleSection: {
    flex: 1,
  },
  
  title: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.xxl,
    fontWeight: Fonts.bold,
    color: Colors.text,
  },
  
  subtitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.xs,
  },
  
  rightButton: {
    padding: Layout.spacing.xs,
    alignItems: 'center',
  },
  
  rightText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.medium,
    fontWeight: Fonts.semibold,
    color: Colors.primary,
  },
});