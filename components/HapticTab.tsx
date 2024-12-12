import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      style={[
        props.style,
        {
          minHeight: 60,
          justifyContent: 'center',
          alignItems: 'center',
        },
      ]}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
