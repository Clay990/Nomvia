import { Client, Account, Databases } from 'react-native-appwrite';

const client = new Client();

client
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT) 
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID) 
    .setPlatform('com.nomvia.app'); 

export const account = new Account(client);
export const databases = new Databases(client);
