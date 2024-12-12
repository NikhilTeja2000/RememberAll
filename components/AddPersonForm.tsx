import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as ImagePicker from 'expo-image-picker';
import { IconSymbol } from './ui/IconSymbol';

interface AddPersonFormProps {
  onSubmit: (data: {
    name: string;
    relation: string;
    tag: 'red' | 'yellow' | 'green';
    description?: string;
    notes?: string;
    image?: string;
  }) => void;
  onCancel: () => void;
  initialData?: Partial<{
    name: string;
    relation: string;
    tag: 'red' | 'yellow' | 'green';
    description?: string;
    notes?: string;
    image?: string;
  }>;
}

export function AddPersonForm({ onSubmit, onCancel, initialData }: AddPersonFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [relation, setRelation] = useState(initialData?.relation ?? '');
  const [tag, setTag] = useState<'red' | 'yellow' | 'green'>(initialData?.tag ?? 'green');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [notes, setNotes] = useState(initialData?.notes ?? 'Initial note...');
  const [image, setImage] = useState(initialData?.image ?? '');
  const theme = useColorScheme() ?? 'light';

  const handleSubmit = () => {
    if (!name || !relation) {
      alert('Name and Relation are required');
      return;
    }
    onSubmit({ name, relation, tag, description, notes, image });
  };

  const pickImage = async () => {
    try {
      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e: any) => {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = () => {
            setImage(reader.result as string);
          };
          reader.readAsDataURL(file);
        };
        input.click();
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });

        if (!result.canceled) {
          setImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to pick image');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <IconSymbol name="camera.fill" size={40} color={Colors[theme].icon} />
              <ThemedText>Add Photo</ThemedText>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Name *</ThemedText>
          <TextInput
            style={[styles.input, { color: Colors[theme].text }]}
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            placeholderTextColor={Colors[theme].tabIconDefault}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Relation *</ThemedText>
          <TextInput
            style={[styles.input, { color: Colors[theme].text }]}
            value={relation}
            onChangeText={setRelation}
            placeholder="Enter relation"
            placeholderTextColor={Colors[theme].tabIconDefault}
          />
        </View>

        <View style={styles.field}>
          <View style={styles.tagHeader}>
            <ThemedText type="defaultSemiBold">Tag Color</ThemedText>
            <ThemedText style={{ color: tag, fontWeight: '600' }}>
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </ThemedText>
          </View>
          <View style={styles.tagContainer}>
            {(['red', 'yellow', 'green'] as const).map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.tagButton,
                  { backgroundColor: color },
                  tag === color && styles.selectedTag,
                ]}
                onPress={() => setTag(color)}
              />
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Description (Optional)</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea, { color: Colors[theme].text }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
            placeholderTextColor={Colors[theme].tabIconDefault}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Initial Note</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea, { color: Colors[theme].text }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Enter initial note"
            placeholderTextColor={Colors[theme].tabIconDefault}
            multiline
            numberOfLines={4}
            editable={!initialData} // Make notes non-editable in edit mode
          />
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}>
            <ThemedText type="error">Cancel</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}>
            <ThemedText style={{ color: '#FFF' }}>
              {initialData ? 'Update' : 'Add'} Person
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 20,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  tagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  tagButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.6,
  },
  selectedTag: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#000',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.light.error,
  },
  submitButton: {
    backgroundColor: Colors.light.success,
  },
  imagePickerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 200,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
  },
}); 