import { Colors, FontFamily } from '@/constants/brand';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
} from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from './icon';

interface BottomSheetProps {
  visible: boolean;
  title: string;
  icon: string;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  hideHeaderBorder?: boolean;
}

const DEFAULT_SNAP_POINTS = ['55%', '90%'];

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

export function BottomSheet({
  visible,
  title,
  icon,
  onClose,
  children,
  snapPoints = DEFAULT_SNAP_POINTS,
  hideHeaderBorder = false,
}: BottomSheetProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const snaps = useMemo(() => snapPoints, [snapPoints]);

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

  const handleStyle = useMemo(
    () => ({
      backgroundColor: Colors.creamLite,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingTop: 10,
    }),
    []
  );

  const handleIndicatorStyle = useMemo(
    () => ({
      backgroundColor: 'rgba(63,3,11,0.2)',
      width: 40,
      height: 5,
    }),
    []
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snaps}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      backgroundComponent={CustomBackground}
      handleStyle={handleStyle}
      handleIndicatorStyle={handleIndicatorStyle}
      enableDynamicSizing={false}
    >
      {/* Header */}
      <View style={[styles.header, hideHeaderBorder && styles.headerNoBorder]}>
        <View style={styles.iconWrap}>
          <Icon name={icon} size={20} color="#fff" />
        </View>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
          <Icon name="x" size={18} color={Colors.oxblood} />
        </TouchableOpacity>
      </View>

      {/* Scrollable body */}
      <BottomSheetScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.creamLite,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.07)',
  },
  headerNoBorder: {
    borderBottomWidth: 0,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: Colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.sansMedium,
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
    paddingTop: 16,
    paddingBottom: 56,
  },
});
