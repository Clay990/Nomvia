import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, TouchableWithoutFeedback, Dimensions, Platform } from 'react-native';
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';

interface PostOptionsModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (option: 'share' | 'report' | 'block') => void;
}

const { height } = Dimensions.get('window');

export default function PostOptionsModal({ visible, onClose, onSelect }: PostOptionsModalProps) {
    const { colors, isDark } = useTheme();
    const slideAnim = useRef(new Animated.Value(height)).current;
    const [showModal, setShowModal] = useState(visible);

    useEffect(() => {
        if (visible) {
            setShowModal(true);
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                damping: 20,
                stiffness: 90
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 250,
                useNativeDriver: true
            }).start(() => setShowModal(false));
        }
    }, [visible]);

    if (!showModal) return null;

    const handleOption = (option: 'share' | 'report' | 'block') => {
        Haptics.selectionAsync();
        onSelect(option);
    };

    return (
        <Modal
            transparent
            visible={showModal}
            onRequestClose={onClose}
            animationType="none"
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    {Platform.OS === 'ios' && (
                        <BlurView 
                            intensity={20} 
                            style={StyleSheet.absoluteFill} 
                            tint={isDark ? 'dark' : 'light'}
                        />
                    )}
                    {Platform.OS !== 'ios' && <View style={[styles.dimmer, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />}
                </View>
            </TouchableWithoutFeedback>

            <Animated.View 
                style={[
                    styles.sheet, 
                    { 
                        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                        transform: [{ translateY: slideAnim }],
                        paddingBottom: 40 
                    }
                ]}
            >
                <View style={styles.handleContainer}>
                    <View style={[styles.handle, { backgroundColor: colors.border }]} />
                </View>

                <Text style={[styles.headerText, { color: colors.subtext }]}>Post Options</Text>

                <TouchableOpacity 
                    style={[styles.optionItem, { borderBottomColor: colors.border }]} 
                    onPress={() => handleOption('share')}
                >
                    <View style={[styles.iconCircle, { backgroundColor: colors.background }]}>
                        <Feather name="share" size={20} color={colors.text} />
                    </View>
                    <Text style={[styles.optionText, { color: colors.text }]}>Share Post</Text>
                    <Feather name="chevron-right" size={16} color={colors.subtext} style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.optionItem, { borderBottomColor: colors.border }]} 
                    onPress={() => handleOption('report')}
                >
                     <View style={[styles.iconCircle, { backgroundColor: colors.danger + '15' }]}>
                        <Feather name="flag" size={20} color={colors.danger} />
                    </View>
                    <Text style={[styles.optionText, { color: colors.danger }]}>Report Content</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.optionItem} 
                    onPress={() => handleOption('block')}
                >
                     <View style={[styles.iconCircle, { backgroundColor: colors.background }]}>
                        <Feather name="slash" size={20} color={colors.subtext} />
                    </View>
                    <Text style={[styles.optionText, { color: colors.text }]}>Block User</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.cancelButton, { backgroundColor: colors.background }]} 
                    onPress={onClose}
                >
                    <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
    },
    dimmer: {
        ...StyleSheet.absoluteFillObject,
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    handleContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    headerText: {
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        gap: 16,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        marginTop: 10,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '700',
    }
});
