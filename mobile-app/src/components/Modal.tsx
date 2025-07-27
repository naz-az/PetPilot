import React from 'react';
import {
  View,
  StyleSheet,
  Modal as RNModal,
  TouchableWithoutFeedback,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeight?: number;
  closeOnBackdrop?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  maxHeight = Layout.window.height * 0.9,
  closeOnBackdrop = true,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;
  const [animationComplete, setAnimationComplete] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      setAnimationComplete(false);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setAnimationComplete(true);
      });
    } else {
      setAnimationComplete(false);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <RNModal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
    >
      <TouchableWithoutFeedback onPress={closeOnBackdrop ? onClose : undefined}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <BlurView intensity={20} style={styles.blurView}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardView}
            >
              <TouchableWithoutFeedback>
                <Animated.View 
                  style={[
                    styles.container,
                    { 
                      transform: [{ scale: scaleAnim }],
                      maxHeight,
                    }
                  ]}
                >
                  {children}
                </Animated.View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </BlurView>
        </Animated.View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  
  blurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  
  container: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Layout.radius.xl,
    marginHorizontal: Layout.spacing.lg,
    padding: Layout.spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
    width: '90%',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
});