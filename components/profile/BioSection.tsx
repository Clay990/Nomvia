import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface BioSectionProps {
  bio: string;
  interests: string[];
}

const BioSection: React.FC<BioSectionProps> = ({ bio, interests }) => {
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

const styles = StyleSheet.create({
  cardSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 8 },
  bioText: { fontSize: 15, color: '#4B5563', lineHeight: 24, marginBottom: 12 },
  tagsScroll: { flexDirection: 'row' },
  hashTag: { fontSize: 13, fontWeight: '600', color: '#3B82F6', marginRight: 12 },
});

export default BioSection;
