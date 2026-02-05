import React, { createContext, useState, useEffect, useContext } from 'react';
import * as Network from 'expo-network';

interface NetworkContextType {
  isConnected: boolean;
  isInternetReachable: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
  isConnected: true,
  isInternetReachable: true,
});

export const useNetwork = () => useContext(NetworkContext);

export let globalNetworkState = {
    isConnected: true,
    isInternetReachable: true
};

export const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState({
    isConnected: true,
    isInternetReachable: true,
  });

  useEffect(() => {
    Network.getNetworkStateAsync().then(state => {
        const newState = {
            isConnected: state.isConnected ?? true,
            isInternetReachable: state.isInternetReachable ?? true,
        };
        setStatus(newState);
        globalNetworkState = newState;
    });
  }, []);

  return (
    <NetworkContext.Provider value={status}>
      {children}
    </NetworkContext.Provider>
  );
};
