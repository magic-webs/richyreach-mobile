import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { api } from '@/lib/api';
import type { PayoutMethod } from '@/types/payout';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Check, Plus, Smartphone, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AddPayoutMethodSheet } from './AddPayoutMethodSheet';

/**
 * Where withdrawals land. Shown on the wallet screen so a creator can set this up before
 * they hit the withdraw flow and discover they have nowhere to be paid.
 */
export function PayoutMethodsCard() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);

  const { data: methods = [], isLoading } = useQuery({
    queryKey: ['payoutMethods'],
    queryFn: () => api.wallet.payoutMethods.list(),
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => api.wallet.payoutMethods.setDefault(id),
    onSuccess: (next) => queryClient.setQueryData(['payoutMethods'], next),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => api.wallet.payoutMethods.remove(id),
    onSuccess: (next) => queryClient.setQueryData(['payoutMethods'], next),
    onError: (err: any) => Alert.alert('Could not remove', err?.message || 'Please try again.'),
  });

  const confirmRemove = (m: PayoutMethod) => {
    Alert.alert('Remove this payout method?', m.display, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeMutation.mutate(m.id) },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Payout destination</Text>
          <Text style={styles.sub}>Where your withdrawals are sent</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.85} onPress={() => setAddOpen(true)}>
          <Plus size={14} color={Colors.cream} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="small" color={Colors.oxblood} />
        </View>
      ) : methods.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            No bank account or UPI ID yet. Add one so your withdrawals have somewhere to go.
          </Text>
        </View>
      ) : (
        <View style={{ gap: 10, marginTop: 14 }}>
          {methods.map((m) => {
            const Glyph = m.type === 'upi' ? Smartphone : Building2;
            return (
              <View key={m.id} style={[styles.row, m.isDefault && styles.rowDefault]}>
                <View style={styles.rowIcon}>
                  <Glyph size={17} color={Colors.oxblood} />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.rowTop}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {m.display}
                    </Text>
                    {m.isDefault && (
                      <View style={styles.defaultPill}>
                        <Text style={styles.defaultPillText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.rowSub} numberOfLines={1}>
                    {m.type === 'upi'
                      ? m.label || 'UPI'
                      : [m.accountHolderName, m.ifsc].filter(Boolean).join(' · ')}
                  </Text>
                </View>

                {/* Setting a default is the common action, so it is one tap on the row itself. */}
                {!m.isDefault && (
                  <TouchableOpacity
                    style={styles.iconBtn}
                    activeOpacity={0.8}
                    onPress={() => setDefaultMutation.mutate(m.id)}
                    disabled={setDefaultMutation.isPending}
                  >
                    <Check size={15} color={Colors.green} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.iconBtn}
                  activeOpacity={0.8}
                  onPress={() => confirmRemove(m)}
                  disabled={removeMutation.isPending}
                >
                  <Trash2 size={15} color="#a3323f" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      {addOpen && (
        <AddPayoutMethodSheet visible={addOpen} onClose={() => setAddOpen(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: Radius.xl, padding: 16, ...Shadow.card },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontFamily: FontFamily.sansMedium, fontSize: 15.5, fontWeight: '700', color: Colors.ink },
  sub: { fontSize: 11.5, color: 'rgba(63,3,11,0.45)', marginTop: 2 },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.oxblood,
    borderRadius: 99,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  addBtnText: { fontSize: 12, fontWeight: '700', color: Colors.cream },

  loading: { paddingVertical: 22, alignItems: 'center' },
  empty: { marginTop: 12, backgroundColor: Colors.creamLite, borderRadius: Radius.md, padding: 13 },
  emptyText: { fontSize: 12, color: 'rgba(63,3,11,0.5)', lineHeight: 17 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: Colors.creamLite,
    borderRadius: Radius.lg,
    padding: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  rowDefault: { borderColor: 'rgba(42,122,90,0.35)' },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(63,3,11,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  rowTitle: { fontSize: 13.5, fontWeight: '700', color: Colors.ink, flexShrink: 1 },
  rowSub: { fontSize: 11, color: 'rgba(63,3,11,0.45)', marginTop: 2 },
  defaultPill: {
    backgroundColor: 'rgba(42,122,90,0.12)',
    borderRadius: 99,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  defaultPillText: { fontSize: 9.5, fontWeight: '800', color: Colors.green, letterSpacing: 0.4 },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(63,3,11,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
