import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Note } from '@/services/storage';
import { useColorScheme } from '@/hooks/useColorScheme';

interface NotesViewProps {
  notes: Note[];
  onAddNote: (text: string) => void;
  onClose: () => void;
}

export function NotesView({ notes, onAddNote, onClose }: NotesViewProps) {
  const [newNote, setNewNote] = useState('');
  const theme = useColorScheme() ?? 'light';

  const handleSend = () => {
    if (newNote.trim()) {
      onAddNote(newNote.trim());
      setNewNote('');
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { 
        borderBottomColor: theme === 'light' ? '#B8C6DB' : '#4A5568',
        backgroundColor: theme === 'light' ? '#EDF2F7' : '#2D3748'
      }]}>
        <ThemedText type="subtitle" style={styles.headerText}>Notes</ThemedText>
        <TouchableOpacity 
          onPress={onClose} 
          style={styles.closeButton}
          accessibilityLabel="Close notes"
        >
          <IconSymbol name="xmark.circle.fill" size={36} color={Colors[theme].icon} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.noteItem, { 
            backgroundColor: theme === 'light' ? '#F0F5FF' : '#1A365D',
            borderColor: theme === 'light' ? '#B8C6DB' : '#4A5568',
          }]}>
            <ThemedText style={styles.noteText}>{item.text}</ThemedText>
            <ThemedText style={[styles.timestamp, { 
              color: theme === 'light' ? '#4A5568' : '#A0AEC0',
              fontSize: 16
            }]}>
              {formatDate(item.timestamp)}
            </ThemedText>
          </View>
        )}
        style={styles.notesList}
        inverted
      />

      <View style={[styles.inputContainer, { 
        borderTopColor: theme === 'light' ? '#B8C6DB' : '#4A5568',
        backgroundColor: theme === 'light' ? '#EDF2F7' : '#2D3748'
      }]}>
        <TextInput
          style={[styles.input, { 
            color: Colors[theme].text,
            backgroundColor: theme === 'light' ? '#FFFFFF' : '#1A365D',
            borderColor: theme === 'light' ? '#B8C6DB' : '#4A5568',
            fontSize: 18
          }]}
          value={newNote}
          onChangeText={setNewNote}
          placeholder="Type a note..."
          placeholderTextColor={theme === 'light' ? '#718096' : '#A0AEC0'}
          multiline
        />
        <TouchableOpacity 
          onPress={handleSend}
          style={[
            styles.sendButton,
            !newNote.trim() && styles.sendButtonDisabled,
            { backgroundColor: '#4299E1' }
          ]}
          disabled={!newNote.trim()}
        >
          <IconSymbol name="arrow.up.circle.fill" size={44} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  notesList: {
    flex: 1,
    padding: 16,
  },
  noteItem: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteText: {
    fontSize: 18,
    lineHeight: 24,
  },
  timestamp: {
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    maxHeight: 120,
    minHeight: 50,
  },
  sendButton: {
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
}); 