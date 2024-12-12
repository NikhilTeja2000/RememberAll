import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { IconSymbol } from './ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from './ThemedText';

interface SearchHeaderProps {
  onSearch: (text: string) => void;
  onAddPress: () => void;
}

export function SearchHeader({ onSearch, onAddPress }: SearchHeaderProps) {
  const theme = useColorScheme() ?? 'light';

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { backgroundColor: theme === 'light' ? '#F5F5F5' : '#2A2A2A' }]}>
        <IconSymbol name="magnifyingglass" size={24} color={Colors[theme].icon} />
        <TextInput
          style={[styles.searchInput, { color: Colors[theme].text }]}
          placeholder="Search people..."
          placeholderTextColor={Colors[theme].tabIconDefault}
          onChangeText={onSearch}
        />
      </View>
      <TouchableOpacity 
        onPress={onAddPress}
        style={[styles.addButton, { backgroundColor: theme === 'light' ? '#F5F5F5' : '#2A2A2A' }]}
        accessibilityLabel="Add new person"
      >
        <IconSymbol 
          name="plus" 
          size={24} 
          color={theme === 'light' ? '#000000' : '#FFFFFF'} 
        />
        <ThemedText style={styles.addText}>Add</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  addText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 