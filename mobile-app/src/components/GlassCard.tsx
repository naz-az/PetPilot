import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  borderRadius?: number;
  padding?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 20,
  borderRadius = Layout.radius.lg,
  padding = Layout.spacing.lg,
}) => {
  return (
    <View style={[styles.container, { borderRadius }, style]}>
      <BlurView intensity={intensity} style={[styles.blurView, { borderRadius }]}>
        <View style={[styles.content, { padding, borderRadius }]}>
          {children}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    ...Layout.shadow.medium,
  },
  
  blurView: {
    backgroundColor: Colors.glass,
  },
  
  content: {
    backgroundColor: 'transparent',
  },
});