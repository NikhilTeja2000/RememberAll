import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={[styles.heading, isOpen && styles.headingOpen]}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityHint={`Tap to ${isOpen ? 'collapse' : 'expand'} section`}>
        <IconSymbol
          name="chevron.right"
          size={24}
          weight="bold"
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />
        <ThemedText type="defaultSemiBold" style={styles.headingText}>{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && (
        <ThemedView style={styles.content}>
          {children}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  headingOpen: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headingText: {
    fontSize: 22,
  },
  content: {
    marginTop: 16,
    marginLeft: 40,
    padding: 20,
    borderRadius: 8,
  },
});
