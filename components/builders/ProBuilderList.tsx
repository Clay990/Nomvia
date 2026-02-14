import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ProBuilder {
  id: string;
  name: string;
  built: string;
  specialty: string;
  image: string;
}

interface ProBuilderListProps {
  builders: ProBuilder[];
  colors: any;
  isPro: boolean;
  onAction: () => void;
  onProfile: (id: string) => void;
}

const ProBuilderList: React.FC<ProBuilderListProps> = ({ builders, colors, isPro, onAction, onProfile }) => {
  if (builders.length === 0) return null;

  const styles = getStyles(colors);

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Pro Builders</Text>
      </View>
      <Text style={styles.sectionSub}>Learn from the best. Verified conversion experts.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
        {builders.map((builder) => (
          <TouchableOpacity key={builder.id} style={styles.proCard} onPress={() => onProfile(builder.id.toString())}>
            <Image source={{ uri: builder.image }} style={styles.proImage} />
            <View style={styles.proContent}>
              <Text style={styles.proName}>{builder.name}</Text>
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>{builder.built} built</Text>
              </View>
              <Text style={styles.proSpec}>{builder.specialty}</Text>
            </View>
            <TouchableOpacity 
                style={[styles.proBtn, !isPro && { backgroundColor: '#444' }]} 
                onPress={onAction}
            >
              {!isPro && <MaterialCommunityIcons name="lock" size={12} color="#FFF" style={{ marginRight: 4 }} />}
              <Text style={styles.proBtnText}>{isPro ? "View Portfolio" : "Unlock Portfolio"}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  horizontalScroll: { paddingHorizontal: 24, gap: 12 },
  proCard: {
    width: 220,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  proImage: { width: '100%', height: 100, resizeMode: 'cover' },
  proContent: { padding: 12 },
  proName: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 4 },
  proBadge: { backgroundColor: '#FEF3C7', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
  proBadgeText: { fontSize: 10, fontWeight: '800', color: '#D97706' },
  proSpec: { fontSize: 12, color: colors.subtext, marginBottom: 12 },
  proBtn: { backgroundColor: colors.primary, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  proBtnText: { color: colors.background, fontSize: 12, fontWeight: '700' },
});

export default ProBuilderList;
