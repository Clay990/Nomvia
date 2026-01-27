import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import SafeImage from '../SafeImage';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface RigCardProps {
  rig: any;
}

const RigCard: React.FC<RigCardProps> = ({ rig }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleSection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={toggleSection}
        style={styles.rigCard}
        accessibilityRole="button"
        accessibilityLabel={`Rig details for ${rig.name}`}
        accessibilityState={{ expanded }}
    >
        <SafeImage source={{ uri: rig.image }} style={styles.rigBg} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.rigOverlay}>
            <View>
                <View style={styles.rigHeader}>
                    <MaterialCommunityIcons name="van-utility" size={24} color="#FFF" />
                    <Text style={styles.rigTitle}>{rig.name}</Text>
                </View>
                <Text style={styles.rigSub}>{rig.summary}</Text>
                {expanded && (
                    <View style={styles.rigExpandedContent}>
                        <View style={styles.techStack}>
                            {rig.tech.map((t: string) => (
                                <View key={t} style={styles.techPill}>
                                    <Text style={styles.techText}>{t}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>
            <MaterialCommunityIcons 
                name={expanded ? "chevron-up" : "chevron-down"} 
                size={24} 
                color="#FFF" 
            />
        </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  rigCard: {
     minHeight: 220, // changed to minHeight to accommodate expansion
     borderRadius: 24,
     overflow: 'hidden',
     marginBottom: 24,
     backgroundColor: '#000',
     position: 'relative'
  },
  rigBg: { width: '100%', height: '100%', position: 'absolute' }, // Absolute to cover
  rigOverlay: { 
     flex: 1, // fill container
     justifyContent: 'space-between',
     padding: 20,
     minHeight: 220
  },
  rigHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 'auto', marginBottom: 4 },
  rigTitle: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  rigSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  rigExpandedContent: { marginTop: 16 },
  techStack: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  techPill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  techText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
});

export default RigCard;
