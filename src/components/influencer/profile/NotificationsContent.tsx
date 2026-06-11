import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Shadow } from '@/constants/brand';

interface ToggleRowProps {
  label: string;
  sub?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  icon?: string;
}

function ToggleRow({ label, sub, value, onChange, icon }: ToggleRowProps) {
  return (
    <View style={toggleStyles.row}>
      {icon && (
        <View style={toggleStyles.iconWrap}>
          <Icon name={icon} size={16} color={Colors.oxblood} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={toggleStyles.label}>{label}</Text>
        {sub && <Text style={toggleStyles.sub}>{sub}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: 'rgba(63,3,11,0.18)', true: Colors.oxblood }}
        thumbColor="#fff"
      />
    </View>
  );
}

const toggleStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.07)',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: 'rgba(180,106,116,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 14.5, fontWeight: '600', color: Colors.ink },
  sub: { fontSize: 12, color: 'rgba(63,3,11,0.5)', marginTop: 2 },
});

export function NotificationsContent() {
  const [prefs, setPrefs] = useState({
    newCollabs: true,
    payments: true,
    messages: true,
    arena: true,
    updates: false,
    marketing: false,
  });

  const set = (k: keyof typeof prefs, v: boolean) =>
    setPrefs((p) => ({ ...p, [k]: v }));

  return (
    <View>
      <View style={{ backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 16, ...Shadow.card }}>
        <ToggleRow
          label="New collab matches"
          sub="Brands that suit your profile"
          icon="briefcase"
          value={prefs.newCollabs}
          onChange={(v) => set('newCollabs', v)}
        />
        <ToggleRow
          label="Payments & payouts"
          sub="When money moves"
          icon="dollar-sign"
          value={prefs.payments}
          onChange={(v) => set('payments', v)}
        />
        <ToggleRow
          label="Messages"
          sub="New chat from brands"
          icon="chat"
          value={prefs.messages}
          onChange={(v) => set('messages', v)}
        />
        <ToggleRow
          label="Arena & contests"
          sub="New challenges, results"
          icon="trophy"
          value={prefs.arena}
          onChange={(v) => set('arena', v)}
        />
        <ToggleRow
          label="App updates"
          sub="New features & tips"
          icon="sparkle"
          value={prefs.updates}
          onChange={(v) => set('updates', v)}
        />
        <ToggleRow
          label="Marketing"
          sub="Offers, promotions"
          icon="gift"
          value={prefs.marketing}
          onChange={(v) => set('marketing', v)}
        />
      </View>
      <TouchableOpacity style={[saveBtn.btn, { marginTop: 16 }]} activeOpacity={0.85}>
        <Text style={saveBtn.text}>Save preferences</Text>
      </TouchableOpacity>
    </View>
  );
}

const saveBtn = StyleSheet.create({
  btn: {
    height: 50,
    borderRadius: 15,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: FontFamily.sans,
    fontWeight: '800',
    fontSize: 15,
    color: Colors.cream,
  },
});
