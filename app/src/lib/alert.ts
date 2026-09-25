import { Alert, Platform } from "react-native";
import i18n from "../i18n";

// react-native-web's Alert.alert() is a total no-op (see
// react-native-web/src/exports/Alert/index.js) — every confirm dialog and
// error notification needs a web-compatible fallback since this app runs
// as a web build. Note: window.confirm's own Cancel/OK buttons are rendered
// by the browser and can't be relabeled — only title/message are translatable
// there. Alert.alert's buttons (native only) are translated via i18n below.

export function confirmAsync(title: string, message?: string): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(message ? `${title}\n\n${message}` : title));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: i18n.t("alerts.cancel"), style: "cancel", onPress: () => resolve(false) },
      { text: i18n.t("alerts.confirm"), style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}

export function notify(title: string, message?: string): void {
  if (Platform.OS === "web") {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}
