export interface PushDevice {
  id: string;
  label: string;
  createdAt: string;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
}

export interface PushStatus {
  publicKey: string;
  devices: PushDevice[];
}

export interface PushDeliveryResult {
  delivered: number;
  failed: number;
}
