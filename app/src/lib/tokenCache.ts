import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// expo-secure-store isn't available on web; Clerk's browser session handles
// persistence itself there, so the cache is a no-op on that platform.
export const tokenCache =
  Platform.OS === "web"
    ? undefined
    : {
        async getToken(key: string) {
          try {
            return await SecureStore.getItemAsync(key);
          } catch {
            return null;
          }
        },
        async saveToken(key: string, value: string) {
          try {
            await SecureStore.setItemAsync(key, value);
          } catch {
            // ignore
          }
        },
      };
