import { Colors, FontFamily } from '@/constants/brand';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

interface BrandRowProps {
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  iconColor: string;
  name: string;
  category: string;
  campaigns: string;
}

export function BrandRow({ iconName, iconColor, name, category, campaigns }: BrandRowProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        marginBottom: 10,
        shadowColor: Colors.oxblood,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 44, height: 44, borderRadius: 14,
          backgroundColor: iconColor + '1a',
          alignItems: 'center', justifyContent: 'center', marginRight: 12,
        }}
      >
        <MaterialIcons name={iconName} size={22} color={iconColor} />
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FontFamily.sans, fontSize: 13, color: Colors.ink }}>
          {name}
        </Text>
        <Text style={{ fontFamily: FontFamily.sansRegular, fontSize: 11, color: Colors.rose, marginTop: 2 }}>
          {category}
        </Text>
      </View>

      {/* Badge */}
      <View style={{ backgroundColor: Colors.creamLite, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}>
        <Text style={{ fontFamily: FontFamily.sansMedium, fontSize: 10, color: Colors.oxblood }}>
          {campaigns}
        </Text>
      </View>
    </View>
  );
}
