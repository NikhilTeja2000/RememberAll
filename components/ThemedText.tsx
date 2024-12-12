import { Text, type TextProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'error' | 'success';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'error' ? styles.error : undefined,
        type === 'success' ? styles.success : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 20,
    lineHeight: 32,
    letterSpacing: 0.5,
  },
  defaultSemiBold: {
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    lineHeight: 48,
    letterSpacing: 0.15,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
    letterSpacing: 0.15,
  },
  link: {
    fontSize: 20,
    lineHeight: 32,
    color: '#0066CC',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  error: {
    fontSize: 20,
    lineHeight: 32,
    color: Colors.light.error,
    fontWeight: '600',
  },
  success: {
    fontSize: 20,
    lineHeight: 32,
    color: Colors.light.success,
    fontWeight: '600',
  },
});
