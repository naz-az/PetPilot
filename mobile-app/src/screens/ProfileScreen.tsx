import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[Colors.background, Colors.backgroundSecondary]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account settings</Text>
          <Text style={styles.comingSoon}>Coming Soon!</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  gradient: {
    flex: 1,
  },
  
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
  },
  
  title: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.huge,
    fontWeight: Fonts.bold,
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  
  subtitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xl,
    textAlign: 'center',
  },
  
  comingSoon: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.xl,
    color: Colors.primary,
    fontWeight: Fonts.semibold,
  },
});