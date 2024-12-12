import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface Person {
  id: string;
  name: string;
  relation: string;
  tag: 'red' | 'yellow' | 'green';
  description?: string;
  image?: string;
  lastVisited: string;
  notes: Note[];
}

export interface Note {
  id: string;
  text: string;
  timestamp: string;
}

const STORAGE_KEYS = {
  PEOPLE: 'people',
  USER_DETAILS: 'user_details',
  LOCATIONS: 'user_locations',
};

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
}

export interface UserDetails {
  name: string;
  age: string;
  phoneNumber: string;
  address: string;
  locations: Array<{
    latitude: number;
    longitude: number;
    address: string;
    timestamp: string;
  }>;
}

// Export the storage object
export const storage = {
  async getItem(key: string) {
    try {
      // Always use AsyncStorage for mobile
      if (Platform.OS !== 'web') {
        return await AsyncStorage.getItem(key);
      }
      
      // Use localStorage only for web
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }

      return null;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },

  async setItem(key: string, value: string) {
    try {
      // Always use AsyncStorage for mobile
      if (Platform.OS !== 'web') {
        await AsyncStorage.setItem(key, value);
        return true;
      }
      
      // Use localStorage only for web
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Storage setItem error:', error);
      return false;
    }
  },

  async removeItem(key: string) {
    try {
      // Always use AsyncStorage for mobile
      if (Platform.OS !== 'web') {
        await AsyncStorage.removeItem(key);
        return true;
      }
      
      // Use localStorage only for web
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Storage removeItem error:', error);
      return false;
    }
  }
};

export const StorageService = {
  // People CRUD operations
  async getPeople(): Promise<Person[]> {
    try {
      const data = await storage.getItem(STORAGE_KEYS.PEOPLE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting people:', error);
      return [];
    }
  },

  async addPerson(person: Omit<Person, 'id' | 'notes'>): Promise<boolean> {
    try {
      const people = await this.getPeople();
      const newPerson: Person = {
        ...person,
        id: Date.now().toString(),
        notes: [],
      };
      
      await storage.setItem(
        STORAGE_KEYS.PEOPLE,
        JSON.stringify([...people, newPerson])
      );
      return true;
    } catch (error) {
      console.error('Error adding person:', error);
      return false;
    }
  },

  async updatePerson(updatedPerson: Person): Promise<boolean> {
    try {
      const people = await this.getPeople();
      const updatedPeople = people.map((person) =>
        person.id === updatedPerson.id ? updatedPerson : person
      );
      
      await storage.setItem(
        STORAGE_KEYS.PEOPLE,
        JSON.stringify(updatedPeople)
      );
      return true;
    } catch (error) {
      console.error('Error updating person:', error);
      return false;
    }
  },

  async deletePerson(id: string): Promise<boolean> {
    try {
      const people = await this.getPeople();
      const filteredPeople = people.filter((person) => person.id !== id);
      
      await storage.setItem(
        STORAGE_KEYS.PEOPLE,
        JSON.stringify(filteredPeople)
      );
      return true;
    } catch (error) {
      console.error('Error deleting person:', error);
      return false;
    }
  },

  // Notes operations
  async addNote(personId: string, noteText: string): Promise<boolean> {
    try {
      const people = await this.getPeople();
      const personIndex = people.findIndex((p) => p.id === personId);
      
      if (personIndex === -1) return false;

      const newNote: Note = {
        id: Date.now().toString(),
        text: noteText,
        timestamp: new Date().toISOString(),
      };

      if (!people[personIndex].notes) {
        people[personIndex].notes = [];
      }

      people[personIndex].notes.unshift(newNote); // Add new note at the beginning
      await storage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
      
      // Update last visited time
      people[personIndex].lastVisited = new Date().toISOString();
      await storage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
      
      return true;
    } catch (error) {
      console.error('Error adding note:', error);
      return false;
    }
  },

  // Search functionality
  async searchPeople(query: string): Promise<Person[]> {
    try {
      const people = await this.getPeople();
      const lowercaseQuery = query.toLowerCase();
      
      return people.filter(
        (person) =>
          person.name.toLowerCase().includes(lowercaseQuery) ||
          person.relation.toLowerCase().includes(lowercaseQuery) ||
          (person.description?.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      console.error('Error searching people:', error);
      return [];
    }
  },

  // Update last visited
  async updateLastVisited(personId: string): Promise<boolean> {
    try {
      const people = await this.getPeople();
      const personIndex = people.findIndex((p) => p.id === personId);
      
      if (personIndex === -1) return false;

      people[personIndex].lastVisited = new Date().toISOString();
      await storage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
      return true;
    } catch (error) {
      console.error('Error updating last visited:', error);
      return false;
    }
  },

  async getUserDetails(): Promise<UserDetails | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DETAILS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user details:', error);
      return null;
    }
  },

  async updateUserDetails(details: UserDetails): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DETAILS, JSON.stringify(details));
      return true;
    } catch (error) {
      console.error('Error updating user details:', error);
      return false;
    }
  },

  async addLocation(address: string): Promise<boolean> {
    try {
      const details = await this.getUserDetails();
      if (!details) return false;

      const newLocation: Location = {
        timestamp: new Date().toISOString(),
        address,
      };

      details.locations = [newLocation, ...(details.locations || [])];
      await this.updateUserDetails(details);
      return true;
    } catch (error) {
      console.error('Error adding location:', error);
      return false;
    }
  },
}; 