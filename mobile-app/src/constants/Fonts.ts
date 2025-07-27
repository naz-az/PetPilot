export const Fonts = {
  // Font Families (matching the clean sans-serif from reference)
  primary: 'System',
  secondary: 'System',
  
  // Font Sizes
  tiny: 10,
  small: 12,
  regular: 14,
  medium: 16,
  large: 18,
  xl: 20,
  xxl: 24,
  huge: 32,
  
  // Font Weights
  light: '300' as const,
  normal: '400' as const,
  mediumWeight: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};