import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Platform } from 'react-native';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface PersonCardProps {
  name: string;
  relation: string;
  lastVisited: string;
  tag: 'red' | 'yellow' | 'green';
  image?: string;
  description?: string;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
}

export function PersonCard({
  name,
  relation,
  lastVisited,
  tag,
  image,
  description,
  onEdit,
  onView,
  onDelete,
}: PersonCardProps) {
  const theme = useColorScheme() ?? 'light';
  const tagColors = {
    red: theme === 'light' ? '#FFE5E5' : '#662929',
    yellow: theme === 'light' ? '#FFF9E5' : '#665D29',
    green: theme === 'light' ? '#E5FFE5' : '#296629',
  };

  const handleDeletePress = (event: any) => {
    event.stopPropagation();
    onDelete();
  };

  return (
    <View style={[styles.container, { 
      backgroundColor: tagColors[tag],
      borderColor: theme === 'light' ? Colors.light.border : Colors.dark.border,
      borderWidth: 1,
    }]}>
      <TouchableOpacity onPress={onView} activeOpacity={0.7} style={styles.contentContainer}>
        <View style={styles.header}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <IconSymbol name="person.fill" size={40} color="#666" />
            </View>
          )}
          <View style={styles.info}>
            <ThemedText type="defaultSemiBold">{name}</ThemedText>
            <ThemedText>{relation}</ThemedText>
            <ThemedText style={styles.lastVisited}>Last visited: {lastVisited}</ThemedText>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={[styles.actions, { borderTopColor: theme === 'light' ? '#E0E0E0' : '#404040' }]}>
        <TouchableOpacity onPress={onView} style={styles.button}>
          <IconSymbol name="eye" size={24} color={Colors[theme].icon} />
          <ThemedText>View</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onEdit} style={styles.button}>
          <IconSymbol name="pencil" size={24} color={Colors[theme].icon} />
          <ThemedText>Edit</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleDeletePress}
          style={[styles.button, styles.deleteButton]}
        >
          <IconSymbol name="trash" size={24} color="#D32F2F" />
          <ThemedText style={{ color: '#D32F2F' }}>Delete</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    margin: 16,
    gap: 16,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.2s',
        ':hover': {
          transform: 'scale(1.02)',
        },
      },
      default: {},
    }),
  },
  header: {
    flexDirection: 'row',
    gap: 16,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  lastVisited: {
    fontSize: 16,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  button: {
    alignItems: 'center',
    gap: 4,
  },
  deleteButton: {
    opacity: 0.8,
  },
  tagIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  tagDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
}); 