import { kv } from '@vercel/kv';

// Pin types
export interface PinData {
  id: string;
  map_id: string;
  type: 'loot' | 'boss' | 'extract';
  name: string;
  x: number;
  y: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
  
  // Loot-specific
  loot_type?: 'weapon' | 'medical' | 'tech' | 'valuables' | 'food';
  quality?: 'high' | 'medium' | 'low';
  
  // Boss-specific
  boss_name?: string;
  spawn_chance?: number;
  guards?: number;
  
  // Extract-specific
  requirements?: string;
  always_available?: boolean;
  pmc?: boolean;
  scav_only?: boolean;
}

export interface KeyData {
  id: string;
  map_id: string;
  name: string;
  location: string;
  uses: number;
  worth: 'high' | 'medium' | 'low';
  unlocks: string;
  x?: number;
  y?: number;
  created_at?: string;
  updated_at?: string;
}

const PINS_KEY = 'tarkov:pins';
const KEYS_KEY = 'tarkov:keys';

// Read functions
async function readPins(): Promise<PinData[]> {
  try {
    const pins = await kv.get<PinData[]>(PINS_KEY);
    return pins || [];
  } catch (error) {
    console.error('Error reading pins:', error);
    return [];
  }
}

async function readKeys(): Promise<KeyData[]> {
  try {
    const keys = await kv.get<KeyData[]>(KEYS_KEY);
    return keys || [];
  } catch (error) {
    console.error('Error reading keys:', error);
    return [];
  }
}

// Write functions
async function writePins(pins: PinData[]): Promise<void> {
  await kv.set(PINS_KEY, pins);
}

async function writeKeys(keys: KeyData[]): Promise<void> {
  await kv.set(KEYS_KEY, keys);
}

// Pin operations
export async function getPinsByMap(mapId: string): Promise<PinData[]> {
  const pins = await readPins();
  return pins.filter(pin => pin.map_id === mapId);
}

export async function getAllPins(): Promise<PinData[]> {
  return await readPins();
}

export async function createPin(pinData: PinData): Promise<string> {
  const pins = await readPins();
  const now = new Date().toISOString();
  
  const newPin: PinData = {
    ...pinData,
    created_at: now,
    updated_at: now,
  };
  
  pins.push(newPin);
  await writePins(pins);
  
  return pinData.id;
}

export async function updatePin(id: string, updates: Partial<PinData>): Promise<boolean> {
  const pins = await readPins();
  const index = pins.findIndex(pin => pin.id === id);
  
  if (index === -1) return false;
  
  pins[index] = {
    ...pins[index],
    ...updates,
    id: pins[index].id,
    updated_at: new Date().toISOString(),
  };
  
  await writePins(pins);
  return true;
}

export async function deletePin(id: string): Promise<boolean> {
  const pins = await readPins();
  const filteredPins = pins.filter(pin => pin.id !== id);
  
  if (filteredPins.length === pins.length) return false;
  
  await writePins(filteredPins);
  return true;
}

// Key operations
export async function getKeysByMap(mapId: string): Promise<KeyData[]> {
  const keys = await readKeys();
  return keys.filter(key => key.map_id === mapId);
}

export async function getAllKeys(): Promise<KeyData[]> {
  return await readKeys();
}

export async function createKey(keyData: KeyData): Promise<string> {
  const keys = await readKeys();
  const now = new Date().toISOString();
  
  const newKey: KeyData = {
    ...keyData,
    created_at: now,
    updated_at: now,
  };
  
  keys.push(newKey);
  await writeKeys(keys);
  
  return keyData.id;
}

export async function updateKey(id: string, updates: Partial<KeyData>): Promise<boolean> {
  const keys = await readKeys();
  const index = keys.findIndex(key => key.id === id);
  
  if (index === -1) return false;
  
  keys[index] = {
    ...keys[index],
    ...updates,
    id: keys[index].id,
    updated_at: new Date().toISOString(),
  };
  
  await writeKeys(keys);
  return true;
}

export async function deleteKey(id: string): Promise<boolean> {
  const keys = await readKeys();
  const filteredKeys = keys.filter(key => key.id !== id);
  
  if (filteredKeys.length === keys.length) return false;
  
  await writeKeys(filteredKeys);
  return true;
}
