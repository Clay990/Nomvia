import React, { useState } from 'react';
import { Image, ImageProps, View, ActivityIndicator, StyleSheet, ImageStyle, StyleProp } from 'react-native';

interface SafeImageProps extends ImageProps {
  style?: StyleProp<ImageStyle>;
  fallbackSource?: any;
}

const SafeImage: React.FC<SafeImageProps> = ({ source, style, fallbackSource, ...props }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoadStart = () => setLoading(true);
  const handleLoadEnd = () => setLoading(false);
  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const imageSource = error ? (fallbackSource || require('../assets/images/icon.png')) : source;

  return (
    <View style={[styles.container, style]}>
      <Image
        {...props}
        source={imageSource}
        style={[StyleSheet.absoluteFill]}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#E5E7EB', 
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default SafeImage;
