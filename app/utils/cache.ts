import * as FileSystem from 'expo-file-system/legacy';

const STORIES_CACHE_DIR = FileSystem.cacheDirectory + 'stories/';

async function ensureDirExists() {
    const dirInfo = await FileSystem.getInfoAsync(STORIES_CACHE_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(STORIES_CACHE_DIR, { intermediates: true });
    }
}

/**
 * Returns the local file URI if it exists.
 * If not, returns the remote URL and starts a background download.
 */
export const getStoryMedia = async (url: string, id: string): Promise<string> => {
    if (!url) return '';
    try {
        await ensureDirExists();
        // Simplified extension extraction - just take the last 3-4 chars if they look like an extension, otherwise default to .file
        // Or better, just use .mp4/.jpg based on assumed content or metadata if available. 
        // For now, let's just sanitize the id and use a generic extension if we can't guess.
        // Actually, we can just use the ID as the filename without extension if we don't care, 
        // but some players need it.
        // Let's rely on the ID + a hash of the URL to be safe.
        
        // Fix: The previous split logic was taking the whole path "io/v1/..." as extension.
        // We will just use ID. If we need extension, we can try to guess from URL but sanitize it.
        const filename = `${id}.media`; 
        const fileUri = STORIES_CACHE_DIR + filename;

        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
            console.log(`[Cache] Hit: ${filename}`);
            return fileUri;
        }

        // Cache Miss: Return remote URL for immediate streaming, but download for next time
        console.log(`[Cache] Miss: ${filename}, starting background download`);
        FileSystem.downloadAsync(url, fileUri)
            .then(({ uri }) => console.log(`[Cache] Downloaded: ${uri}`))
            .catch(e => console.log(`[Cache] Download failed: ${e}`));

        return url;
    } catch (error) {
        console.error("Cache error:", error);
        return url;
    }
};

export const prefetchStory = async (url: string, id: string) => {
    if (!url) return;
    try {
        await ensureDirExists();
        const filename = `${id}.media`;
        const fileUri = STORIES_CACHE_DIR + filename;

        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (!fileInfo.exists) {
            console.log(`[Cache] Prefetching: ${filename}`);
            FileSystem.downloadAsync(url, fileUri).catch(() => {});
        }
    } catch (e) {}
};