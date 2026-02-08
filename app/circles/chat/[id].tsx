import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image
} from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { ChatService } from "../../../app/services/chat";
import { CirclesService } from "../../../app/services/circles";
import { useAuth } from "../../../context/AuthContext";
import { Message } from "../../../app/types";
import { useNetwork } from "../../../context/NetworkContext";

export default function CircleChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { isInternetReachable } = useNetwork();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [circleName, setCircleName] = useState("Circle Chat");
  const [circleImage, setCircleImage] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState(0);

  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const init = async () => {
        try {
            const circle = await CirclesService.getCircleById(id as string);
            setCircleName(circle.name);
            setCircleImage(circle.image);
            setMemberCount(circle.members || 0);

            const history = await ChatService.getCircleMessages(id as string);
            setMessages(history);

            unsubscribeRef.current = ChatService.subscribeToCircle(id as string, (newMsg) => {
                setMessages(prev => {
                    if (prev.find(m => m.$id === newMsg.$id)) return prev;
                    return [newMsg, ...prev];
                });
            });

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (id) init();

    return () => {
        if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [id]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    const content = inputText.trim();
    setInputText(""); 

    try {
        await ChatService.sendMessage({
            circleId: id as string,
            content
        });
    } catch (e) {
        console.error("Failed to send", e);
        setInputText(content);
        alert("Failed to send message");
    }
  };

  const renderItem = ({ item, index }: { item: Message, index: number }) => {
      const isMe = item.userId === user?.$id;
      // const prevMessage = messages[index + 1];
      // const isSameUser = prevMessage && prevMessage.userId === item.userId;

      return (
        <View style={[styles.msgRow, isMe ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }]}>
            {!isMe && (
                <Image 
                    source={{ uri: item.user_avatar || 'https://i.pravatar.cc/100' }} 
                    style={styles.msgAvatar}
                />
            )}
            <View style={[
            styles.messageBubble,
            isMe ? styles.myBubble : styles.theirBubble,
            { backgroundColor: isMe ? colors.primary : colors.card, borderColor: isMe ? colors.primary : colors.border }
            ]}>
            {!isMe && (
                <Text style={{ fontSize: 11, color: colors.primary, marginBottom: 2, fontWeight: '700' }}>
                    {item.user_name || 'Member'}
                </Text>
            )}
            <Text style={[
                styles.messageText,
                isMe ? { color: '#FFF' } : { color: colors.text }
            ]}>{item.content}</Text>
            <Text style={[
                styles.timeText,
                { color: isMe ? 'rgba(255,255,255,0.7)' : colors.subtext }
            ]}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
        </View>
      );
  };

  if (loading) {
      return (
          <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator color={colors.primary} />
          </View>
      );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Image 
            source={{ uri: circleImage || 'https://via.placeholder.com/100' }} 
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#EEE' }} 
        />

        <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerName, { color: colors.text }]}>{circleName}</Text>
            <Text style={styles.headerStatus}>{memberCount} members</Text>
        </View>
        <TouchableOpacity>
          <Feather name="more-vertical" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {!isInternetReachable && (
          <View style={{ backgroundColor: '#F59E0B', padding: 8, alignItems: 'center' }}>
              <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>You are offline. Messages will not send.</Text>
          </View>
      )}

      <FlatList
        data={messages}
        keyExtractor={item => item.$id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        inverted={true} 
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder="Message..."
            placeholderTextColor={colors.subtext}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, { backgroundColor: colors.primary, opacity: !inputText.trim() ? 0.5 : 1 }]} 
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Feather name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 8, marginRight: 4 },
  headerTitleContainer: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '700' },
  headerStatus: { fontSize: 12, color: '#10B981', fontWeight: '500' },
  listContent: { padding: 16, paddingBottom: 20 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, gap: 8 },
  msgAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#DDD' },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  myBubble: {
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 15, lineHeight: 20 },
  timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 30, 
    borderTopWidth: 1,
    gap: 8
  },
  input: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
    borderWidth: 1,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
