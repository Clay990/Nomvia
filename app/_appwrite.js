import { Client, Account, Databases, Storage } from 'react-native-appwrite';

export const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = '6973457f000e977ae601';
export const APPWRITE_DB_ID = 'nomvia_db';
export const APPWRITE_COLLECTION_USERS = 'users';
export const APPWRITE_COLLECTION_POSTS = 'posts';
export const APPWRITE_COLLECTION_MATCHES = 'matches';
export const APPWRITE_BUCKET_ID = 'nomvia_storage';

const client = new Client();

client
    .setEndpoint(APPWRITE_ENDPOINT) 
    .setProject(APPWRITE_PROJECT_ID) 
    .setPlatform('com.nomvia.app'); 

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);



