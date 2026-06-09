import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
} from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import type { Account } from '@/types';
import { Icon } from './ui/icon';
import { PlaceholderImage } from './ui/placeholder-image';

interface AccountSheetProps {
  visible: boolean;
  accounts: Account[];
  currentId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  onAddAccount?: () => void;
}

function CustomBackground({ style }: BottomSheetBackgroundProps) {
  return (
    <View
      style={[
        style as object,
        {
          backgroundColor: Colors.creamLite,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
        },
      ]}
    />
  );
}

export function AccountSheet({
  visible,
  accounts,
  currentId,
  onSelect,
  onClose,
  onAddAccount,
}: AccountSheetProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const snaps = useMemo(() => ['50%', '75%'], []);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.45}
        style={[props.style, { backgroundColor: 'rgba(42,2,7,0.45)' }]}
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snaps}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      backgroundComponent={CustomBackground}
      handleStyle={styles.handleContainer}
      handleIndicatorStyle={styles.handleBar}
      enableDynamicSizing={false}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Your accounts</Text>
        <Text style={styles.sub}>Switch between creator &amp; brand profiles</Text>

        <View style={styles.list}>
          {accounts.map((a) => {
            const on = a.id === currentId;
            return (
              <TouchableOpacity
                key={a.id}
                onPress={() => onSelect(a.id)}
                activeOpacity={0.8}
                style={[styles.accountRow, on && styles.accountRowActive]}
              >
                <PlaceholderImage tone={a.tone} height={46} width={46} borderRadius={99} />
                <View style={styles.accountInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.accountName}>{a.name}</Text>
                    {a.verified && <Icon name="verified" size={14} color={Colors.rose} />}
                  </View>
                  <Text style={styles.accountMeta}>
                    {a.handle} · {a.followers} · {a.kind}
                  </Text>
                </View>
                <View style={[styles.radio, on && styles.radioActive]}>
                  {on && <Icon name="check" size={15} color={Colors.cream} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={onAddAccount ?? onClose}
          activeOpacity={0.7}
          style={styles.addBtn}
        >
          <Icon name="plus" size={18} color={Colors.oxblood} />
          <Text style={styles.addBtnText}>Add another account</Text>
        </TouchableOpacity>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  handleContainer: {
    backgroundColor: Colors.creamLite,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
  },
  handleBar: {
    backgroundColor: 'rgba(63,3,11,0.2)',
    width: 40,
    height: 5,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    paddingTop: 8,
  },
  title: {
    fontFamily: FontFamily.serif,
    fontSize: 21,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 4,
  },
  sub: {
    fontSize: 13,
    color: 'rgba(63,3,11,0.55)',
    marginBottom: 16,
  },
  list: { gap: 10 },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 13,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  accountRowActive: {
    backgroundColor: '#fff',
    borderColor: Colors.oxblood,
    ...Shadow.card,
  },
  accountInfo: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  accountName: { fontWeight: '700', fontSize: 15, color: Colors.ink },
  accountMeta: { fontSize: 12.5, color: 'rgba(63,3,11,0.55)', marginTop: 1 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: 'rgba(63,3,11,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioActive: { backgroundColor: Colors.oxblood, borderWidth: 0 },
  addBtn: {
    marginTop: 14,
    height: 50,
    borderRadius: 15,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(63,3,11,0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addBtnText: {
    fontWeight: '700',
    fontSize: 14.5,
    color: Colors.oxblood,
  },
});
