import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
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
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showNotes, setShowNotes] = useState(false);

  const getFilterButtonStyle = (color: 'all' | 'red' | 'yellow' | 'green') => {
    if (color === 'all') {
      return {
        backgroundColor: filter === 'all' ? Colors[theme].tint : 'transparent',
        borderColor: Colors[theme].tint,
      };
    }
    
    const colorMap = {
      red: '#FF4444',
      yellow: '#FFBB33',
      green: '#00C851',
    };
    
    return {
      backgroundColor: filter === color ? colorMap[color] : 'transparent',
      borderColor: colorMap[color],
    };
  };

  const FilterButton = ({ color, label }: { color: 'all' | 'red' | 'yellow' | 'green'; label: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        getFilterButtonStyle(color),
      ]}
      onPress={() => setFilter(color)}
    >
      <ThemedText
        style={[
          styles.filterButtonText,
          { 
            color: filter === color ? 
              (color === 'all' ? '#FFFFFF' : '#000000') : 
              (color === 'all' ? Colors[theme].text : colorMap[color])
          }
        ]}
      >
        {label}
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

  useEffect(() => {
    filterPeople();
  }, [filter, people]);

  const filterPeople = () => {
    if (filter === 'all') {
      setFilteredPeople(people);
    } else {
      const filtered = people.filter(person => person.tag === filter);
      setFilteredPeople(filtered);
    }
  };

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
        <FilterButton color="all" label="All" />
        <FilterButton color="red" label="Red" />
        <FilterButton color="yellow" label="Yellow" />
        <FilterButton color="green" label="Green" />
      </View>

      <ScrollView style={styles.content}>
        {filteredPeople.map((person) => (
          <View
            key={person.id}
            style={[
              styles.noteCard,
              { backgroundColor: theme === 'light' ? '#F5F5F5' : '#2A2A2A' },
              { borderLeftColor: person.tag === 'red' ? '#FF4444' : 
                               person.tag === 'yellow' ? '#FFBB33' : 
                               '#00C851' }
            ]}
          >
            <ThemedText style={styles.personName}>{person.name}</ThemedText>
            <ThemedText style={styles.relation}>{person.relation}</ThemedText>
            {person.notes && person.notes.length > 0 && (
              <View style={styles.notesContainer}>
                {person.notes.map((note, index) => (
                  <View key={note.id} style={styles.noteItem}>
                    <ThemedText style={styles.noteText}>{note.text}</ThemedText>
                    <ThemedText style={styles.timestamp}>
                      {new Date(note.timestamp).toLocaleDateString()}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

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

const colorMap = {
  red: '#FF4444',
  yellow: '#FFBB33',
  green: '#00C851',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    justifyContent: 'space-around',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  noteCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  personName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  relation: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  notesContainer: {
    marginTop: 8,
  },
  noteItem: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  noteText: {
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    marginTop: 50,
  },
}); 