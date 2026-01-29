import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface BioSectionProps {
  bio: string;
  interests: string[];
}

const BioSection: React.FC<BioSectionProps> = ({ bio, interests }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.cardSection}>
        <Text style={styles.sectionTitle}>The Journey</Text>
        <Text style={styles.bioText}>{bio || "No bio yet."}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
            {interests && interests.map((tag: string) => (
                <Text key={tag} style={styles.hashTag}>#{tag}</Text>
            ))}
        </ScrollView>
    </View>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  cardSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 8 },
  bioText: { fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.subtext, lineHeight: 24, marginBottom: 12 },
  tagsScroll: { flexDirection: 'row' },
  hashTag: { fontSize: 13, fontWeight: '600', color: colors.primary, marginRight: 12 },
});

export default BioSection;