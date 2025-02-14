import * as React from 'react';
import { useState, useEffect } from 'react';
import { StyleSheet, View, Modal, FlatList, Alert, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
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
import { useColorScheme } from 'react-native';
import { Image } from 'react-native';

const formatLastVisited = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 60) {
    return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
  } else if (diffInDays < 7) {
    return diffInDays === 1 ? 'Yesterday' : `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export default function HomeScreen() {
  const [people, setPeople] = useState<Person[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const theme = useColorScheme() ?? 'light';

  useEffect(() => {
    loadPeople();
    const interval = setInterval(loadPeople, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPeople(people);
    } else {
      const filtered = people.filter(person =>
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.relation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (person.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
      setFilteredPeople(filtered);
    }
  }, [searchQuery, people]);

  const loadPeople = async () => {
    try {
      setIsLoading(true);
      const loadedPeople = await StorageService.getPeople();
      setPeople(loadedPeople);
      setFilteredPeople(loadedPeople);
    } catch (error) {
      console.error('Error loading people:', error);
    } finally {
      setIsLoading(false);
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
      image: data.image,
      lastVisited: new Date().toISOString(),
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
    console.log('Delete triggered for ID:', id); // Debug log
    
    if (!id) {
      console.error('No ID provided for deletion');
      return;
    }

    // First, find the person to be deleted
    const personToDelete = people.find(p => p.id === id);
    if (!personToDelete) {
      console.error('Person not found for deletion');
      return;
    }

    // Show the confirmation alert
    Alert.alert(
      'Delete Person',
      `Are you sure you want to delete ${personToDelete.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('Delete cancelled')
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Delete confirmed for:', personToDelete.name);
              const success = await StorageService.deletePerson(id);
              
              if (success) {
                console.log('Delete successful');
                // Update local state
                setPeople(prev => prev.filter(p => p.id !== id));
                setFilteredPeople(prev => prev.filter(p => p.id !== id));
                
                // Close modals if needed
                if (selectedPerson?.id === id) {
                  setShowDetails(false);
                  setShowNotes(false);
                  setShowAddForm(false);
                  setSelectedPerson(null);
                }
              } else {
                Alert.alert('Error', 'Failed to delete person');
              }
            } catch (error) {
              console.error('Error during deletion:', error);
              Alert.alert('Error', 'An error occurred while deleting');
            }
          }
        }
      ],
      { cancelable: true }
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
              onDelete={() => {
                console.log('Delete requested for:', item.name); // Debug log
                handleDeletePerson(item.id);
              }}
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
            initialData={isEditing && selectedPerson ? {
              name: selectedPerson.name,
              relation: selectedPerson.relation,
              tag: selectedPerson.tag,
              description: selectedPerson.description,
              image: selectedPerson.image,
            } : undefined}
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
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  personImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  personImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    opacity: 0.7,
  },
  textContainer: {
    flexDirection: 'column',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  relation: {
    fontSize: 16,
    opacity: 0.7,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
  },
  lastVisitedContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  lastVisitedLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  lastVisitedTime: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    opacity: 0.7,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#F0F0F0',
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
