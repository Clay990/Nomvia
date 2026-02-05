import React, { createContext, useState, useEffect, useContext } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

interface LocationContextType {
  location: Location.LocationObject | null;
  address: Location.LocationGeocodedAddress | null;
  errorMsg: string | null;
  loading: boolean;
  refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType>({
  location: null,
  address: null,
  errorMsg: null,
  loading: true,
  refreshLocation: async () => {},
});

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<Location.LocationGeocodedAddress | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshLocation = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const cachedLoc = await AsyncStorage.getItem('last_location');
      const cachedAddr = await AsyncStorage.getItem('last_address');
      
      if (cachedLoc && !location) setLocation(JSON.parse(cachedLoc));
      if (cachedAddr && !address) setAddress(JSON.parse(cachedAddr));

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(loc);
      AsyncStorage.setItem('last_location', JSON.stringify(loc));

      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });
        
        if (addresses && addresses.length > 0) {
            setAddress(addresses[0]);
            AsyncStorage.setItem('last_address', JSON.stringify(addresses[0]));
        }
      } catch (e) {
        console.log("Reverse geocoding failed", e);
      }

    } catch (error) {
       console.log(error);
       setErrorMsg('Could not fetch location');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ location, address, errorMsg, loading, refreshLocation }}>
      {children}
    </LocationContext.Provider>
  );
};
