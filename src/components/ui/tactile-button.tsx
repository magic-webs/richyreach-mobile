import React, { useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  Animated,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import { Colors, FontFamily, Radius } from '@/constants/brand';
import { Icon } from './icon';

export type TactileButtonVariant =
  | 'primary'
  | 'secondary'
  | 'rose'
  | 'green'
  | 'gold'
  | 'white'
  | 'disabled';

export type TactileButtonSize = 'sm' | 'md' | 'lg';

interface TactileButtonProps {
  /**
   * Button text content. Can also pass elements as children.
   */
  children?: React.ReactNode;
  /**
   * Button text if children is not provided.
   */
  text?: string;
  /**
   * Action when pressed.
   */
  onPress?: (event: GestureResponderEvent) => void;
  /**
   * Design variant matching the brand identity.
   * @default 'primary'
   */
  variant?: TactileButtonVariant;
  /**
   * Size configuration.
   * @default 'md'
   */
  size?: TactileButtonSize;
  /**
   * If true, prevents interaction and shows disabled styles.
   */
  disabled?: boolean;
  /**
   * If true, shows a spinner instead of text/icons and disables presses.
   */
  loading?: boolean;
  /**
   * Optional icon name (Feather or MaterialIcons) to show.
   */
  icon?: string;
  /**
   * Position of the icon relative to the text.
   * @default 'left'
   */
  iconPosition?: 'left' | 'right';
  /**
   * 3D depth offset in pixels. If not provided, it defaults based on size.
   */
  depth?: number;
  /**
   * Style for the outer container.
   */
  style?: ViewStyle;
  /**
   * Style for the animated top layer.
   */
  contentStyle?: ViewStyle;
  /**
   * Style for the text content.
   */
  textStyle?: TextStyle;
  /**
   * Border radius override.
   */
  borderRadius?: number;
  /**
   * Sets the button to occupy full width.
   */
  fullWidth?: boolean;
}

const VARIANT_COLORS = {
  primary: {
    bg: Colors.oxblood,
    shadow: Colors.oxbloodDeep,
    text: Colors.white,
    border: 'transparent',
  },
  secondary: {
    bg: Colors.cream,
    shadow: Colors.creamDk,
    text: Colors.oxblood,
    border: 'transparent',
  },
  rose: {
    bg: Colors.rose,
    shadow: Colors.roseDeep,
    text: Colors.white,
    border: 'transparent',
  },
  green: {
    bg: Colors.green,
    shadow: '#1b523c',
    text: Colors.white,
    border: 'transparent',
  },
  gold: {
    bg: Colors.gold,
    shadow: '#c59e3c',
    text: Colors.oxblood,
    border: 'transparent',
  },
  white: {
    bg: Colors.white,
    shadow: '#e0e0e0',
    text: Colors.oxblood,
    border: 'rgba(63, 3, 11, 0.12)',
  },
  disabled: {
    bg: '#e2e2e6',
    shadow: '#c8c8cc',
    text: '#98989f',
    border: 'transparent',
  },
} as const;

export function TactileButton({
  children,
  text,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  depth: customDepth,
  style,
  contentStyle,
  textStyle,
  borderRadius = Radius.md,
  fullWidth = false,
}: TactileButtonProps) {
  // Use 'disabled' variant colors if disabled
  const currentVariant = disabled ? 'disabled' : variant;
  const colors = VARIANT_COLORS[currentVariant];

  // Resolve depth based on size if not specified
  const depth = customDepth ?? (size === 'sm' ? 3 : size === 'lg' ? 5 : 4);

  // Press animation value representing translateY of the top layer
  const pressAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.timing(pressAnim, {
      toValue: depth,
      duration: 60,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    Animated.timing(pressAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  // Resolve size styling
  const sizeStyles = styles[size];
  const fontSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={colors.text}
          style={styles.spinner}
        />
      );
    }

    if (children) {
      return children;
    }

    const iconElement = icon ? (
      <Icon name={icon} size={iconSize} color={colors.text} />
    ) : null;

    return (
      <View style={styles.contentRow}>
        {iconElement && iconPosition === 'left' && iconElement}
        {text ? (
          <Text
            style={[
              styles.text,
              {
                color: colors.text,
                fontSize: fontSize,
              },
              textStyle,
            ]}
          >
            {text}
          </Text>
        ) : null}
        {iconElement && iconPosition === 'right' && iconElement}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.outerContainer,
        {
          paddingBottom: depth,
          borderRadius: borderRadius,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {/* 3D bottom shadow layer */}
      <View
        style={[
          styles.shadowLayer,
          {
            top: depth,
            backgroundColor: colors.shadow,
            borderRadius: borderRadius,
          },
        ]}
      />

      {/* Button face top layer */}
      <Pressable
        onPress={disabled || loading ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.pressable,
          fullWidth && styles.fullWidth,
        ]}
        disabled={disabled || loading}
      >
        <Animated.View
          style={[
            styles.topLayer,
            sizeStyles,
            {
              backgroundColor: colors.bg,
              borderColor: colors.border,
              borderWidth: colors.border !== 'transparent' ? 1.5 : 0,
              borderRadius: borderRadius,
              transform: [{ translateY: pressAnim }],
            },
            contentStyle,
          ]}
        >
          {renderContent()}
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
  shadowLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  pressable: {
    alignSelf: 'flex-start',
  },
  topLayer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    minHeight: 36,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 46,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 56,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontFamily: FontFamily.sans,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  spinner: {
    alignSelf: 'center',
  },
});
