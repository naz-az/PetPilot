import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

interface ProfileDropdownProps {
  user: {
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    avatar?: string;
  } | null;
  onProfile: () => void;
  onLogout: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user,
  onProfile,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleProfile = () => {
    setIsOpen(false);
    onProfile();
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  const getUserName = () => {
    if (!user) return 'User';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.name || 'User';
  };

  const getAvatarSource = () => {
    if (user?.avatar) {
      return { uri: user.avatar };
    }
    // Default profile image if no avatar
    return { uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face' };
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        <Image source={getAvatarSource()} style={styles.avatar} />
        <Ionicons 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={16} 
          color={Colors.textSecondary}
          style={styles.chevron}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdown}>
          <View style={styles.userInfo}>
            <Image source={getAvatarSource()} style={styles.dropdownAvatar} />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{getUserName()}</Text>
              <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
            </View>
          </View>
          
          <View style={styles.separator} />
          
          <TouchableOpacity style={styles.menuItem} onPress={handleProfile}>
            <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.menuText}>View Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={[styles.menuText, { color: Colors.error }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {isOpen && (
        <TouchableOpacity 
          style={styles.overlay} 
          onPress={() => setIsOpen(false)}
          activeOpacity={1}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },

  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 25,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },

  chevron: {
    marginLeft: 4,
  },

  dropdown: {
    position: 'absolute',
    top: 52,
    right: 0,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Layout.radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 200,
    zIndex: 1001,
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 999,
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
  },

  dropdownAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: Layout.spacing.sm,
  },

  userDetails: {
    flex: 1,
  },

  userName: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    marginBottom: 2,
  },

  userEmail: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
  },

  separator: {
    height: 1,
    backgroundColor: Colors.glassBorder,
    marginHorizontal: Layout.spacing.sm,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
  },

  menuText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.text,
    marginLeft: Layout.spacing.sm,
    fontWeight: Fonts.mediumWeight,
  },
});