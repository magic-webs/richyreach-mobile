import { Colors, FontFamily } from '@/constants/brand';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface FeaturePillProps {
  iconName: FeatherIconName;
  iconColor?: string;
  label: string;
}

export function FeaturePill({ iconName, iconColor = Colors.oxblood, label }: FeaturePillProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 13,
        marginBottom: 10,
        shadowColor: Colors.oxblood,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      <View
        style={{
          width: 38, height: 38, borderRadius: 12,
          backgroundColor: iconColor + '16',
          alignItems: 'center', justifyContent: 'center', marginRight: 14,
        }}
      >
        <Feather name={iconName} size={18} color={iconColor} />
      </View>
      <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 14, color: Colors.ink, flex: 1 }}>
        {label}
      </Text>
      <Feather name="chevron-right" size={16} color={Colors.roseSoft} />
    </View>
  );
}
