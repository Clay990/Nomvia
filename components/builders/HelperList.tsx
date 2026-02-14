import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SafetyBanner from './SafetyBanner';

interface Helper {
  id: string;
  name: string;
  skill: string;
  dist: string;
  image: string;
  verified: boolean;
  rating?: number;
  hourlyRate?: string;
  isMock?: boolean;
}

interface HelperListProps {
  helpers: Helper[];
  colors: any;
  onChat: (id: string) => void;
  onProfile: (id: string) => void;
  onBook?: (id: string) => void;
}

const HelperList: React.FC<HelperListProps> = ({ helpers, colors, onChat, onProfile, onBook }) => {
  if (helpers.length === 0) return null;

  const styles = getStyles(colors);

  return (
    <>
      <SafetyBanner colors={colors} />
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>People Who Can Help</Text>
      </View>
      <Text style={styles.sectionSub}>Independent workers & experienced nomads nearby.</Text>
      <View style={styles.verticalList}>
        {helpers.map((helper) => (
          <TouchableOpacity key={helper.id} style={styles.helperCard} onPress={() => onProfile(helper.id.toString())}>
            <Image source={{ uri: helper.image }} style={styles.helperImage} />
            <View style={styles.helperContent}>
              <View style={styles.rowBetween}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                    <Text style={styles.helperName}>{helper.name}</Text>
                    {helper.isMock && (
                        <View style={{backgroundColor: '#E5E7EB', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4}}>
                            <Text style={{fontSize: 8, color: '#6B7280', fontWeight: '700'}}>DEMO</Text>
                        </View>
                    )}
                </View>
                {helper.verified && <MaterialCommunityIcons name="check-decagram" size={16} color="#3B82F6" />}
              </View>
              <Text style={styles.helperSkill}>{helper.skill}</Text>
              
              <View style={styles.metaRow}>
                <View style={styles.distRow}>
                    <MaterialCommunityIcons name="map-marker" size={12} color={colors.subtext} />
                    <Text style={styles.distText}>{helper.dist}</Text>
                </View>
                {helper.rating && (
                    <View style={styles.ratingRow}>
                        <MaterialCommunityIcons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.ratingText}>{helper.rating}</Text>
                    </View>
                )}
                {helper.hourlyRate && (
                    <Text style={styles.rateText}>{helper.hourlyRate}</Text>
                )}
              </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity style={styles.bookBtn} onPress={() => onBook && onBook(helper.id.toString())}>
                  <Text style={styles.bookBtnText}>Book</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.msgBtn} onPress={() => onChat(helper.id.toString())}>
                  <MaterialCommunityIcons name="chat-outline" size={20} color={colors.text} />
                </TouchableOpacity>
            </View>
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
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distText: { fontSize: 12, color: colors.subtext },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 12, fontWeight: '700', color: colors.text },
  rateText: { fontSize: 12, fontWeight: '600', color: '#10B981' },
  actions: { flexDirection: 'row', gap: 8 },
  msgBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookBtn: {
      height: 40,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center'
  },
  bookBtnText: { color: '#FFF', fontWeight: '600', fontSize: 13 }
});

export default HelperList;
