import db from './db';

export interface Pin {
  id: string;
  map_id: string;
  type: 'loot' | 'boss' | 'extract';
  name: string;
  x: number;
  y: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface LootPin extends Pin {
  loot_type: 'weapon' | 'medical' | 'tech' | 'valuables' | 'food';
  quality: 'high' | 'medium' | 'low';
}

export interface BossPin extends Pin {
  boss_name: string;
  spawn_chance: number;
  guards: number;
}

export interface ExtractPin extends Pin {
  requirements?: string;
  always_available: boolean;
  pmc: boolean;
  scav_only: boolean;
}

// Get all pins for a map
export function getPinsByMap(mapId: string): any[] {
  const pins = db.prepare(`
    SELECT * FROM pins WHERE map_id = ?
  `).all(mapId) as Pin[];

  return pins.map(pin => {
    let pinData: any = { ...pin };

    if (pin.type === 'loot') {
      const lootData = db.prepare('SELECT * FROM loot_pins WHERE pin_id = ?').get(pin.id);
      if (lootData) {
        pinData = { ...pinData, ...lootData };
      }
    } else if (pin.type === 'boss') {
      const bossData = db.prepare('SELECT * FROM boss_pins WHERE pin_id = ?').get(pin.id);
      if (bossData) {
        pinData = { ...pinData, ...bossData, bossName: (bossData as any)?.boss_name };
      }
    } else if (pin.type === 'extract') {
      const extractData = db.prepare('SELECT * FROM extract_pins WHERE pin_id = ?').get(pin.id) as any;
      if (extractData) {
        pinData = { 
          ...pinData, 
          ...extractData,
          always: extractData?.always_available === 1,
          pmc: extractData?.pmc === 1,
          scavOnly: extractData?.scav_only === 1
        };
      }
    }

    return pinData;
  });
}

// Create a new pin
export function createPin(pinData: {
  id: string;
  map_id: string;
  type: 'loot' | 'boss' | 'extract';
  name: string;
  x: number;
  y: number;
  description?: string;
  // Type-specific data
  loot_type?: string;
  quality?: string;
  boss_name?: string;
  spawn_chance?: number;
  guards?: number;
  requirements?: string;
  always_available?: boolean;
  pmc?: boolean;
  scav_only?: boolean;
}) {
  const transaction = db.transaction(() => {
    // Insert main pin
    db.prepare(`
      INSERT INTO pins (id, map_id, type, name, x, y, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      pinData.id,
      pinData.map_id,
      pinData.type,
      pinData.name,
      pinData.x,
      pinData.y,
      pinData.description || null
    );

    // Insert type-specific data
    if (pinData.type === 'loot') {
      db.prepare(`
        INSERT INTO loot_pins (pin_id, loot_type, quality)
        VALUES (?, ?, ?)
      `).run(pinData.id, pinData.loot_type, pinData.quality);
    } else if (pinData.type === 'boss') {
      db.prepare(`
        INSERT INTO boss_pins (pin_id, boss_name, spawn_chance, guards)
        VALUES (?, ?, ?, ?)
      `).run(pinData.id, pinData.boss_name, pinData.spawn_chance, pinData.guards || 0);
    } else if (pinData.type === 'extract') {
      db.prepare(`
        INSERT INTO extract_pins (pin_id, requirements, always_available, pmc, scav_only)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        pinData.id,
        pinData.requirements || null,
        pinData.always_available ? 1 : 0,
        pinData.pmc ? 1 : 0,
        pinData.scav_only ? 1 : 0
      );
    }
  });

  transaction();
  return pinData.id;
}

// Update a pin
export function updatePin(pinId: string, pinData: {
  name?: string;
  x?: number;
  y?: number;
  description?: string;
  // Type-specific data
  loot_type?: string;
  quality?: string;
  boss_name?: string;
  spawn_chance?: number;
  guards?: number;
  requirements?: string;
  always_available?: boolean;
  pmc?: boolean;
  scav_only?: boolean;
}) {
  const transaction = db.transaction(() => {
    // Get the pin type first
    const pin = db.prepare('SELECT type FROM pins WHERE id = ?').get(pinId) as { type: string } | undefined;
    
    if (!pin) {
      throw new Error('Pin not found');
    }

    // Update main pin table
    const mainUpdates: string[] = [];
    const mainValues: any[] = [];

    if (pinData.name !== undefined) {
      mainUpdates.push('name = ?');
      mainValues.push(pinData.name);
    }
    if (pinData.x !== undefined) {
      mainUpdates.push('x = ?');
      mainValues.push(pinData.x);
    }
    if (pinData.y !== undefined) {
      mainUpdates.push('y = ?');
      mainValues.push(pinData.y);
    }
    if (pinData.description !== undefined) {
      mainUpdates.push('description = ?');
      mainValues.push(pinData.description);
    }

    if (mainUpdates.length > 0) {
      mainUpdates.push('updated_at = CURRENT_TIMESTAMP');
      mainValues.push(pinId);
      db.prepare(`UPDATE pins SET ${mainUpdates.join(', ')} WHERE id = ?`).run(...mainValues);
    }

    // Update type-specific tables
    if (pin.type === 'loot') {
      const lootUpdates: string[] = [];
      const lootValues: any[] = [];

      if (pinData.loot_type !== undefined) {
        lootUpdates.push('loot_type = ?');
        lootValues.push(pinData.loot_type);
      }
      if (pinData.quality !== undefined) {
        lootUpdates.push('quality = ?');
        lootValues.push(pinData.quality);
      }

      if (lootUpdates.length > 0) {
        lootValues.push(pinId);
        db.prepare(`UPDATE loot_pins SET ${lootUpdates.join(', ')} WHERE pin_id = ?`).run(...lootValues);
      }
    } else if (pin.type === 'boss') {
      const bossUpdates: string[] = [];
      const bossValues: any[] = [];

      if (pinData.boss_name !== undefined) {
        bossUpdates.push('boss_name = ?');
        bossValues.push(pinData.boss_name);
      }
      if (pinData.spawn_chance !== undefined) {
        bossUpdates.push('spawn_chance = ?');
        bossValues.push(pinData.spawn_chance);
      }
      if (pinData.guards !== undefined) {
        bossUpdates.push('guards = ?');
        bossValues.push(pinData.guards);
      }

      if (bossUpdates.length > 0) {
        bossValues.push(pinId);
        db.prepare(`UPDATE boss_pins SET ${bossUpdates.join(', ')} WHERE pin_id = ?`).run(...bossValues);
      }
    } else if (pin.type === 'extract') {
      const extractUpdates: string[] = [];
      const extractValues: any[] = [];

      if (pinData.requirements !== undefined) {
        extractUpdates.push('requirements = ?');
        extractValues.push(pinData.requirements);
      }
      if (pinData.always_available !== undefined) {
        extractUpdates.push('always_available = ?');
        extractValues.push(pinData.always_available ? 1 : 0);
      }
      if (pinData.pmc !== undefined) {
        extractUpdates.push('pmc = ?');
        extractValues.push(pinData.pmc ? 1 : 0);
      }
      if (pinData.scav_only !== undefined) {
        extractUpdates.push('scav_only = ?');
        extractValues.push(pinData.scav_only ? 1 : 0);
      }

      if (extractUpdates.length > 0) {
        extractValues.push(pinId);
        db.prepare(`UPDATE extract_pins SET ${extractUpdates.join(', ')} WHERE pin_id = ?`).run(...extractValues);
      }
    }
  });

  transaction();
}

// Delete a pin
export function deletePin(pinId: string) {
  db.prepare('DELETE FROM pins WHERE id = ?').run(pinId);
}

// Get all pins (for admin)
export function getAllPins() {
  const pins = db.prepare('SELECT * FROM pins ORDER BY map_id, type, name').all() as Pin[];
  
  return pins.map(pin => {
    let pinData: any = { ...pin };

    if (pin.type === 'loot') {
      const lootData = db.prepare('SELECT * FROM loot_pins WHERE pin_id = ?').get(pin.id);
      if (lootData) {
        pinData = { ...pinData, ...lootData };
      }
    } else if (pin.type === 'boss') {
      const bossData = db.prepare('SELECT * FROM boss_pins WHERE pin_id = ?').get(pin.id);
      if (bossData) {
        pinData = { ...pinData, ...bossData };
      }
    } else if (pin.type === 'extract') {
      const extractData = db.prepare('SELECT * FROM extract_pins WHERE pin_id = ?').get(pin.id);
      if (extractData) {
        pinData = { ...pinData, ...extractData };
      }
    }

    return pinData;
  });
}

// ===== KEY MANAGEMENT FUNCTIONS =====

export interface KeyData {
  id: string;
  map_id: string;
  name: string;
  location: string;
  uses: number; // -1 for unlimited
  worth: 'high' | 'medium' | 'low';
  unlocks: string;
  x?: number;
  y?: number;
  created_at?: string;
  updated_at?: string;
}

// Get all keys for a map
export function getKeysByMap(mapId: string): KeyData[] {
  return db.prepare(`
    SELECT * FROM keys WHERE map_id = ? ORDER BY worth DESC, name
  `).all(mapId) as KeyData[];
}

// Get all keys (for admin)
export function getAllKeys(): KeyData[] {
  return db.prepare('SELECT * FROM keys ORDER BY map_id, name').all() as KeyData[];
}

// Create a new key
export function createKey(keyData: {
  id: string;
  map_id: string;
  name: string;
  location: string;
  uses: number;
  worth: 'high' | 'medium' | 'low';
  unlocks: string;
  x?: number;
  y?: number;
}) {
  db.prepare(`
    INSERT INTO keys (id, map_id, name, location, uses, worth, unlocks, x, y)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    keyData.id,
    keyData.map_id,
    keyData.name,
    keyData.location,
    keyData.uses,
    keyData.worth,
    keyData.unlocks,
    keyData.x || null,
    keyData.y || null
  );
  
  return keyData.id;
}

// Update a key
export function updateKey(keyId: string, keyData: {
  name?: string;
  location?: string;
  uses?: number;
  worth?: 'high' | 'medium' | 'low';
  unlocks?: string;
  x?: number;
  y?: number;
}) {
  const updates: string[] = [];
  const values: any[] = [];

  if (keyData.name !== undefined) {
    updates.push('name = ?');
    values.push(keyData.name);
  }
  if (keyData.location !== undefined) {
    updates.push('location = ?');
    values.push(keyData.location);
  }
  if (keyData.uses !== undefined) {
    updates.push('uses = ?');
    values.push(keyData.uses);
  }
  if (keyData.worth !== undefined) {
    updates.push('worth = ?');
    values.push(keyData.worth);
  }
  if (keyData.unlocks !== undefined) {
    updates.push('unlocks = ?');
    values.push(keyData.unlocks);
  }
  if (keyData.x !== undefined) {
    updates.push('x = ?');
    values.push(keyData.x);
  }
  if (keyData.y !== undefined) {
    updates.push('y = ?');
    values.push(keyData.y);
  }

  if (updates.length === 0) return;

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(keyId);

  db.prepare(`
    UPDATE keys SET ${updates.join(', ')} WHERE id = ?
  `).run(...values);
}

// Delete a key
export function deleteKey(keyId: string) {
  db.prepare('DELETE FROM keys WHERE id = ?').run(keyId);
}
