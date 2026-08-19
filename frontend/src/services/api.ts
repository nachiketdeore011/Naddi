/**
 * API client for the Nadi Diagnosis backend.
 */

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || "Request failed");
  }

  return res.json();
}

// --- Types ---

export interface Patient {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface PulseSession {
  id: string;
  patient_id: string;
  started_at: string;
  duration_sec: number | null;
  status: string;
}

export interface AnalysisResult {
  id: string;
  session_id: string;
  heart_rate: number | null;
  pulse_pattern: string | null;
  confidence: number | null;
  sp02: number | null;
  recommendations: string | null;
  analyzed_at: string;
}

export interface DevicesResponse {
  connected_count: number;
  devices: any[];
}

// --- Patient API ---

export async function getPatients(): Promise<Patient[]> {
  return request<Patient[]>("/patients/");
}

export async function getPatient(id: string): Promise<Patient> {
  return request<Patient>(`/patients/${id}/`);
}

export async function createPatient(data: {
  name: string;
  age?: number;
  gender?: string;
  phone?: string;
}): Promise<Patient> {
  return request<Patient>("/patients/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deletePatient(id: string): Promise<void> {
  await request(`/patients/${id}/`, { method: "DELETE" });
}

// --- Pulse Session API ---

export async function createSession(data: {
  patient_id: string;
  device_id?: string;
  sample_rate?: number;
}): Promise<PulseSession> {
  return request<PulseSession>("/pulse/session", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getSession(sessionId: string): Promise<PulseSession> {
  return request<PulseSession>(`/pulse/session/${sessionId}`);
}

export async function getPatientSessions(patientId: string): Promise<PulseSession[]> {
  return request<PulseSession[]>(`/pulse/sessions/${patientId}`);
}

// --- Analysis API ---

export async function analyzeSession(sessionId: string): Promise<AnalysisResult> {
  return request<AnalysisResult>(`/pulse/analyze/${sessionId}`, { method: "POST" });
}

export async function saveAnalysisResult(data: {
  session_id: string;
  heart_rate: number;
  pulse_pattern: string;
  confidence: number;
  sp02?: number;
  recommendations?: string;
}): Promise<AnalysisResult> {
  return request<AnalysisResult>("/pulse/save-analysis", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAnalysisResults(sessionId: string): Promise<AnalysisResult[]> {
  return request<AnalysisResult[]>(`/pulse/analysis/${sessionId}`);
}

// --- Device API ---

export async function getDevices(): Promise<DevicesResponse> {
  return request<DevicesResponse>("/devices/");
}

// --- Simulate API ---

export async function simulatePulse(patientId: string): Promise<any> {
  return request(`/pulse/simulate/${patientId}`, { method: "POST" });
}
