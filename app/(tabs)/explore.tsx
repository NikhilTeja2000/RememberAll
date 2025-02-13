import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StorageService, UserDetails } from '@/services/storage';

export default function ExploreScreen() {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showLocations, setShowLocations] = useState(false);
  const theme = useColorScheme() ?? 'light';
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phoneNumber: '',
    address: '',
  });

  useEffect(() => {
    const initializeData = async () => {
      await loadUserDetails();
      setupLocationTracking();
    };

    initializeData();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const setupLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to track visited places.');
        return;
      }

      // Request background permissions
      let { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Background location permission is required.');
        return;
      }
  
    } catch (error) {
      console.error('Error setting up location tracking:', error);
    }
  };

  const reverseGeocode = async (coords: { latitude: number; longitude: number }) => {
    try {
      const [result] = await Location.reverseGeocodeAsync(coords);
      if (result) {
        return `${result.street || ''} ${result.city || ''} ${result.region || ''} ${result.country || ''}`.trim();
      }
      return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
    }
  };
  

  const updateLocationHistory = async (
    coords: { latitude: number; longitude: number },
    address: string
  ) => {
    try {
      const details = await StorageService.getUserDetails();
      if (details) {
        const updatedDetails: UserDetails = {
          ...details,
          locations: [
            {
              latitude: coords.latitude,
              longitude: coords.longitude,
              address,
              timestamp: new Date().toISOString(),
            },
            ...(details.locations || []).slice(0, 49), // Keep last 50 locations
          ],
        };
        await StorageService.updateUserDetails(updatedDetails);
        setUserDetails(updatedDetails);
      }
    } catch (error) {
      console.error('Error updating location history:', error);
    }
  };

  const loadUserDetails = async () => {
    try {
      const details = await StorageService.getUserDetails();
      console.log('Loaded details:', details);
      
      if (!details) {
        const initialDetails: UserDetails = {
          name: '',
          age: '',
          phoneNumber: '',
          address: '',
          locations: [],
        };
        await StorageService.updateUserDetails(initialDetails);
        setUserDetails(initialDetails);
        setFormData(initialDetails);
      } else {
        setUserDetails(details);
        setFormData({
          name: details.name || '',
          age: details.age || '',
          phoneNumber: details.phoneNumber || '',
          address: details.address || '',
        });
      }
    } catch (error) {
      console.error('Error loading user details:', error);
      Alert.alert('Error', 'Failed to load user details');
    }
  };

  const handleEdit = () => {
    if (userDetails) {
      setFormData({
        name: userDetails.name || '',
        age: userDetails.age || '',
        phoneNumber: userDetails.phoneNumber || '',
        address: userDetails.address || '',
      });
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (Object.values(formData).some(value => !value)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const updatedDetails: UserDetails = {
        ...formData,
        locations: userDetails?.locations || [],
      };

      const success = await StorageService.updateUserDetails(updatedDetails);
      if (success) {
        await loadUserDetails();
        setIsEditing(false);
      } else {
        Alert.alert('Error', 'Failed to save user details');
      }
    } catch (error) {
      console.error('Error saving user details:', error);
      Alert.alert('Error', 'Failed to save user details');
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };
  const InfoItem = ({ label, value }: { label: string; value: string | undefined }) => (
    <View style={styles.infoItem}>
      <ThemedText style={styles.infoLabel}>{label}:</ThemedText>
      <ThemedText style={styles.infoValue}>{value || 'N/A'}</ThemedText>
    </View>
  );
  

  const handleCancel = () => {
    setIsEditing(false);
    setShowLocations(false);
    loadUserDetails();
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="subtitle">About Me</ThemedText>
        </View>

        <View style={styles.details}>
          {userDetails !== null ? (
            <>
              <InfoItem label="Name" value={userDetails.name || 'Not set'} />
              <InfoItem label="Age" value={userDetails.age || 'Not set'} />
              <InfoItem label="Phone Number" value={userDetails.phoneNumber || 'Not set'} />
              <InfoItem label="Address" value={userDetails.address || 'Not set'} />
              
              <TouchableOpacity 
                onPress={() => setShowLocations(true)}
                style={[styles.locationButton, { backgroundColor: Colors[theme].tint }]}
              >
                <IconSymbol name="location.fill" size={24} color="#FFFFFF" />
                <ThemedText style={styles.locationButtonText}>View Location History</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleEdit}
                style={[styles.editButton, { backgroundColor: Colors[theme].success }]}
              >
                <IconSymbol name="pencil" size={24} color="#FFFFFF" />
                <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors[theme].tint} />
              <ThemedText style={styles.loadingText}>Loading...</ThemedText>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={isEditing} animationType="slide">
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color={Colors[theme].text} />
              <ThemedText type="defaultSemiBold">Back</ThemedText>
            </TouchableOpacity>
            <ThemedText type="subtitle">Edit Profile</ThemedText>
            <TouchableOpacity onPress={handleCancel}>
              <IconSymbol name="xmark.circle.fill" size={30} color={Colors[theme].icon} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.form}>
              <View style={styles.field}>
                <ThemedText type="defaultSemiBold">Name</ThemedText>
                <TextInput
                  style={[styles.input, { 
                    color: Colors[theme].text,
                    backgroundColor: theme === 'light' ? '#FFFFFF' : '#2A2A2A',
                  }]}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="Enter your name"
                  placeholderTextColor={Colors[theme].tabIconDefault}
                />
              </View>

              <View style={styles.field}>
                <ThemedText type="defaultSemiBold">Age</ThemedText>
                <TextInput
                  style={[styles.input, { 
                    color: Colors[theme].text,
                    backgroundColor: theme === 'light' ? '#FFFFFF' : '#2A2A2A',
                  }]}
                  value={formData.age}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, age: text }))}
                  placeholder="Enter your age"
                  keyboardType="numeric"
                  placeholderTextColor={Colors[theme].tabIconDefault}
                />
              </View>

              <View style={styles.field}>
                <ThemedText type="defaultSemiBold">Phone Number</ThemedText>
                <TextInput
                  style={[styles.input, { 
                    color: Colors[theme].text,
                    backgroundColor: theme === 'light' ? '#FFFFFF' : '#2A2A2A',
                  }]}
                  value={formData.phoneNumber}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  placeholderTextColor={Colors[theme].tabIconDefault}
                />
              </View>

              <View style={styles.field}>
                <ThemedText type="defaultSemiBold">Address</ThemedText>
                <TextInput
                  style={[styles.input, { 
                    color: Colors[theme].text,
                    backgroundColor: theme === 'light' ? '#FFFFFF' : '#2A2A2A',
                  }]}
                  value={formData.address}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                  placeholder="Enter your address"
                  placeholderTextColor={Colors[theme].tabIconDefault}
                />
              </View>

              <View style={styles.buttons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}>
                  <ThemedText style={{ color: Colors[theme].error }}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: Colors[theme].success }]}
                  onPress={handleSave}>
                  <ThemedText style={{ color: '#FFFFFF' }}>Save</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </ThemedView>
      </Modal>

      {/* Locations Modal */}
      <Modal visible={showLocations} animationType="slide">
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowLocations(false)} 
              style={styles.backButton}
            >
              <IconSymbol name="chevron.left" size={24} color={Colors[theme].text} />
              <ThemedText type="defaultSemiBold">Back</ThemedText>
            </TouchableOpacity>
            <ThemedText type="subtitle">Location History</ThemedText>
            <TouchableOpacity onPress={() => setShowLocations(false)}>
              <IconSymbol name="xmark.circle.fill" size={30} color={Colors[theme].icon} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {userDetails?.locations && userDetails.locations.length > 0 ? (
              <View style={styles.locationList}>
                {userDetails.locations.map((location, index) => (
                  <View key={index} style={[styles.locationItem, { backgroundColor: theme === 'light' ? '#F5F5F5' : '#2A2A2A' }]}>
                    <ThemedText>{location.address}</ThemedText>
                    <ThemedText style={styles.timestamp}>
                      {formatDate(location.timestamp)}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <ThemedText>No location history available</ThemedText>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: Colors[theme].error }]}
            onPress={() => setShowLocations(false)}>
            <ThemedText style={{ color: '#FFFFFF' }}>Close</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <ThemedText type="defaultSemiBold" style={styles.label}>{label}</ThemedText>
      <ThemedText style={styles.value}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: Colors.light.tint,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  details: {
    gap: 16,
  },
  infoItem: {
    gap: 8,
  },
  label: {
    color: '#666',
  },
  value: {
    fontSize: 20,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
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
  modalContent: {
    flex: 1,
    padding: 16,
  },
  locationList: {
    flex: 1,
    padding: 16,
  },
  locationItem: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: Colors.light.error,
  },
  closeButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
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
