import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

export interface ActivityItem {
  id: string;
  type: 'booking' | 'pet' | 'payment' | 'review' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  actionText?: string;
  onAction?: () => void;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  onViewAll?: () => void;
}

export default function ActivityFeed({ activities, onViewAll }: ActivityFeedProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <BlurView intensity={20} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Recent Activity</Text>
          {onViewAll && (
            <TouchableOpacity onPress={onViewAll}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.activitiesList}>
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={[styles.iconContainer, { backgroundColor: activity.iconColor + '20' }]}>
                  <Ionicons
                    name={activity.icon}
                    size={20}
                    color={activity.iconColor}
                  />
                </View>

                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                  <Text style={styles.activityTime}>{formatTime(activity.timestamp)}</Text>
                </View>

                {activity.actionText && activity.onAction && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={activity.onAction}
                  >
                    <Text style={styles.actionText}>{activity.actionText}</Text>
                  </TouchableOpacity>
                )}

                {index < activities.length - 1 && <View style={styles.separator} />}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No recent activity</Text>
              <Text style={styles.emptySubtext}>Your activity will appear here</Text>
            </View>
          )}
        </View>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Layout.borderRadius,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },

  content: {
    padding: Layout.spacing.lg,
    backgroundColor: Colors.glass,
    minHeight: 200, // Ensure consistent height
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },

  title: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.bold,
    color: Colors.text,
  },

  viewAllText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.primary,
    fontWeight: Fonts.mediumWeight,
  },

  activitiesList: {
    gap: Layout.spacing.md,
  },

  activityItem: {
    position: 'relative',
  },

  iconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  activityContent: {
    marginLeft: 52,
    paddingRight: Layout.spacing.md,
  },

  activityTitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    marginBottom: 4,
  },

  activityDescription: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },

  activityTime: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textMuted,
  },

  actionButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.primary + '20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },

  actionText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.primary,
    fontWeight: Fonts.mediumWeight,
  },

  separator: {
    position: 'absolute',
    bottom: -Layout.spacing.md / 2,
    left: 20,
    right: 0,
    height: 1,
    backgroundColor: Colors.glassBorder,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
  },

  emptyText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.md,
    marginBottom: 4,
  },

  emptySubtext: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textMuted,
  },
});