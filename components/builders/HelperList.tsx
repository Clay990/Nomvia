import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Helper {
  id: number;
  name: string;
  skill: string;
  dist: string;
  image: string;
  verified: boolean;
}

interface HelperListProps {
  helpers: Helper[];
  colors: any;
}

const HelperList: React.FC<HelperListProps> = ({ helpers, colors }) => {
  if (helpers.length === 0) return null;

  const styles = getStyles(colors);

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>People Who Can Help</Text>
      </View>
      <Text style={styles.sectionSub}>Independent workers & experienced nomads nearby.</Text>
      <View style={styles.verticalList}>
        {helpers.map((helper) => (
          <TouchableOpacity key={helper.id} style={styles.helperCard}>
            <Image source={{ uri: helper.image }} style={styles.helperImage} />
            <View style={styles.helperContent}>
              <View style={styles.rowBetween}>
                <Text style={styles.helperName}>{helper.name}</Text>
                {helper.verified && <MaterialCommunityIcons name="check-decagram" size={16} color="#3B82F6" />}
              </View>
              <Text style={styles.helperSkill}>{helper.skill}</Text>
              <View style={styles.distRow}>
                <MaterialCommunityIcons name="map-marker" size={12} color={colors.subtext} />
                <Text style={styles.distText}>{helper.dist}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.msgBtn}>
              <MaterialCommunityIcons name="chat-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </TouchableOpacity>
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
  verticalList: { paddingHorizontal: 24, gap: 12 },
  helperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  helperImage: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  helperContent: { flex: 1 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  helperName: { fontSize: 16, fontWeight: '700', color: colors.text },
  helperSkill: { fontSize: 13, color: colors.subtext, marginVertical: 2 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distText: { fontSize: 12, color: colors.subtext },
  msgBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HelperList;
