import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Category {
  id: number;
  label: string;
  icon: string;
  count: number;
  dist: string;
}

interface CategoryListProps {
  categories: Category[];
  activeCategory?: string;
  colors: any;
  onCategorySelect: (category: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, activeCategory, colors, onCategorySelect }) => {
  if (categories.length === 0) return null;

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Help Near You</Text>
        <TouchableOpacity onPress={() => onCategorySelect('All')}>
            <Text style={styles.seeAllText}>View all</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionSub}>Quick fixes, right now. Based on your location.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
        {categories.map((cat) => {
            const isActive = activeCategory === cat.label;
            return (
              <TouchableOpacity 
                key={cat.id} 
                style={[styles.catCard, isActive && styles.activeCard]} 
                onPress={() => onCategorySelect(cat.label)}
              >
                <View style={[styles.catIconBox, isActive && styles.activeIconBox]}>
                  <MaterialCommunityIcons 
                    name={cat.icon as any} 
                    size={24} 
                    color={isActive ? '#FFF' : colors.text} 
                  />
                </View>
                <Text style={[styles.catLabel, isActive && styles.activeText]}>{cat.label}</Text>
                <Text style={[styles.catMeta, isActive && styles.activeSubText]}>Within {cat.dist}</Text>
                <View style={[styles.catBadge, isActive && styles.activeBadge]}>
                  <Text style={[styles.catBadgeText, isActive && styles.activeBadgeText]}>{cat.count} nearby</Text>
                </View>
              </TouchableOpacity>
            );
        })}
      </ScrollView>
    </View>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: { marginBottom: 8 },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    marginTop: 20 
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  seeAllText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  sectionSub: { paddingHorizontal: 24, fontSize: 13, color: colors.subtext, marginTop: 4, marginBottom: 16 },
  horizontalScroll: { paddingHorizontal: 24, gap: 12, paddingBottom: 8 },
  catCard: {
    width: 140,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  activeCard: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
      transform: [{scale: 1.02}]
  },
  catIconBox: {
    width: 40,
    height: 40,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  activeIconBox: {
      backgroundColor: 'rgba(255,255,255,0.2)'
  },
  catLabel: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 2 },
  activeText: { color: '#FFF' },
  catMeta: { fontSize: 11, color: colors.subtext, marginBottom: 8 },
  activeSubText: { color: 'rgba(255,255,255,0.8)' },
  catBadge: { backgroundColor: colors.secondary, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, alignSelf: 'flex-start' },
  activeBadge: { backgroundColor: 'rgba(255,255,255,0.2)' },
  catBadgeText: { fontSize: 10, fontWeight: '700', color: colors.text },
  activeBadgeText: { color: '#FFF' }
});

export default CategoryList;
