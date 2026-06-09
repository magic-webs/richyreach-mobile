import { Colors, FontFamily } from '@/constants/brand';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

interface CreatorRowProps {
  initials: string;
  bgColor: string;
  name: string;
  followers: string;
  earnings: string;
}

export function CreatorRow({ initials, bgColor, name, followers, earnings }: CreatorRowProps) {
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
      {/* Avatar */}
      <View
        style={{
          width: 44, height: 44, borderRadius: 14,
          backgroundColor: bgColor,
          alignItems: 'center', justifyContent: 'center', marginRight: 12,
        }}
      >
        <Text style={{ fontFamily: FontFamily.sans, fontSize: 14, color: '#fff' }}>
          {initials}
        </Text>
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FontFamily.sans, fontSize: 13, color: Colors.ink }}>
          {name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
          <Feather name="users" size={10} color={Colors.rose} />
          <Text style={{ fontFamily: FontFamily.sansRegular, fontSize: 11, color: Colors.rose, marginLeft: 4 }}>
            {followers} followers
          </Text>
        </View>
      </View>

      {/* Earnings badge */}
      <View style={{ backgroundColor: Colors.green + '18', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
        <Text style={{ fontFamily: FontFamily.sans, fontSize: 12, color: Colors.green }}>
          {earnings}
        </Text>
      </View>
    </View>
  );
}
