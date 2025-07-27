import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

interface SocialButtonProps {
  provider: 'facebook' | 'google';
  onPress: () => void;
  style?: ViewStyle;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  onPress,
  style,
}) => {
  const getProviderConfig = () => {
    switch (provider) {
      case 'facebook':
        return {
          icon: 'logo-facebook' as keyof typeof Ionicons.glyphMap,
          text: 'Facebook',
          color: Colors.facebook,
        };
      case 'google':
        return {
          icon: 'logo-google' as keyof typeof Ionicons.glyphMap,
          text: 'Google',
          color: Colors.google,
        };
    }
  };

  const config = getProviderConfig();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, style]}
      activeOpacity={0.8}
    >
      <BlurView intensity={20} style={styles.blurView}>
        <View style={styles.content}>
          <Ionicons
            name={config.icon}
            size={20}
            color={config.color}
            style={styles.icon}
          />
          <Text style={styles.text}>{config.text}</Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    overflow: 'hidden',
    marginVertical: Layout.spacing.xs,
  },
  
  blurView: {
    backgroundColor: Colors.inputBackground,
  },
  
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
  },
  
  icon: {
    marginRight: Layout.spacing.sm,
  },
  
  text: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.medium,
    fontWeight: Fonts.mediumWeight,
    color: Colors.text,
  },
});