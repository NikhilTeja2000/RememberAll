import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, Modal } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { StorageService, Person, Note } from '@/services/storage';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { NotesView } from '@/components/NotesView';

interface NoteWithPerson extends Note {
  personName: string;
  personRelation: string;
  personTag: 'red' | 'yellow' | 'green';
}

export default function NotesScreen() {
  const [allNotes, setAllNotes] = useState<NoteWithPerson[]>([]);
  const [filter, setFilter] = useState<'all' | 'red' | 'yellow' | 'green'>('all');
  const theme = useColorScheme() ?? 'light';
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showNotes, setShowNotes] = useState(false);

  const FilterButton = ({ type }: { type: typeof filter }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === type && styles.filterButtonActive,
        type !== 'all' && { backgroundColor: type },
      ]}
      onPress={() => setFilter(type)}>
      <ThemedText
        style={[
          styles.filterText,
          filter === type && styles.filterTextActive,
          type !== 'all' && { color: '#000000' },
        ]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </ThemedText>
    </TouchableOpacity>
  );

  const loadNotes = async () => {
    const loadedPeople = await StorageService.getPeople();
    setPeople(loadedPeople);
    const notes: NoteWithPerson[] = [];
    
    loadedPeople.forEach((person) => {
      if (person.notes && person.notes.length > 0) {
        person.notes.forEach((note) => {
          notes.push({
            ...note,
            personName: person.name,
            personRelation: person.relation,
            personTag: person.tag,
          });
        });
      }
    });

    notes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setAllNotes(notes);
  };

  useEffect(() => {
    loadNotes();
    const interval = setInterval(loadNotes, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredNotes = useMemo(() => 
    allNotes.filter(note => {
      if (filter === 'all') return true;
      return note.personTag === filter;
    }),
    [allNotes, filter]
  );

  const handleNotePress = async (note: NoteWithPerson) => {
    const person = people.find(p => p.notes?.some(n => n.id === note.id));
    if (person) {
      setSelectedPerson(person);
      setShowNotes(true);
    }
  };

  const handleAddNote = async (text: string) => {
    if (!selectedPerson?.id) return;
    
    const success = await StorageService.addNote(selectedPerson.id, text);
    if (success) {
      await loadNotes();
      setShowNotes(false);
      setSelectedPerson(null);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.filterContainer}>
        <FilterButton type="all" />
        <FilterButton type="red" />
        <FilterButton type="yellow" />
        <FilterButton type="green" />
      </View>

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => handleNotePress(item)}
            style={styles.noteContainer}
          >
            <View style={[styles.noteItem, { 
              backgroundColor: theme === 'light' ? '#F5F5F5' : '#2A2A2A' 
            }]}>
              <View style={styles.noteHeader}>
                <ThemedText type="defaultSemiBold">{item.personName}</ThemedText>
                <ThemedText style={styles.relation}>{item.personRelation}</ThemedText>
              </View>
              <ThemedText style={styles.noteText}>{item.text}</ThemedText>
              <ThemedText style={styles.timestamp}>{formatDate(item.timestamp)}</ThemedText>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />

      {showNotes && selectedPerson && (
        <Modal visible={showNotes} animationType="slide">
          <ThemedView style={styles.modalContainer}>
            <NotesView
              notes={selectedPerson.notes || []}
              onAddNote={handleAddNote}
              onClose={() => {
                setShowNotes(false);
                setSelectedPerson(null);
              }}
            />
          </ThemedView>
        </Modal>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    padding: 8,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#E0E0E0',
  },
  filterText: {
    fontSize: 16,
  },
  filterTextActive: {
    fontWeight: 'bold',
  },
  noteContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  noteItem: {
    padding: 16,
    borderRadius: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  relation: {
    fontSize: 16,
    color: '#666',
  },
  noteText: {
    fontSize: 18,
    marginVertical: 8,
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    paddingVertical: 8,
  },
  modalContainer: {
    flex: 1,
    marginTop: 50,
  },
}); 