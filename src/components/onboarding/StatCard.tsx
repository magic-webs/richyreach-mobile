import { Colors, FontFamily } from '@/constants/brand';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

interface StatCardProps {
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  iconColor?: string;
  value: string;
  label: string;
  style?: object;
}

export function StatCard({ iconName, iconColor = Colors.oxblood, value, label, style }: StatCardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: '#fff',
          borderRadius: 18,
          paddingHorizontal: 12,
          paddingVertical: 11,
          minWidth: 100,
          alignItems: 'flex-start',
          shadowColor: Colors.oxblood,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 30, height: 30, borderRadius: 10,
          backgroundColor: iconColor + '18',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 6,
        }}
      >
        <MaterialIcons name={iconName} size={16} color={iconColor} />
      </View>
      <Text style={{ fontFamily: FontFamily.sans, fontSize: 15, color: Colors.oxblood }}>
        {value}
      </Text>
      <Text style={{ fontFamily: FontFamily.sansRegular, fontSize: 10, color: Colors.rose, marginTop: 1 }}>
        {label}
      </Text>
    </View>
  );
}
