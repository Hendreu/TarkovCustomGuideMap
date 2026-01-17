import fs from 'fs';
import path from 'path';

// Pin types
export interface PinData {
  id: string;
  map_id: string;
  type: 'loot' | 'boss' | 'extract' | 'quest' | 'quest_item';
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
  
  // Quest-specific
  quest_giver?: string;
  objective?: string;
  
  // Quest Item-specific
  item_name?: string;
  needed_for?: string;
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

// Local file paths
const DATA_DIR = path.join(process.cwd(), 'data');
const PINS_FILE = path.join(DATA_DIR, 'pins.json');
const KEYS_FILE = path.join(DATA_DIR, 'keys.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Read functions
async function readPins(): Promise<PinData[]> {
  try {
    if (!fs.existsSync(PINS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(PINS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading pins:', error);
    return [];
  }
}

async function readKeys(): Promise<KeyData[]> {
  try {
    if (!fs.existsSync(KEYS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(KEYS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading keys:', error);
    return [];
  }
}

// Write functions
async function writePins(pins: PinData[]): Promise<void> {
  fs.writeFileSync(PINS_FILE, JSON.stringify(pins, null, 2), 'utf-8');
}

async function writeKeys(keys: KeyData[]): Promise<void> {
  fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2), 'utf-8');
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
