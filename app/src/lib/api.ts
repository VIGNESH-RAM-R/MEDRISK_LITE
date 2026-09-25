import { useAuth } from "@clerk/clerk-expo";
import { useCallback, useMemo } from "react";
import type { Component } from "./constants";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

export type FailureMode = {
  id: string;
  componentId: string;
  mode: string;
  effect: string;
  cause: string;
  standard: string;
  s: number;
  o: number;
  d: number;
  mitigation: string;
  rpn: number;
  classification: "Acceptable" | "ALARP" | "Unacceptable";
  createdAt: string;
  updatedAt: string;
};

export type ComplianceClause = {
  id: string;
  clause: string;
  title: string;
  mapped: string;
  status: "complete" | "partial" | "pending";
  evidence: { id: string; fileName: string; fileUrl: string }[];
};

export type WorkspaceInfo = {
  id: string;
  name: string;
  alarpFrom: number;
  unacceptableFrom: number;
  chatScope: "redirect" | "refuse";
  sheathApplied: boolean;
  chatModel: string;
  components: Component[];
  aiSuggestions: Record<string, string[]>;
  onboardingCompleted: boolean;
};

export type AuditLogEntry = {
  id: string;
  text: string;
  createdAt: string;
  user: { name: string | null; email: string };
};

export type Snapshot = {
  id: string;
  label: string;
  createdAt: string;
  statsJson: {
    avg: number;
    bands: { Acceptable: number; ALARP: number; Unacceptable: number };
    count: number;
    compScore: number;
  };
};

export type ChatMessage = { role: "user" | "assistant"; text: string };

export type SensorReading = {
  id: string;
  sensorType: string;
  value: number;
  thresholdBreached: boolean;
  relatedFailureModeId: string | null;
  createdAt: string;
};

export type SuggestedFailureMode = { mode: string; rationale: string };
export type SuggestFailureModesResponse = {
  source: "ai" | "fallback";
  suggestions: SuggestedFailureMode[];
  error?: string;
};
export type DraftMitigationResponse = { mitigation: string };
export type SuggestScoresResponse = {
  s: number;
  o: number;
  d: number;
  rationale: { s: string; o: string; d: string };
};

export function useApiClient() {
  const { getToken } = useAuth();

  const authHeader = useCallback(async (): Promise<Record<string, string>> => {
    const token = await getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [getToken]);

  const request = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const headers = await authHeader();
      const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...headers,
          ...(options.headers || {}),
        },
      });
      if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
          const body = await res.json();
          if (body?.error) message = body.error;
        } catch {
          // ignore
        }
        throw new Error(message);
      }
      if (res.status === 204) return null;
      return res.json();
    },
    [authHeader]
  );

  const upload = useCallback(
    async (path: string, form: FormData) => {
      const headers = await authHeader();
      const res = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers,
        body: form,
      });
      if (!res.ok) {
        let message = `Upload failed (${res.status})`;
        try {
          const body = await res.json();
          if (body?.error) message = body.error;
        } catch {
          // ignore
        }
        throw new Error(message);
      }
      return res.json();
    },
    [authHeader]
  );

  return useMemo(
    () => ({
      apiUrl: API_URL,

      getWorkspace: (): Promise<WorkspaceInfo> => request("/api/workspace"),
      updateWorkspace: (data: Partial<WorkspaceInfo>) =>
        request("/api/workspace", { method: "PATCH", body: JSON.stringify(data) }),
      getAuditLog: (): Promise<AuditLogEntry[]> => request("/api/workspace/audit-log"),
      exportWorkspace: (): Promise<any> => request("/api/workspace/export"),
      importWorkspace: (data: { failureModes: any[]; compliance: any[] }) =>
        request("/api/workspace/import", { method: "POST", body: JSON.stringify(data) }),
      resetWorkspace: () => request("/api/workspace/reset", { method: "POST" }),

      listFailureModes: (): Promise<FailureMode[]> => request("/api/failure-modes"),
      createFailureMode: (data: Partial<FailureMode>): Promise<FailureMode> =>
        request("/api/failure-modes", { method: "POST", body: JSON.stringify(data) }),
      updateFailureMode: (id: string, data: Partial<FailureMode>): Promise<FailureMode> =>
        request(`/api/failure-modes/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
      deleteFailureMode: (id: string) =>
        request(`/api/failure-modes/${id}`, { method: "DELETE" }),
      suggestFailureModes: (componentId: string): Promise<SuggestFailureModesResponse> =>
        request("/api/failure-modes/suggest", { method: "POST", body: JSON.stringify({ componentId }) }),
      draftMitigation: (data: {
        componentId: string;
        mode: string;
        effect?: string;
        cause?: string;
      }): Promise<DraftMitigationResponse> =>
        request("/api/failure-modes/draft-mitigation", { method: "POST", body: JSON.stringify(data) }),
      suggestScores: (data: {
        componentId: string;
        mode: string;
        effect?: string;
        cause?: string;
      }): Promise<SuggestScoresResponse> =>
        request("/api/failure-modes/suggest-scores", { method: "POST", body: JSON.stringify(data) }),

      listCompliance: (): Promise<ComplianceClause[]> => request("/api/compliance"),
      updateComplianceStatus: (id: string, status: string) =>
        request(`/api/compliance/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
      uploadEvidence: (clauseId: string, form: FormData) =>
        upload(`/api/compliance/${clauseId}/evidence/upload`, form),
      deleteEvidence: (clauseId: string, evidenceId: string) =>
        request(`/api/compliance/${clauseId}/evidence/${evidenceId}`, { method: "DELETE" }),

      listSnapshots: (): Promise<Snapshot[]> => request("/api/snapshots"),
      createSnapshot: (label: string): Promise<Snapshot> =>
        request("/api/snapshots", { method: "POST", body: JSON.stringify({ label }) }),
      deleteSnapshot: (id: string) => request(`/api/snapshots/${id}`, { method: "DELETE" }),

      submitOnboarding: (data: { company?: string; errors?: string; question?: string }) =>
        request("/api/onboarding", { method: "POST", body: JSON.stringify(data) }),

      sendChatMessage: (
        message: string,
        history: ChatMessage[],
        language?: string
      ): Promise<{ reply: string; mode: string }> =>
        request("/api/chat", { method: "POST", body: JSON.stringify({ message, history, language }) }),

      getLatestSensorReadings: (): Promise<SensorReading[]> => request("/api/hardware/readings/latest"),
    }),
    [request, upload]
  );
}
