import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

export interface ActionSheetOption {
  id: string;
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  onPress: () => void;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  options: ActionSheetOption[];
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  onClose,
  title,
  options,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <BlurView intensity={20} style={styles.blurView}>
            <TouchableWithoutFeedback>
              <Animated.View 
                style={[
                  styles.container,
                  { transform: [{ translateY: slideAnim }] }
                ]}
              >
                {title && (
                  <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                  </View>
                )}
                
                <View style={styles.optionsContainer}>
                  {options.map((option, index) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.option,
                        index === options.length - 1 && styles.lastOption,
                      ]}
                      onPress={() => {
                        option.onPress();
                        onClose();
                      }}
                    >
                      {option.icon && (
                        <Ionicons
                          name={option.icon}
                          size={20}
                          color={option.destructive ? Colors.error : Colors.textSecondary}
                          style={styles.optionIcon}
                        />
                      )}
                      <Text 
                        style={[
                          styles.optionText,
                          option.destructive && styles.destructiveText,
                        ]}
                      >
                        {option.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </BlurView>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  
  blurView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  
  container: {
    backgroundColor: Colors.glass,
    borderTopLeftRadius: Layout.radius.xl,
    borderTopRightRadius: Layout.radius.xl,
    paddingBottom: Layout.spacing.xl,
  },
  
  header: {
    paddingVertical: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  
  title: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    textAlign: 'center',
  },
  
  optionsContainer: {
    paddingTop: Layout.spacing.md,
  },
  
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  
  lastOption: {
    borderBottomWidth: 0,
  },
  
  optionIcon: {
    marginRight: Layout.spacing.md,
  },
  
  optionText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.medium,
    color: Colors.text,
    flex: 1,
  },
  
  destructiveText: {
    color: Colors.error,
  },
  
  cancelButton: {
    marginTop: Layout.spacing.lg,
    marginHorizontal: Layout.spacing.lg,
    backgroundColor: Colors.inputBackground,
    borderRadius: Layout.radius.md,
    paddingVertical: Layout.spacing.md,
    alignItems: 'center',
  },
  
  cancelText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.medium,
    fontWeight: Fonts.semibold,
    color: Colors.textSecondary,
  },
});