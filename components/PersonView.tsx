import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Person } from '@/services/storage';

interface PersonViewProps {
  person: Person;
  onClose: () => void;
  onViewNotes: () => void;
}

export function PersonView({ person, onClose, onViewNotes }: PersonViewProps) {
  const theme = useColorScheme() ?? 'light';
  const tagColors = {
    red: theme === 'light' ? '#FFE5E5' : '#662929',
    yellow: theme === 'light' ? '#FFF9E5' : '#665D29',
    green: theme === 'light' ? '#E5FFE5' : '#296629',
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: theme === 'light' ? '#E0E0E0' : '#404040' }]}>
        <ThemedText type="subtitle">Person Details</ThemedText>
        <TouchableOpacity 
          onPress={onClose} 
          style={styles.closeButton}
          accessibilityLabel="Close details"
        >
          <IconSymbol name="xmark.circle.fill" size={30} color={Colors[theme].icon} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {person.image ? (
          <Image source={{ uri: person.image }} style={styles.image} />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: tagColors[person.tag] }]}>
            <IconSymbol name="person.fill" size={60} color="#666" />
          </View>
        )}

        <View style={styles.infoSection}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Name</ThemedText>
          <ThemedText style={styles.value}>{person.name}</ThemedText>
        </View>

        <View style={styles.infoSection}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Relation</ThemedText>
          <ThemedText style={styles.value}>{person.relation}</ThemedText>
        </View>

        <View style={styles.infoSection}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Tag</ThemedText>
          <View style={styles.tagContainer}>
            <View style={[styles.tagDot, { backgroundColor: person.tag }]} />
            <ThemedText style={styles.value}>
              {person.tag.charAt(0).toUpperCase() + person.tag.slice(1)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoSection}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Last Visited</ThemedText>
          <ThemedText style={styles.value}>
            {new Date(person.lastVisited).toLocaleString()}
          </ThemedText>
        </View>

        {person.description && (
          <View style={styles.infoSection}>
            <ThemedText type="defaultSemiBold" style={styles.label}>Description</ThemedText>
            <ThemedText style={styles.value}>{person.description}</ThemedText>
          </View>
        )}

        <TouchableOpacity 
          onPress={onViewNotes}
          style={[styles.notesButton, { backgroundColor: Colors[theme].tint }]}
        >
          <IconSymbol name="note.text" size={24} color="#FFFFFF" />
          <ThemedText style={styles.notesButtonText}>View Notes</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    marginBottom: 24,
  },
  placeholderImage: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    color: '#666',
  },
  value: {
    fontSize: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  notesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  notesButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
}); 