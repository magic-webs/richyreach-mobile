import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { Icon } from '@/components/ui/icon';
import { useUIStore } from '@/store/ui';

interface ToggleRowProps {
  label: string;
  sub?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  icon?: string;
}

function ToggleRow({ label, sub, value, onChange, icon }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      {icon && (
        <View style={styles.iconWrap}>
          <Icon name={icon} size={16} color={Colors.oxblood} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {sub && <Text style={styles.sub}>{sub}</Text>}
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

export function PrivacyContent() {
  const showModal = useUIStore((s) => s.showModal);
  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showEarnings: true,
    showContactInfo: false,
    requireApproval: true,
  });

  const set = (k: keyof typeof privacy, v: boolean) => {
    setPrivacy((p) => ({ ...p, [k]: v }));
  };

  const handleSave = () => {
    showModal({
      title: 'Privacy Settings Updated 🔒',
      message: 'Your profile privacy settings have been successfully updated.',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ToggleRow
          label="Public Profile"
          sub="Allow brands to find you in search & marketplace"
          icon="users"
          value={privacy.publicProfile}
          onChange={(v) => set('publicProfile', v)}
        />
        <ToggleRow
          label="Display Earnings"
          sub="Show your total earned amount on your public profile"
          icon="wallet"
          value={privacy.showEarnings}
          onChange={(v) => set('showEarnings', v)}
        />
        <ToggleRow
          label="Direct Contact Details"
          sub="Share WhatsApp & email contacts with active campaign partners"
          icon="chat"
          value={privacy.showContactInfo}
          onChange={(v) => set('showContactInfo', v)}
        />
        <ToggleRow
          label="Brand Invitations Approval"
          sub="Require manually accepting campaign requests before starting"
          icon="verified"
          value={privacy.requireApproval}
          onChange={(v) => set('requireApproval', v)}
        />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
        <Text style={styles.saveBtnText}>Save Privacy Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    ...Shadow.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.06)',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: 'rgba(180,106,116,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14.5,
    fontWeight: '600',
    color: Colors.ink,
  },
  sub: {
    fontFamily: FontFamily.sans,
    fontSize: 11.5,
    color: 'rgba(63,3,11,0.5)',
    marginTop: 2,
    lineHeight: 16,
  },
  saveBtn: {
    marginTop: 16,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.oxblood,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: FontFamily.sans,
    fontWeight: '800',
    fontSize: 14.5,
    color: Colors.cream,
  },
});
