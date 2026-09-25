import { useEffect, useState } from "react";
import { Modal, useWindowDimensions, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { OnboardingModal, isOnboardingDismissedLocally } from "../components/OnboardingModal";
import { Sidebar } from "../components/Sidebar";
import { useApiClient } from "../lib/api";
import type { ViewId } from "../lib/constants";
import { useTheme } from "../lib/theme";
import { useAppStore } from "../store/useAppStore";
import { LoadingScreen } from "../screens/LoadingScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { DeviceLibraryScreen } from "../screens/DeviceLibraryScreen";
import { WorkspaceScreen } from "../screens/WorkspaceScreen";
import { RiskRegisterScreen } from "../screens/RiskRegisterScreen";
import { AnalyticsScreen } from "../screens/AnalyticsScreen";
import { ComplianceScreen } from "../screens/ComplianceScreen";
import { AssistantScreen } from "../screens/AssistantScreen";
import { ReportGeneratorScreen } from "../screens/ReportGeneratorScreen";
import { SettingsScreen } from "../screens/SettingsScreen";

const SCREENS: Record<ViewId, React.ComponentType<{ navigate: (v: ViewId) => void }>> = {
  dashboard: DashboardScreen,
  library: DeviceLibraryScreen,
  workspace: WorkspaceScreen,
  register: RiskRegisterScreen,
  analytics: AnalyticsScreen,
  compliance: ComplianceScreen,
  assistant: AssistantScreen,
  report: ReportGeneratorScreen,
  settings: SettingsScreen,
};

const WIDE_BREAKPOINT = 900;

export function RootNavigator() {
  const api = useApiClient();
  const { loaded, error, loadAll, lastView, setLastView, workspace } = useAppStore();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(true);

  useEffect(() => {
    loadAll(api);
    isOnboardingDismissedLocally().then(setOnboardingDismissed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!loaded) {
    return <LoadingScreen error={error} onRetry={() => loadAll(api)} />;
  }

  const navigate = (v: ViewId) => {
    setLastView(v);
    setDrawerOpen(false);
  };

  const ActiveScreen = SCREENS[lastView];
  const showOnboarding = Boolean(workspace && !workspace.onboardingCompleted && !onboardingDismissed);

  return (
    <View style={{ flex: 1, flexDirection: "row", backgroundColor: colors.bg }}>
      {isWide && <Sidebar activeView={lastView} onSelect={navigate} />}

      {!isWide && (
        <Modal visible={drawerOpen} transparent animationType="fade" onRequestClose={() => setDrawerOpen(false)}>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <Sidebar activeView={lastView} onSelect={navigate} />
            <View
              style={{ flex: 1, backgroundColor: "rgba(0,0,0,.4)" }}
              onTouchEnd={() => setDrawerOpen(false)}
            />
          </View>
        </Modal>
      )}

      <View style={{ flex: 1, minWidth: 0 }}>
        <AppHeader view={lastView} showMenu={!isWide} onMenuPress={() => setDrawerOpen(true)} />
        <View style={{ flex: 1 }}>
          <ActiveScreen navigate={navigate} />
        </View>
      </View>

      <OnboardingModal
        visible={showOnboarding}
        onSubmit={async (data) => {
          await api.submitOnboarding(data);
          await loadAll(api);
        }}
        onSkip={() => setOnboardingDismissed(true)}
      />
    </View>
  );
}
