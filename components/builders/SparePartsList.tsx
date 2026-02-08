import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface SparePart {
  id: number;
  item: string;
  price: string;
  dist: string;
  image: string;
}

interface SparePartsListProps {
  parts: SparePart[];
  colors: any;
}

const SparePartsList: React.FC<SparePartsListProps> = ({ parts, colors }) => {
  if (parts.length === 0) return null;

  const styles = getStyles(colors);

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Urgent Parts Nearby</Text>
      </View>
      <Text style={styles.sectionSub}>Nomads selling spare parts in your area.</Text>
      <View style={styles.partsList}>
        {parts.map((part) => (
          <View key={part.id} style={styles.partCard}>
            <View style={styles.partIconBox}>
              <MaterialCommunityIcons name="cube-outline" size={24} color={colors.subtext} />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.partName}>{part.item}</Text>
              <Text style={styles.partPrice}>{part.price} • {part.dist} away</Text>
            </View>
            <TouchableOpacity style={styles.buyBtn}>
              <Text style={styles.buyBtnText}>Contact</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    marginTop: 20 
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  sectionSub: { paddingHorizontal: 24, fontSize: 13, color: colors.subtext, marginTop: 4, marginBottom: 16 },
  partsList: { paddingHorizontal: 24, gap: 12 },
  partCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  partIconBox: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginRight: 12, backgroundColor: colors.card, borderRadius: 8 },
  partName: { fontSize: 14, fontWeight: '700', color: colors.text },
  partPrice: { fontSize: 12, color: colors.subtext },
  buyBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 6 },
  buyBtnText: { fontSize: 12, fontWeight: '700', color: colors.text },
});

export default SparePartsList;
