import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import * as Sentry from '@sentry/react-native';
import Toast from 'react-native-toast-message';

const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '';

const ENTITLEMENT_ID = 'Nomvia Pro';

interface RevenueCatContextType {
  isPro: boolean;
  customerInfo: CustomerInfo | null;
  currentOffering: PurchasesPackage[] | null;
  restorePurchases: () => Promise<void>;
  presentPaywall: () => Promise<boolean>; 
  presentCustomerCenter: () => Promise<void>;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined);

export function RevenueCatProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [currentOffering, setCurrentOffering] = useState<PurchasesPackage[] | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initRevenueCat();
  }, []);

  const initRevenueCat = async () => {
    try {
      if (Platform.OS === 'android') {
        await Purchases.configure({ apiKey: API_KEY });
      } else {
        await Purchases.configure({ apiKey: API_KEY });
      }
      setIsInitialized(true);

      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      checkEntitlements(info);
      try {
        const offerings = await Purchases.getOfferings();
        const offering = offerings.all['nomvia'] || offerings.current;
        
        if (!offering) {
             Sentry.captureMessage("RevenueCat: No Offerings Found in Production", "warning");
        }

        if (offering && offering.availablePackages.length > 0) {
          setCurrentOffering(offering.availablePackages);
        }
      } catch (e) {
        console.error("Error fetching offerings", e);
        Sentry.captureException(e, { tags: { section: "revenuecat_fetch_error" } });
      }

    } catch (e) {
      console.warn("RevenueCat init error: Native module might be missing. If you are in Expo Go, this is expected. You need a Development Build for RevenueCat.", e);
      Sentry.captureException(e, { tags: { section: "revenuecat_init_error" } });
    }
  };

  const checkEntitlements = (info: CustomerInfo) => {
    if (typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined") {
      setIsPro(true);
    } else {
      setIsPro(false);
    }
  };

  const restorePurchases = async () => {
    if (!isInitialized) {
        Toast.show({
            type: 'error',
            text1: 'Not Available',
            text2: 'Billing is not initialized. Please ensure you are running a Development Build.'
        });
        return;
    }
    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      checkEntitlements(info);
      if (typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined") {
        Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Your purchases have been restored.'
        });
      } else {
        Toast.show({
            type: 'info',
            text1: 'Notice',
            text2: 'No active subscriptions found to restore.'
        });
      }
    } catch (e: any) {
      Toast.show({
          type: 'error',
          text1: 'Error',
          text2: e.message
      });
      Sentry.captureException(e, { tags: { section: "revenuecat_restore_error" } });
    }
  };

  const presentPaywall = async (): Promise<boolean> => {
    if (!isInitialized) {
        Toast.show({
            type: 'error',
            text1: 'Not Available',
            text2: 'Billing is not initialized. Please ensure you are running a Development Build.'
        });
        return false;
    }
    try {
      const offerings = await Purchases.getOfferings();
      const offering = offerings.all['nomvia'] || offerings.current;

      const paywallResult = await RevenueCatUI.presentPaywall({
        displayCloseButton: true,
        offering: offering || undefined
      });

      if (paywallResult === PAYWALL_RESULT.PURCHASED || paywallResult === PAYWALL_RESULT.RESTORED) {
          const info = await Purchases.getCustomerInfo();
          setCustomerInfo(info);
          checkEntitlements(info);
          return true;
      }
      return false;
    } catch (e) {
      console.error("Paywall error", e);
      Sentry.captureException(e, { tags: { section: "revenuecat_paywall_error" } });
      return false;
    }
  };

  const presentCustomerCenter = async () => {
      if (!isInitialized) {
          Toast.show({
              type: 'error',
              text1: 'Not Available',
              text2: 'Billing is not initialized. Please ensure you are running a Development Build.'
          });
          return;
      }
      try {
          await RevenueCatUI.presentCustomerCenter();
      } catch(e) {
          console.error("Error presenting customer center", e);
          Sentry.captureException(e, { tags: { section: "revenuecat_customer_center_error" } });
      }
  }

  useEffect(() => {
    if (!isInitialized) return;
    
    const customerInfoUpdated = (info: CustomerInfo) => {
      setCustomerInfo(info);
      checkEntitlements(info);
    };
    
    Purchases.addCustomerInfoUpdateListener(customerInfoUpdated);

    return () => {
    };
  }, [isInitialized]);

  return (
    <RevenueCatContext.Provider value={{ 
      isPro, 
      customerInfo, 
      currentOffering, 
      restorePurchases, 
      presentPaywall,
      presentCustomerCenter 
    }}>
      {children}
    </RevenueCatContext.Provider>
  );
}

export const useRevenueCat = () => {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error('useRevenueCat must be used within a RevenueCatProvider');
  }
  return context;
};