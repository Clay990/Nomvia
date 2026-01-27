import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface StatsGridProps {
  snapshots: any[];
}

const StatsGrid: React.FC<StatsGridProps> = ({ snapshots }) => {
  return (
    <View style={styles.statsGrid}>
        {snapshots && snapshots.map((snap: any, i: number) => (
            <View key={i} style={styles.statItem} accessibilityLabel={`Stat: ${snap.label}`}>
                <View style={styles.statIconBox}>
                    <MaterialCommunityIcons name={snap.icon as any} size={20} color="#111" />
                </View>
                <Text style={styles.statLabel}>{snap.label}</Text>
            </View>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  statsGrid: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     backgroundColor: '#FFF',
     padding: 16,
     borderRadius: 16,
     marginBottom: 20,
     shadowColor: "#000",
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.05,
     shadowRadius: 8,
     elevation: 2,
  },
  statItem: { alignItems: 'center', gap: 6 },
  statIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  statLabel: { fontSize: 11, fontWeight: '600', color: '#4B5563' },
});

export default StatsGrid;
