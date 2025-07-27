import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

interface GlassInputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  icon,
  error,
  isPassword = false,
  containerStyle,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
      ]}>
        <BlurView intensity={20} style={styles.blurView}>
          <View style={styles.inputWrapper}>
            {icon && (
              <Ionicons
                name={icon}
                size={20}
                color={isFocused ? Colors.primary : Colors.textSecondary}
                style={styles.icon}
              />
            )}
            
            <TextInput
              style={[styles.input, style]}
              placeholderTextColor={Colors.textMuted}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              secureTextEntry={isPassword && !isPasswordVisible}
              {...props}
            />
            
            {isPassword && (
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.passwordToggle}
              >
                <Ionicons
                  name={isPasswordVisible ? 'eye-off' : 'eye'}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </BlurView>
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.md,
  },
  
  label: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    fontWeight: Fonts.mediumWeight,
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  
  inputContainer: {
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    overflow: 'hidden',
  },
  
  inputContainerFocused: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  inputContainerError: {
    borderColor: Colors.error,
  },
  
  blurView: {
    backgroundColor: Colors.inputBackground,
  },
  
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
  },
  
  icon: {
    marginRight: Layout.spacing.sm,
  },
  
  input: {
    flex: 1,
    fontFamily: Fonts.primary,
    fontSize: Fonts.medium,
    color: Colors.text,
    paddingVertical: 0, // Remove default padding on Android
  },
  
  passwordToggle: {
    padding: Layout.spacing.xs,
    marginLeft: Layout.spacing.sm,
  },
  
  errorText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.error,
    marginTop: Layout.spacing.xs,
    marginLeft: Layout.spacing.xs,
  },
});