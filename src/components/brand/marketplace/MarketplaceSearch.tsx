import { Icon } from '@/components/ui/icon';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/brand';
import { StyleSheet, TextInput, View } from 'react-native';

interface MarketplaceSearchProps {
  search: string;
  setSearch: (text: string) => void;
}

export function MarketplaceSearch({ search, setSearch }: MarketplaceSearchProps) {
  return (
    <View style={styles.searchBarRow}>
      <View style={styles.searchBar}>
        <Icon name="search" size={16} color="rgba(63, 3, 11, 0.4)" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, niche, handle..."
          placeholderTextColor="rgba(63, 3, 11, 0.3)"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBarRow: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingHorizontal: 16,
    height: 48,
    ...Shadow.card,
    borderWidth: 0.5,
    borderColor: 'rgba(63, 3, 11, 0.04)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    height: '100%',
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: Colors.oxblood,
  },
});
