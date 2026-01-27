import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ActionFooterProps {
  joinedDate: string;
}

const ActionFooter: React.FC<ActionFooterProps> = ({ joinedDate }) => {
  const handleSOS = () => {
    Alert.alert(
        "Emergency SOS",
        "Are you sure you want to activate SOS? This will notify nearby nomads and emergency contacts.",
        [
            { text: "Cancel", style: "cancel" },
            { text: "Activate", style: "destructive", onPress: () => alert("Emergency SOS Activated") }
        ]
    );
  };

  return (
    <View style={styles.actionFooter}>
         <View style={styles.socialRow}>
             <TouchableOpacity style={styles.socialCircle} accessibilityLabel="Instagram" accessibilityRole="button">
                <MaterialCommunityIcons name="instagram" size={20} color="#111" />
             </TouchableOpacity>
             <TouchableOpacity style={styles.socialCircle} accessibilityLabel="YouTube" accessibilityRole="button">
                <MaterialCommunityIcons name="youtube" size={20} color="#111" />
             </TouchableOpacity>
             <TouchableOpacity style={styles.socialCircle} accessibilityLabel="Website" accessibilityRole="button">
                <MaterialCommunityIcons name="web" size={20} color="#111" />
             </TouchableOpacity>
         </View>

         <TouchableOpacity 
            style={styles.sosButton} 
            onPress={handleSOS}
            accessibilityLabel="Emergency SOS"
            accessibilityRole="button"
            accessibilityHint="Activates emergency beacon"
         >
            <MaterialCommunityIcons name="alert-circle" size={22} color="#FFF" />
            <Text style={styles.sosText}>Emergency SOS</Text>
         </TouchableOpacity>

         <Text style={styles.joinedText}>Joined {joinedDate ? new Date(joinedDate).toLocaleDateString() : "Recently"}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  actionFooter: { alignItems: 'center', marginBottom: 60, marginTop: 10 },
  socialRow: { flexDirection: 'row', gap: 16, marginBottom: 30 },
  socialCircle: { 
     width: 50, 
     height: 50, 
     borderRadius: 25, 
     backgroundColor: '#FFF', 
     justifyContent: 'center', 
     alignItems: 'center',
     shadowColor: "#000",
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.05,
     shadowRadius: 4,
     elevation: 2,
     borderWidth: 1,
     borderColor: '#F3F4F6'
  },
  sosButton: { 
     flexDirection: 'row', 
     alignItems: 'center', 
     gap: 8, 
     backgroundColor: '#EF4444', 
     paddingHorizontal: 30, 
     paddingVertical: 16, 
     borderRadius: 30, 
     marginBottom: 16,
     shadowColor: "#EF4444",
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.3,
     shadowRadius: 10,
     elevation: 5
  },
  sosText: { color: '#FFF', fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },
  joinedText: { color: '#9CA3AF', fontSize: 12, fontWeight: '500' },
});

export default ActionFooter;
