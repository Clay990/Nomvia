import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, Modal } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface SafetyBannerProps {
  colors: any;
}

const SafetyBanner: React.FC<SafetyBannerProps> = ({ colors }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const styles = getStyles(colors);

  const handleEmergency = () => {
      Alert.alert(
          "Emergency Contact",
          "Call local emergency services?",
          [
              { text: "Cancel", style: "cancel" },
              { text: "Call 911", style: "destructive", onPress: () => Linking.openURL('tel:911') }
          ]
      );
  };

  const handleCheckIn = () => {
      Alert.alert("Safety Check-in", "We will notify your trusted contacts that you are safe.");
  };

  return (
    <>
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconBox}>
                    <MaterialCommunityIcons name="shield-check" size={24} color="#FFF" />
                </View>
                <View style={styles.textBox}>
                    <Text style={styles.title}>Your Safety First</Text>
                    <Text style={styles.subtitle}>Verified providers & secure payments</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setModalVisible(true)}>
                <Text style={styles.actionText}>Safety Tools</Text>
            </TouchableOpacity>
        </View>

        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Safety Toolkit</Text>
                    <Text style={styles.modalSub}>Tools to keep you safe during service visits.</Text>
                    
                    <TouchableOpacity style={styles.toolRow} onPress={handleEmergency}>
                        <View style={[styles.toolIcon, { backgroundColor: '#FEE2E2' }]}>
                            <MaterialCommunityIcons name="phone-alert" size={24} color="#EF4444" />
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={styles.toolTitle}>Emergency Call</Text>
                            <Text style={styles.toolDesc}>Quickly dial local emergency services</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.subtext} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.toolRow} onPress={handleCheckIn}>
                        <View style={[styles.toolIcon, { backgroundColor: '#DBEAFE' }]}>
                            <MaterialCommunityIcons name="map-marker-check" size={24} color="#3B82F6" />
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={styles.toolTitle}>Service Check-in</Text>
                            <Text style={styles.toolDesc}>Share your location with trusted contacts</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.subtext} />
                    </TouchableOpacity>

                     <TouchableOpacity style={styles.toolRow} onPress={() => Linking.openURL('https://nomvia.com/safety')}>
                        <View style={[styles.toolIcon, { backgroundColor: '#DCFCE7' }]}>
                            <MaterialCommunityIcons name="shield-account" size={24} color="#10B981" />
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={styles.toolTitle}>Verification Info</Text>
                            <Text style={styles.toolDesc}>Learn how we vet service providers</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.subtext} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.closeBtn} 
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={styles.closeText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    </>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginBottom: 20,
    marginTop: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconBox: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: '#10B981',
      justifyContent: 'center', alignItems: 'center'
  },
  textBox: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 12, color: colors.subtext },
  actionBtn: {
      paddingVertical: 8, paddingHorizontal: 12,
      backgroundColor: colors.secondary,
      borderRadius: 8
  },
  actionText: { fontSize: 12, fontWeight: '600', color: colors.text },

  centeredView: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.5)"
  },
  modalView: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 8 },
  modalSub: { fontSize: 14, color: colors.subtext, marginBottom: 24 },
  
  toolRow: {
      flexDirection: 'row', alignItems: 'center', gap: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border
  },
  toolIcon: {
      width: 48, height: 48, borderRadius: 24,
      justifyContent: 'center', alignItems: 'center'
  },
  toolTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  toolDesc: { fontSize: 13, color: colors.subtext },

  closeBtn: {
      marginTop: 24,
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      marginBottom: 20
  },
  closeText: { color: "#FFF", fontWeight: "bold", fontSize: 16 }
});

export default SafetyBanner;