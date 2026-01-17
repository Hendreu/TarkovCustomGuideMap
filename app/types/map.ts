export interface MapLocation {
  id: string;
  x: number; // percentage position (0-100)
  y: number; // percentage position (0-100)
  name: string;
  description?: string;
}

export interface LootLocation extends MapLocation {
  type: 'weapon' | 'medical' | 'tech' | 'valuables' | 'food';
  quality: 'high' | 'medium' | 'low';
}

export interface BossSpawn extends MapLocation {
  bossName: string;
  spawnChance: number;
  guards?: number;
  image?: string;
}

export interface ExtractionPoint extends MapLocation {
  requirements?: string;
  always?: boolean;
  scavOnly?: boolean;
  pmc?: boolean;
}

export interface KeyInfo {
  id: string;
  name: string;
  location: string;
  uses: number | 'unlimited';
  worth: 'high' | 'medium' | 'low';
  unlocks: string;
  image?: string;
}

export interface TarkovMap {
  id: string;
  name: string;
  description: string;
  image: string;
  lootLocations: LootLocation[];
  bossSpawns: BossSpawn[];
  extractions: ExtractionPoint[];
  keys: KeyInfo[];
}
