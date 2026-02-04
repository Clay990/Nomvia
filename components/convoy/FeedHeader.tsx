import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import SearchBar from './SearchBar';
import StoriesSection from './StoriesSection';

interface FeedHeaderProps {
    showSearch: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onSearchSubmit: () => void;
    refreshKey: number;
    filterType: 'all' | 'trending' | 'latest';
    setFilterType: (type: 'all' | 'trending' | 'latest') => void;
}

const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'trending', label: 'Trending' },
    { id: 'latest', label: 'Latest' },
] as const;

export default function FeedHeader({ 
    showSearch, 
    searchQuery, 
    setSearchQuery, 
    onSearchSubmit,
    refreshKey,
    filterType,
    setFilterType
}: FeedHeaderProps) {
    const { colors } = useTheme();

    return (
        <View style={{ backgroundColor: colors.background }}>
            {showSearch && (
                <SearchBar 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onSubmit={onSearchSubmit}
                />
            )}
            <StoriesSection refreshKey={refreshKey} />
            
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.catContainer}
            >
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        onPress={() => setFilterType(cat.id)}
                        style={[
                            styles.catItem,
                            { 
                                backgroundColor: filterType === cat.id ? colors.text : colors.card,
                                borderColor: colors.border
                            }
                        ]}
                    >
                        <Text style={[
                            styles.catText, 
                            { color: filterType === cat.id ? colors.background : colors.subtext }
                        ]}>
                            {cat.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    catContainer: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 8
    },
    catItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    catText: {
        fontSize: 13,
        fontWeight: '600'
    }
});
