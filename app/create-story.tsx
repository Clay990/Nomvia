import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StoriesService } from './services/stories';
import { events } from './utils/events';

const { width, height } = Dimensions.get('window');

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export default function CreateStoryScreen() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [duration, setDuration] = useState<number>(5000);
  const [isUploading, setIsUploading] = useState(false);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Gallery access is needed.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ['images', 'videos'],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        const asset = result.assets[0];
        
        if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
            Alert.alert("File Too Large", "Please choose a file smaller than 50MB.");
            return;
        }

        setImageUri(asset.uri);
        setMimeType(asset.type === 'video' ? 'video/mp4' : 'image/jpeg');
        if (asset.duration) setDuration(asset.duration);
        setStep(3);
      }
    } catch (error: any) {
      Alert.alert("Error", "Could not select media: " + (error.message || "Unknown error"));
    }
  };

  const handleCameraCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
          Alert.alert("Permission Denied", "Camera access is needed.");
          return;
      }

      const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ['images', 'videos'],
          aspect: [9, 16],
          quality: 0.8,
          allowsEditing: true,
          videoMaxDuration: 15
      });
      
      if (!result.canceled) {
          const asset = result.assets[0];

          if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
              Alert.alert("File Too Large", "The captured file exceeds 50MB.");
              return;
          }

          setImageUri(asset.uri);
          setMimeType(asset.type === 'video' ? 'video/mp4' : 'image/jpeg');
          if (asset.duration) setDuration(asset.duration);
          setStep(3);
      }
    } catch (error) {
        Alert.alert("Error", "Could not capture media.");
    }
  };

  const handleUpload = async () => {
    if (!imageUri) return;
    
    setIsUploading(true);
    try {
      await StoriesService.uploadStory(imageUri, mimeType, duration);
      events.emit('story_created');
      Alert.alert("Success", "Live update posted!");
      router.back();
    } catch (error) {
      Alert.alert("Upload Failed", "Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (step === 1) {
    return (
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop' }} 
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerRow}>
             <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#FFF" />
             </TouchableOpacity>
          </View>

          <View style={styles.cardContainer}>
            <BlurView intensity={80} tint="dark" style={styles.glassCard}>
              <View style={styles.iconBadge}>
                 <MaterialCommunityIcons name="compass-outline" size={32} color="#FFD700" />
              </View>
              <Text style={styles.cardTitle}>Log Your Journey</Text>
              <Text style={styles.cardText}>
                Drop a pin, share a view, or warn the convoy. 
                Updates live for 24h.
              </Text>
              
              <View style={styles.statRow}>
                 <View style={styles.statItem}>
                    <Text style={styles.statVal}>24h</Text>
                    <Text style={styles.statLabel}>Visibility</Text>
                 </View>
                 <View style={styles.divider} />
                 <View style={styles.statItem}>
                    <Text style={styles.statVal}>∞</Text>
                    <Text style={styles.statLabel}>Reach</Text>
                 </View>
              </View>

              <TouchableOpacity style={styles.actionBtn} onPress={() => setStep(2)}>
                <Text style={styles.actionBtnText}>CREATE UPDATE</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#000" />
              </TouchableOpacity>
            </BlurView>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (step === 2) {
    return (
      <View style={[styles.container, { backgroundColor: '#121212' }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerRow}>
             <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={28} color="#FFF" />
             </TouchableOpacity>
             <Text style={styles.screenTitle}>NEW ENTRY</Text>
             <View style={{ width: 28 }} />
          </View>

          <View style={styles.captureContent}>
             <View style={styles.viewfinder}>
                <View style={[styles.corner, { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 }]} />
                <View style={[styles.corner, { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 }]} />
                <View style={[styles.corner, { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 }]} />
                <View style={[styles.corner, { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 }]} />
                
                <MaterialCommunityIcons name="camera-iris" size={48} color="rgba(255,255,255,0.3)" />
             </View>

             <View style={styles.controls}>
                 <TouchableOpacity style={styles.galleryBtn} onPress={handlePickImage}>
                    <Ionicons name="images-outline" size={24} color="#FFF" />
                 </TouchableOpacity>

                 <TouchableOpacity style={styles.shutterBtnMain} onPress={handleCameraCapture}>
                     <View style={styles.shutterInnerMain} />
                 </TouchableOpacity>

                 <TouchableOpacity style={styles.galleryBtn} disabled>
                    <Ionicons name="flash-off" size={24} color="rgba(255,255,255,0.3)" />
                 </TouchableOpacity>
             </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      {imageUri && (
          mimeType.startsWith('video') ? (
              <Video
                  source={{ uri: imageUri }}
                  style={styles.fullImage}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay
                  isLooping
              />
          ) : (
              <Image source={{ uri: imageUri }} style={styles.fullImage} resizeMode="cover" />
          )
      )}
      
      <SafeAreaView style={styles.overlayContainer}>
         <View style={styles.headerRow}>
             <TouchableOpacity onPress={() => setStep(2)} style={styles.roundBtn}>
                <Ionicons name="close" size={24} color="#FFF" />
             </TouchableOpacity>
             <View style={styles.toolsRow}>
                <TouchableOpacity style={styles.toolBtn}><MaterialCommunityIcons name="format-text" size={24} color="#FFF" /></TouchableOpacity>
                <TouchableOpacity style={styles.toolBtn}><MaterialCommunityIcons name="sticker-emoji" size={24} color="#FFF" /></TouchableOpacity>
             </View>
         </View>

         <View style={styles.footerRow}>
             <TouchableOpacity 
                style={[styles.publishBtn, isUploading && { opacity: 0.7 }]} 
                onPress={handleUpload}
                disabled={isUploading}
             >
                {isUploading ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <>
                        <Text style={styles.publishText}>POST UPDATE</Text>
                        <MaterialCommunityIcons name="send" size={18} color="#000" />
                    </>
                )}
             </TouchableOpacity>
         </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  cardContainer: { flex: 1, justifyContent: 'flex-end', padding: 20, paddingBottom: 60 },
  glassCard: { padding: 30, borderRadius: 30, overflow: 'hidden', alignItems: 'center', gap: 16 },
  iconBadge: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
  cardText: { fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 24 },
  statRow: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-evenly', marginVertical: 10 },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '700', color: '#FFD700' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' },
  divider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },
  actionBtn: { width: '100%', height: 56, backgroundColor: '#FFD700', borderRadius: 28, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 },
  actionBtnText: { color: '#000', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  screenTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 2 },
  backBtn: { padding: 8 },
  captureContent: { flex: 1, justifyContent: 'space-between', paddingBottom: 40 },
  viewfinder: { flex: 1, margin: 20, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  corner: { position: 'absolute', width: 20, height: 20, borderColor: 'rgba(255,255,255,0.5)' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingHorizontal: 30 },
  shutterBtnMain: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  shutterInnerMain: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF' },
  galleryBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: width, height: height, position: 'absolute' },
  overlayContainer: { flex: 1, justifyContent: 'space-between' },
  roundBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  toolsRow: { flexDirection: 'row', gap: 12 },
  toolBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  footerRow: { padding: 24, alignItems: 'flex-end' },
  publishBtn: { backgroundColor: '#FFD700', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30, flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: "#000", shadowOffset: {width:0, height:4}, shadowOpacity:0.3, shadowRadius:4 },
  publishText: { color: '#000', fontWeight: '800', fontSize: 14, letterSpacing: 1 },
});