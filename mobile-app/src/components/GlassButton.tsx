import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    return [
      styles.button,
      styles[size],
      variant === 'outline' && styles.outline,
      disabled && styles.disabled,
      style,
    ].filter(Boolean);
  };

  const getTextStyle = () => {
    return [
      styles.text,
      styles[`${size}Text`],
      variant === 'outline' && styles.outlineText,
      disabled && styles.disabledText,
      textStyle,
    ].filter(Boolean);
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={getButtonStyle()}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color={Colors.text} />
          ) : (
            <Text style={getTextStyle()}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={getButtonStyle()}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.text} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: Layout.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Layout.radius.md,
  },
  
  // Sizes
  small: {
    height: 40,
    paddingHorizontal: Layout.spacing.md,
  },
  
  medium: {
    height: 50,
    paddingHorizontal: Layout.spacing.lg,
  },
  
  large: {
    height: 60,
    paddingHorizontal: Layout.spacing.xl,
  },
  
  // Variants
  outline: {
    backgroundColor: Colors.transparent,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  
  // Text Styles
  text: {
    fontFamily: Fonts.primary,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    textAlign: 'center',
  },
  
  smallText: {
    fontSize: Fonts.regular,
  },
  
  mediumText: {
    fontSize: Fonts.medium,
  },
  
  largeText: {
    fontSize: Fonts.large,
  },
  
  outlineText: {
    color: Colors.primary,
  },
  
  disabledText: {
    opacity: 0.7,
  },
});