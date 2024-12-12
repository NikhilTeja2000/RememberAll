import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // Add any required web polyfills here
  require('setimmediate');
} 