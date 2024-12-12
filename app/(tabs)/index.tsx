import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Modal, FlatList, Alert, TouchableOpacity } from 'react-native';
import { SearchHeader } from '@/components/SearchHeader';
import { PersonCard } from '@/components/PersonCard';
import { AddPersonForm } from '@/components/AddPersonForm';
import { NotesView } from '@/components/NotesView';
import { StorageService, Person } from '@/services/storage';
import { ThemedView } from '@/components/ThemedView';
import { PersonView } from '@/components/PersonView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

export default function HomeScreen() {
  const [people, setPeople] = useState<Person[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    loadPeople();
    const interval = setInterval(loadPeople, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadPeople = async () => {
    try {
      const loadedPeople = await StorageService.getPeople();
      setPeople(loadedPeople);
      
      if (!searchQuery) {
        setFilteredPeople(loadedPeople);
      }
    } catch (error) {
      console.error('Error loading people:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredPeople(people);
      return;
    }
    const results = people.filter(
      person =>
        person.name.toLowerCase().includes(query.toLowerCase()) ||
        person.relation.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPeople(results);
  };

  const handleAddPerson = async (data: {
    name: string;
    relation: string;
    tag: 'red' | 'yellow' | 'green';
    description?: string;
    notes?: string;
    image?: string;
  }) => {
    if (!data.name || !data.relation || !data.tag) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const success = await StorageService.addPerson({
      name: data.name,
      relation: data.relation,
      tag: data.tag,
      description: data.description,
      notes: [],
      lastVisited: new Date().toISOString(),
      image: data.image,
    });

    if (success) {
      await loadPeople();
      setShowAddForm(false);
    } else {
      Alert.alert('Error', 'Failed to add person');
    }
  };

  const handleEditPerson = async (data: {
    name: string;
    relation: string;
    tag: 'red' | 'yellow' | 'green';
    description?: string;
  }) => {
    if (!selectedPerson?.id) {
      Alert.alert('Error', 'No person selected for editing');
      return;
    }

    const updatedPerson: Person = {
      ...selectedPerson,
      ...data,
      lastVisited: selectedPerson.lastVisited,
      notes: selectedPerson.notes || [],
    };

    const success = await StorageService.updatePerson(updatedPerson);
    if (success) {
      await loadPeople();
      setShowAddForm(false);
      setSelectedPerson(null);
      setIsEditing(false);
    } else {
      Alert.alert('Error', 'Failed to update person');
    }
  };

  const handleDeletePerson = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this person?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await StorageService.deletePerson(id);
            if (success) {
              loadPeople();
            } else {
              Alert.alert('Error', 'Failed to delete person');
            }
          },
        },
      ]
    );
  };

  const handleAddNote = async (text: string) => {
    if (!selectedPerson?.id) {
      Alert.alert('Error', 'No person selected for adding note');
      return;
    }

    if (!text.trim()) {
      Alert.alert('Error', 'Note cannot be empty');
      return;
    }

    const success = await StorageService.addNote(selectedPerson.id, text);
    if (success) {
      const updatedPeople = await StorageService.getPeople();
      setPeople(updatedPeople);
      
      const updatedPerson = updatedPeople.find(p => p.id === selectedPerson.id);
      if (updatedPerson) {
        setSelectedPerson(updatedPerson);
        if (searchQuery) {
          handleSearch(searchQuery);
        } else {
          setFilteredPeople(updatedPeople);
        }
      } else {
        Alert.alert('Error', 'Could not find updated person');
        closeNotes();
      }
    } else {
      Alert.alert('Error', 'Failed to add note');
    }
  };

  const closeAddForm = () => {
    setShowAddForm(false);
    setSelectedPerson(null);
    setIsEditing(false);
  };

  const closeNotes = () => {
    setShowNotes(false);
    setSelectedPerson(null);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedPerson(null);
  };

  const handleViewPerson = async (person: Person) => {
    const updatedPerson = {
      ...person,
      lastVisited: new Date().toISOString(),
    };
    
    const success = await StorageService.updatePerson(updatedPerson);
    if (success) {
      setSelectedPerson(updatedPerson);
      setShowDetails(true);
      await loadPeople();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SearchHeader onSearch={handleSearch} onAddPress={() => setShowAddForm(true)} />
      
      <FlatList
        data={filteredPeople}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          item && (
            <PersonCard
              {...item}
              onEdit={() => {
                setSelectedPerson(item);
                setIsEditing(true);
                setShowAddForm(true);
              }}
              onView={() => handleViewPerson(item)}
              onDelete={() => handleDeletePerson(item.id)}
            />
          )
        )}
        refreshing={false}
        onRefresh={loadPeople}
      />

      <Modal visible={showAddForm} animationType="slide">
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeAddForm} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color={Colors[theme].text} />
              <ThemedText type="defaultSemiBold">Back</ThemedText>
            </TouchableOpacity>
            <ThemedText type="subtitle">
              {isEditing ? 'Edit Person' : 'Add Person'}
            </ThemedText>
            <TouchableOpacity onPress={closeAddForm}>
              <IconSymbol name="xmark.circle.fill" size={30} color={Colors[theme].icon} />
            </TouchableOpacity>
          </View>
          <AddPersonForm
            onSubmit={isEditing ? handleEditPerson : handleAddPerson}
            onCancel={closeAddForm}
            initialData={isEditing && selectedPerson ? selectedPerson : undefined}
          />
        </ThemedView>
      </Modal>

      <Modal visible={showNotes} animationType="slide">
        <ThemedView style={styles.modalContainer}>
          {selectedPerson && (
            <>
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  onPress={() => {
                    setShowNotes(false);
                    setShowDetails(true);
                  }} 
                  style={styles.backButton}
                >
                  <IconSymbol name="chevron.left" size={24} color={Colors[theme].text} />
                  <ThemedText type="defaultSemiBold">Back</ThemedText>
                </TouchableOpacity>
                <ThemedText type="subtitle">Notes</ThemedText>
                <TouchableOpacity onPress={closeNotes}>
                  <IconSymbol name="xmark.circle.fill" size={30} color={Colors[theme].icon} />
                </TouchableOpacity>
              </View>
              <NotesView
                notes={selectedPerson.notes || []}
                onAddNote={handleAddNote}
                onClose={closeNotes}
              />
            </>
          )}
        </ThemedView>
      </Modal>

      <Modal visible={showDetails} animationType="slide">
        <ThemedView style={styles.modalContainer}>
          {selectedPerson && (
            <>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={closeDetails} style={styles.backButton}>
                  <IconSymbol name="chevron.left" size={24} color={Colors[theme].text} />
                  <ThemedText type="defaultSemiBold">Back</ThemedText>
                </TouchableOpacity>
                <ThemedText type="subtitle">Person Details</ThemedText>
                <TouchableOpacity onPress={closeDetails}>
                  <IconSymbol name="xmark.circle.fill" size={30} color={Colors[theme].icon} />
                </TouchableOpacity>
              </View>
              <PersonView
                person={selectedPerson}
                onClose={closeDetails}
                onViewNotes={() => {
                  setShowDetails(false);
                  setShowNotes(true);
                }}
              />
            </>
          )}
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    marginTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
});
