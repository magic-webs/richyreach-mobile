import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BottomSheet as ExpoBottomSheet } from '@expo/ui';
import { Colors, FontFamily } from '@/constants/brand';
import { GradientView } from './gradient-view';
import { Icon } from './icon';

interface BottomSheetProps {
  visible: boolean;
  title: string;
  icon: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({ visible, title, icon, onClose, children }: BottomSheetProps) {
  return (
    <ExpoBottomSheet
      isPresented={visible}
      onDismiss={onClose}
      showDragIndicator={true}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <GradientView variant="rose" style={styles.iconWrap}>
            <Icon name={icon} size={20} color="#fff" />
          </GradientView>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Icon name="x" size={18} color={Colors.oxblood} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </View>
    </ExpoBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: Colors.creamLite,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.serif,
    fontSize: 21,
    fontWeight: '700',
    color: Colors.ink,
    flex: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 99,
    backgroundColor: 'rgba(63,3,11,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 20,
    paddingBottom: 44,
  },
});
