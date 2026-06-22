import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontFamily, Shadow } from '@/constants/brand';
import { Icon } from '@/components/ui/icon';
import { useUIStore } from '@/store/ui';

interface LanguageItem {
  code: string;
  name: string;
  nativeName: string;
}

const LANGUAGES: LanguageItem[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];

export function LanguageContent() {
  const showModal = useUIStore((s) => s.showModal);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleSelectLanguage = (code: string, name: string) => {
    setSelectedLanguage(code);
    showModal({
      title: 'Language Updated 🌐',
      message: `Preferred app language set to ${name}.`,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select App Language</Text>
      <Text style={styles.subtitle}>Choose your preferred language for the RichyReach application interface.</Text>

      <View style={styles.card}>
        {LANGUAGES.map((lang, idx) => {
          const isSelected = selectedLanguage === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.row,
                idx < LANGUAGES.length - 1 && styles.border,
              ]}
              onPress={() => handleSelectLanguage(lang.code, lang.name)}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.langName, isSelected && styles.selectedText]}>{lang.name}</Text>
                <Text style={styles.langNative}>{lang.nativeName}</Text>
              </View>
              {isSelected && (
                <View style={styles.checkWrap}>
                  <Icon name="verified" size={18} color={Colors.oxblood} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  title: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    color: 'rgba(63,3,11,0.6)',
    lineHeight: 18,
    marginBottom: 16,
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
    paddingVertical: 14,
  },
  border: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(63,3,11,0.06)',
  },
  langName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14.5,
    fontWeight: '600',
    color: Colors.ink,
  },
  selectedText: {
    color: Colors.oxblood,
    fontWeight: '700',
  },
  langNative: {
    fontFamily: FontFamily.sans,
    fontSize: 11.5,
    color: 'rgba(63,3,11,0.4)',
    marginTop: 2,
  },
  checkWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
