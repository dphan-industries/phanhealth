export type HeartPacket = {
  bpm: number;
  contact: "detected" | "not detected" | "not supported";
};
export function parseHeartRate(data: DataView): HeartPacket {
  if (data.byteLength < 2) throw new Error("Incomplete heart-rate packet.");
  const flags = data.getUint8(0);
  const wide = Boolean(flags & 1);
  if (wide && data.byteLength < 3)
    throw new Error("Incomplete 16-bit heart-rate packet.");
  const bpm = wide ? data.getUint16(1, true) : data.getUint8(1);
  if (bpm < 1 || bpm > 999)
    throw new Error("Sensor value cannot be represented by this prototype.");
  return {
    bpm,
    contact:
      flags & 4 ? (flags & 2 ? "detected" : "not detected") : "not supported",
  };
}
export type BLECharacteristic = EventTarget & {
  value?: DataView;
  startNotifications: () => Promise<BLECharacteristic>;
  stopNotifications: () => Promise<BLECharacteristic>;
};
export type BLEDevice = EventTarget & {
  name?: string;
  gatt?: {
    connected: boolean;
    connect: () => Promise<{
      getPrimaryService: (name: string) => Promise<{
        getCharacteristic: (name: string) => Promise<BLECharacteristic>;
      }>;
    }>;
    disconnect: () => void;
  };
};
export type BLENavigator = Navigator & {
  bluetooth?: {
    requestDevice: (options: {
      filters: { services: string[] }[];
    }) => Promise<BLEDevice>;
  };
};
export function parseBloodPressure(data: DataView) {
  if (data.byteLength < 7) throw new Error("Incomplete blood-pressure packet.");
  const float = (offset: number) => {
    const raw = data.getUint16(offset, true);
    const mantissa = raw & 0xfff;
    if (mantissa >= 0x7fe && mantissa <= 0x802)
      throw new Error("Invalid blood-pressure measurement.");
    const exponent = raw >> 12;
    return (
      (mantissa & 0x800 ? mantissa - 4096 : mantissa) *
      10 ** (exponent & 8 ? exponent - 16 : exponent)
    );
  };
  const factor = data.getUint8(0) & 1 ? 7.50062 : 1;
  const systolic = Math.round(float(1) * factor),
    diastolic = Math.round(float(3) * factor);
  if (systolic < 1 || systolic > 999 || diastolic < 1 || diastolic > 999)
    throw new Error("Sensor value cannot be represented by this prototype.");
  return { systolic, diastolic, convertedFromKpa: factor !== 1 };
}
