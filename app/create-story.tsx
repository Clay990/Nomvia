import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Dimensions, Image, ImageBackground, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StoriesService } from './services/stories';
import { events } from './utils/events';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export default function CreateStoryScreen() {
  const router = useRouter();
  
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [duration, setDuration] = useState<number>(5000);
  const [isUploading, setIsUploading] = useState(false);

  const handlePickMedia = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: 'error', text1: 'Permission Denied', text2: 'Gallery access is needed.' });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        quality: 0.8,
        allowsEditing: true, 
      });
      
      if (!result.canceled) {
        const asset = result.assets[0];
        
        if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
            Toast.show({ type: 'error', text1: 'File Too Large', text2: 'Please choose a file smaller than 50MB.' });
            return;
        }

        setImageUri(asset.uri);
        setMimeType(asset.type === 'video' ? 'video/mp4' : 'image/jpeg');
        if (asset.duration) setDuration(asset.duration);
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not select media.' });
    }
  };

  const handleUpload = async () => {
    if (!imageUri) return;
    
    setIsUploading(true);
    try {
      await StoriesService.uploadStory(imageUri, mimeType, duration);
      events.emit('story_created');
      router.back();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Upload Failed', text2: 'Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  if (imageUri) {
    return (
        <View style={[styles.container, { backgroundColor: '#000' }]}>
          <StatusBar barStyle="light-content" hidden />
          {mimeType.startsWith('video') ? (
              <Video
                  source={{ uri: imageUri }}
                  style={styles.fullImage}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay
                  isLooping
              />
          ) : (
              <Image source={{ uri: imageUri }} style={styles.fullImage} resizeMode="cover" />
          )}
          
          <LinearGradient 
            colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.6)']} 
            style={StyleSheet.absoluteFill} 
            pointerEvents="none"
          />
    
          <SafeAreaView style={styles.overlayContainer}>
             <View style={styles.headerRow}>
                 <TouchableOpacity onPress={() => setImageUri(null)} style={styles.roundBtn}>
                    <Ionicons name="close" size={24} color="#FFF" />
                 </TouchableOpacity>
                 <View style={styles.toolsRow}>
                    <TouchableOpacity style={styles.toolBtn}>
                        <MaterialCommunityIcons name="sticker-emoji" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolBtn}>
                        <MaterialCommunityIcons name="format-text" size={24} color="#FFF" />
                    </TouchableOpacity>
                 </View>
             </View>
    
             <View style={styles.footerRow}>
                 <View style={styles.avatarRow}>
                     <View style={styles.avatarPlaceholder} />
                     <Text style={styles.yourStoryText}>Your Story</Text>
                 </View>
                 
                 <TouchableOpacity 
                    style={[styles.publishBtn, isUploading && { opacity: 0.7 }]} 
                    onPress={handleUpload}
                    disabled={isUploading}
                 >
                    {isUploading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <>
                            <Text style={styles.publishText}>SHARE</Text>
                            <MaterialCommunityIcons name="send" size={16} color="#000" />
                        </>
                    )}
                 </TouchableOpacity>
             </View>
          </SafeAreaView>
        </View>
      );
  }

  return (
    <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1533582406801-766130b404cb?q=80&w=1974&auto=format&fit=crop' }} 
        style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                <Ionicons name="close" size={28} color="#FFF" />
            </TouchableOpacity>
        </View>

        <View style={styles.cardContainer}>
            <BlurView intensity={80} tint="dark" style={styles.glassCard}>
                <View style={styles.iconRing}>
                    <MaterialCommunityIcons name="image-plus" size={40} color="#FFD700" />
                </View>
                <Text style={styles.cardTitle}>Add to Story</Text>
                <Text style={styles.cardText}>
                    Share a photo or video from your gallery to keep the convoy updated.
                </Text>
                
                <TouchableOpacity style={styles.actionBtn} onPress={handlePickMedia} activeOpacity={0.8}>
                    <Text style={styles.actionBtnText}>SELECT FROM GALLERY</Text>
                    <Ionicons name="images" size={20} color="#000" />
                </TouchableOpacity>
            </BlurView>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  headerRow: { padding: 20, alignItems: 'flex-start' },
  closeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  
  cardContainer: { flex: 1, justifyContent: 'flex-end', padding: 24, paddingBottom: 60 },
  glassCard: { padding: 32, borderRadius: 32, overflow: 'hidden', alignItems: 'center', gap: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  iconRing: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,215,0,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)' },
  cardTitle: { fontSize: 28, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },
  cardText: { fontSize: 16, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 24 },
  actionBtn: { width: '100%', height: 60, backgroundColor: '#FFD700', borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16, shadowColor: '#FFD700', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: {width: 0, height: 4} },
  actionBtnText: { color: '#000', fontWeight: '800', fontSize: 15, letterSpacing: 1 },

  fullImage: { width: width, height: height, position: 'absolute' },
  overlayContainer: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
  roundBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  toolsRow: { gap: 16 },
  toolBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(0,0,0,0.4)', padding: 6, paddingRight: 16, borderRadius: 24 },
  avatarPlaceholder: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFD700' },
  yourStoryText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  publishBtn: { backgroundColor: '#FFD700', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 8 },
  publishText: { color: '#000', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
});