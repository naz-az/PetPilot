import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

export type SettingsItemType = 'navigation' | 'toggle' | 'action';

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  type: SettingsItemType;
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
  disabled?: boolean;
}

export default function SettingsItem({
  icon,
  title,
  subtitle,
  type,
  value = false,
  onPress,
  onToggle,
  danger = false,
  disabled = false,
}: SettingsItemProps) {
  const handlePress = () => {
    if (disabled) return;
    onPress?.();
  };

  const handleToggle = (newValue: boolean) => {
    if (disabled) return;
    onToggle?.(newValue);
  };

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={type === 'navigation' || type === 'action' ? handlePress : undefined}
      activeOpacity={type === 'toggle' ? 1 : 0.7}
      disabled={disabled}
    >
      <BlurView intensity={20} style={styles.card}>
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <View style={[
              styles.iconContainer,
              danger && styles.dangerIconContainer
            ]}>
              <Ionicons
                name={icon}
                size={24}
                color={danger ? Colors.error || '#FF3B30' : Colors.primary}
              />
            </View>
            
            <View style={styles.textSection}>
              <Text style={[
                styles.title,
                danger && styles.dangerText,
                disabled && styles.disabledText
              ]}>
                {title}
              </Text>
              {subtitle && (
                <Text style={[styles.subtitle, disabled && styles.disabledText]}>
                  {subtitle}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.rightSection}>
            {type === 'toggle' && (
              <Switch
                value={value}
                onValueChange={handleToggle}
                trackColor={{
                  false: Colors.textMuted,
                  true: Colors.primary + '40',
                }}
                thumbColor={value ? Colors.primary : Colors.backgroundCard}
                disabled={disabled}
              />
            )}
            
            {(type === 'navigation' || type === 'action') && !disabled && (
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textSecondary}
              />
            )}
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.sm,
  },
  
  disabled: {
    opacity: 0.5,
  },
  
  card: {
    borderRadius: Layout.borderRadius,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.lg,
    backgroundColor: Colors.glass,
  },
  
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  
  dangerIconContainer: {
    backgroundColor: Colors.error + '20' || '#FF3B3020',
    borderColor: Colors.error || '#FF3B30',
  },
  
  textSection: {
    flex: 1,
  },
  
  title: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    marginBottom: 2,
  },
  
  subtitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  
  dangerText: {
    color: Colors.error || '#FF3B30',
  },
  
  disabledText: {
    color: Colors.textMuted,
  },
  
  rightSection: {
    marginLeft: Layout.spacing.md,
  },
});