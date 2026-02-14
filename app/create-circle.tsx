import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput, 
    ScrollView, 
    Switch, 
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { CirclesService } from './services/circles';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';

export default function CreateCircleScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [isPrivate, setIsPrivate] = useState(true);
    const [image, setImage] = useState<string | null>(null);

    const [inviteCode, setInviteCode] = useState('');

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.7,
            });
            if (!result.canceled) {
                setImage(result.assets[0].uri);
                Haptics.selectionAsync();
            }
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Could not select image' });
        }
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            Toast.show({ type: 'error', text1: 'Missing Name', text2: 'Please give your circle a name.' });
            return;
        }
        setLoading(true);
        try {
            const newCircle = await CirclesService.createCircle({ 
                name, 
                description: desc, 
                isPrivate,
                image: image || undefined
            });
            
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            Alert.alert(
                "Circle Created!", 
                `Your Invite Code is:\n\n${newCircle.inviteCode}\n\nShare this with friends to let them join.`, 
                [
                    { 
                        text: "Copy Code", 
                        onPress: async () => {
                            await Clipboard.setStringAsync(newCircle.inviteCode);
                            router.back();
                        }
                    },
                    { text: "OK", onPress: () => router.back() }
                ]
            );
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Could not create circle.' });
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!inviteCode.trim()) return;
        setLoading(true);
        try {
            await CirclesService.joinCircle(inviteCode);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show({ type: 'success', text1: 'Success', text2: 'Successfully joined the circle!' });
            setTimeout(() => {
                router.back();
            }, 1500);
        } catch (error: any) {
            let msg = "Please check the invite code.";
            if (error.message === "Already a member") {
                msg = "You are already a member of this circle.";
            } else if (error.message === "Invalid invite code") {
                msg = "Invalid invite code. Please check and try again.";
            }
            Toast.show({ type: 'error', text1: 'Error', text2: msg });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <Stack.Screen options={{ 
                headerShown: true, 
                title: activeTab === 'create' ? "Start a Circle" : "Join Community",
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.text,
                headerShadowVisible: false,
            }} />

            <View style={styles.tabs}>
                <TouchableOpacity 
                    onPress={() => { Haptics.selectionAsync(); setActiveTab('create'); }}
                    style={[styles.tab, activeTab === 'create' && { backgroundColor: colors.text }]}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'create' ? colors.background : colors.subtext }]}>Create</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => { Haptics.selectionAsync(); setActiveTab('join'); }}
                    style={[styles.tab, activeTab === 'join' && { backgroundColor: colors.text }]}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'join' ? colors.background : colors.subtext }]}>Join</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {activeTab === 'create' ? (
                    <View style={styles.form}>
                        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <TouchableOpacity onPress={pickImage} style={styles.iconUpload}>
                                {image ? (
                                    <Image source={{ uri: image }} style={{ width: '100%', height: '100%', borderRadius: 40 }} contentFit="cover" />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons name="camera-plus" size={32} color={colors.subtext} />
                                        <Text style={{ color: colors.subtext, fontSize: 12, marginTop: 4 }}>Cover</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            
                            <Text style={[styles.label, { color: colors.subtext }]}>CIRCLE NAME</Text>
                            <TextInput 
                                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                                placeholder="e.g. Solo Van Girls"
                                placeholderTextColor={colors.subtext}
                                value={name}
                                onChangeText={setName}
                            />

                            <Text style={[styles.label, { color: colors.subtext, marginTop: 16 }]}>DESCRIPTION</Text>
                            <TextInput 
                                style={[styles.input, { color: colors.text, borderColor: colors.border, minHeight: 80, textAlignVertical: 'top' }]}
                                placeholder="What's this circle about?"
                                placeholderTextColor={colors.subtext}
                                multiline
                                value={desc}
                                onChangeText={setDesc}
                            />

                            <View style={[styles.row, { marginTop: 20 }]}>
                                <View>
                                    <Text style={[styles.rowTitle, { color: colors.text }]}>Private Circle</Text>
                                    <Text style={{ color: colors.subtext, fontSize: 12 }}>Invite-only access</Text>
                                </View>
                                <Switch 
                                    value={isPrivate} 
                                    onValueChange={setIsPrivate} 
                                    trackColor={{ false: colors.border, true: colors.primary }}
                                />
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={[styles.btn, { backgroundColor: colors.primary }]} 
                            onPress={handleCreate}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Create Circle</Text>}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.form}>
                        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, alignItems: 'center', paddingVertical: 40 }]}>
                            <MaterialCommunityIcons name="ticket-confirmation-outline" size={64} color={colors.subtext} />
                            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 16 }}>Have an invite code?</Text>
                            <Text style={{ color: colors.subtext, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 }}>
                                Enter the code shared by a community leader to join their private circle.
                            </Text>

                            <TextInput 
                                style={[styles.codeInput, { color: colors.text, borderColor: colors.border }]}
                                placeholder="INVITE-CODE"
                                placeholderTextColor={colors.subtext}
                                value={inviteCode}
                                onChangeText={setInviteCode}
                                autoCapitalize="characters"
                            />
                        </View>

                        <TouchableOpacity 
                            style={[styles.btn, { backgroundColor: colors.text }]} 
                            onPress={handleJoin}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color={colors.background} /> : <Text style={[styles.btnText, { color: colors.background }]}>Join Community</Text>}
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    tabs: { flexDirection: 'row', padding: 16, gap: 12 },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
    tabText: { fontWeight: '700' },
    content: { padding: 16 },
    form: { gap: 24 },
    card: { padding: 20, borderRadius: 20, borderWidth: 1 },
    label: { fontSize: 11, fontWeight: '700', marginBottom: 8, letterSpacing: 1 },
    input: { borderWidth: 1, padding: 12, borderRadius: 12, fontSize: 16 },
    iconUpload: { alignSelf: 'center', alignItems: 'center', marginBottom: 20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    rowTitle: { fontWeight: '600', fontSize: 15 },
    btn: { padding: 16, borderRadius: 16, alignItems: 'center' },
    btnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
    codeInput: { marginTop: 24, borderWidth: 1, borderRadius: 12, padding: 16, width: '100%', textAlign: 'center', fontSize: 20, fontWeight: '700', letterSpacing: 2 }
});
