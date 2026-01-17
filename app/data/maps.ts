import { TarkovMap } from '../types/map';

export const MAPS: TarkovMap[] = [
  {
    id: 'customs',
    name: 'Customs',
    description: 'Classic map with heavy PvP and important quests',
    image: '/maps/Customs.png',
    lootLocations: [],
    bossSpawns: [],
    extractions: [],
    keys: [],
  },
  {
    id: 'woods',
    name: 'Woods',
    description: 'Large forested map with snipers and Shturman',
    image: '/maps/Woods.png',
    lootLocations: [],
    bossSpawns: [],
    extractions: [],
    keys: [],
  },
  {
    id: 'interchange',
    name: 'Interchange',
    description: 'Massive shopping mall with tech loot',
    image: '/maps/Interchange.png',
    lootLocations: [],
    bossSpawns: [],
    extractions: [],
    keys: [],
  },
  {
    id: 'shoreline',
    name: 'Shoreline',
    description: 'Luxury resort with quests and Sanitar',
    image: '/maps/Shoreline.png',
    lootLocations: [],
    bossSpawns: [],
    extractions: [],
    keys: [],
  },
];

export const getMapById = (id: string): TarkovMap | undefined => {
  return MAPS.find((map) => map.id === id);
};
