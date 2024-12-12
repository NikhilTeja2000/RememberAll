/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0066CC';
const tintColorDark = '#4CC2FF';

export const Colors = {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#666666',
    tabIconDefault: '#666666',
    tabIconSelected: tintColorLight,
    error: '#D32F2F',
    success: '#2E7D32',
    cardBackground: '#F5F5F5',
    border: '#E0E0E0',
  },
  dark: {
    text: '#FFFFFF',
    background: '#121212',
    tint: tintColorDark,
    icon: '#CCCCCC',
    tabIconDefault: '#CCCCCC',
    tabIconSelected: tintColorDark,
    error: '#FF5252',
    success: '#81C784',
    cardBackground: '#2A2A2A',
    border: '#404040',
  },
};
