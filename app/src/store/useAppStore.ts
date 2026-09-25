import { create } from "zustand";
import i18n from "../i18n";
import type {
  AuditLogEntry,
  ComplianceClause,
  FailureMode,
  SensorReading,
  Snapshot,
  WorkspaceInfo,
} from "../lib/api";
import type { ViewId } from "../lib/constants";

type ApiClient = ReturnType<
  typeof import("../lib/api").useApiClient
>;

type AppState = {
  loaded: boolean;
  loading: boolean;
  error: string | null;

  lastView: ViewId;
  setLastView: (v: ViewId) => void;

  workspace: WorkspaceInfo | null;
  failureModes: FailureMode[];
  compliance: ComplianceClause[];
  auditLog: AuditLogEntry[];
  snapshots: Snapshot[];
  sensorReadings: SensorReading[];

  loadAll: (api: ApiClient) => Promise<void>;
  refreshSensorReadings: (api: ApiClient) => Promise<void>;

  addFailureMode: (
    api: ApiClient,
    data: Partial<FailureMode>
  ) => Promise<void>;
  updateFailureMode: (
    api: ApiClient,
    id: string,
    data: Partial<FailureMode>
  ) => Promise<void>;
  deleteFailureMode: (api: ApiClient, id: string) => Promise<void>;

  setComplianceStatus: (
    api: ApiClient,
    id: string,
    status: ComplianceClause["status"]
  ) => Promise<void>;

  addEvidence: (
    api: ApiClient,
    clauseId: string,
    form: FormData
  ) => Promise<void>;
  removeEvidence: (api: ApiClient, clauseId: string, evidenceId: string) => Promise<void>;

  updateSettings: (
    api: ApiClient,
    data: Partial<WorkspaceInfo>
  ) => Promise<void>;
  toggleSheath: (api: ApiClient) => Promise<void>;

  refreshAuditLog: (api: ApiClient) => Promise<void>;

  loadSnapshots: (api: ApiClient) => Promise<void>;
  saveSnapshot: (api: ApiClient, label: string) => Promise<void>;
  deleteSnapshot: (api: ApiClient, id: string) => Promise<void>;

  resetWorkspace: (api: ApiClient) => Promise<void>;
  importWorkspace: (api: ApiClient, data: { failureModes: any[]; compliance: any[] }) => Promise<void>;
};

export const useAppStore = create<AppState>((set, get) => ({
  loaded: false,
  loading: false,
  error: null,

  lastView: "dashboard",
  setLastView: (v) => set({ lastView: v }),

  workspace: null,
  failureModes: [],
  compliance: [],
  auditLog: [],
  snapshots: [],
  sensorReadings: [],

  loadAll: async (api) => {
    set({ loading: true, error: null });
    try {
      const [workspace, failureModes, compliance, auditLog, snapshots, sensorReadings] = await Promise.all([
        api.getWorkspace(),
        api.listFailureModes(),
        api.listCompliance(),
        api.getAuditLog(),
        api.listSnapshots(),
        api.getLatestSensorReadings(),
      ]);
      set({ workspace, failureModes, compliance, auditLog, snapshots, sensorReadings, loaded: true, loading: false });
    } catch (e: any) {
      set({ error: e.message || i18n.t("common.failedToLoad"), loading: false });
    }
  },

  refreshSensorReadings: async (api) => {
    const sensorReadings = await api.getLatestSensorReadings();
    set({ sensorReadings });
  },

  addFailureMode: async (api, data) => {
    const created = await api.createFailureMode(data);
    set({ failureModes: [...get().failureModes, created] });
    await get().refreshAuditLog(api);
  },

  updateFailureMode: async (api, id, data) => {
    const updated = await api.updateFailureMode(id, data);
    set({
      failureModes: get().failureModes.map((fm) => (fm.id === id ? updated : fm)),
    });
    await get().refreshAuditLog(api);
  },

  deleteFailureMode: async (api, id) => {
    await api.deleteFailureMode(id);
    set({ failureModes: get().failureModes.filter((fm) => fm.id !== id) });
    await get().refreshAuditLog(api);
  },

  setComplianceStatus: async (api, id, status) => {
    const updated = await api.updateComplianceStatus(id, status);
    set({
      compliance: get().compliance.map((c) => (c.id === id ? { ...c, ...updated } : c)),
    });
    await get().refreshAuditLog(api);
  },

  addEvidence: async (api, clauseId, form) => {
    const evidence = await api.uploadEvidence(clauseId, form);
    set({
      compliance: get().compliance.map((c) =>
        c.id === clauseId ? { ...c, evidence: [...c.evidence, evidence] } : c
      ),
    });
    await get().refreshAuditLog(api);
  },

  removeEvidence: async (api, clauseId, evidenceId) => {
    await api.deleteEvidence(clauseId, evidenceId);
    set({
      compliance: get().compliance.map((c) =>
        c.id === clauseId ? { ...c, evidence: c.evidence.filter((e) => e.id !== evidenceId) } : c
      ),
    });
    await get().refreshAuditLog(api);
  },

  updateSettings: async (api, data) => {
    const updated = await api.updateWorkspace(data);
    set({ workspace: { ...get().workspace!, ...updated } });
  },

  toggleSheath: async (api) => {
    const current = get().workspace;
    if (!current) return;
    const updated = await api.updateWorkspace({ sheathApplied: !current.sheathApplied });
    set({ workspace: { ...current, ...updated } });
  },

  refreshAuditLog: async (api) => {
    const auditLog = await api.getAuditLog();
    set({ auditLog });
  },

  loadSnapshots: async (api) => {
    const snapshots = await api.listSnapshots();
    set({ snapshots });
  },

  saveSnapshot: async (api, label) => {
    const snapshot = await api.createSnapshot(label);
    set({ snapshots: [snapshot, ...get().snapshots] });
    await get().refreshAuditLog(api);
  },

  deleteSnapshot: async (api, id) => {
    await api.deleteSnapshot(id);
    set({ snapshots: get().snapshots.filter((s) => s.id !== id) });
    await get().refreshAuditLog(api);
  },

  resetWorkspace: async (api) => {
    await api.resetWorkspace();
    await get().loadAll(api);
  },

  importWorkspace: async (api, data) => {
    await api.importWorkspace(data);
    await get().loadAll(api);
  },
}));
