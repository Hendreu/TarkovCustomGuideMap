'use client';

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { TarkovMap, LootLocation, BossSpawn, ExtractionPoint } from '../types/map';
import { MapPin, Skull, DoorOpen, Key, Target, Package } from 'lucide-react';
import { useState, useEffect } from 'react';

interface InteractiveMapProps {
  map: TarkovMap;
}

type MarkerType = 'loot' | 'boss' | 'extract' | 'key' | 'quest' | 'quest_item' | 'all';

export default function InteractiveMap({ map }: InteractiveMapProps) {
  const [activeFilter, setActiveFilter] = useState<MarkerType>('all');
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [customPins, setCustomPins] = useState<any[]>([]);
  const [customKeys, setCustomKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinSize, setPinSize] = useState<number>(1); // 0.5 to 2

  // Load custom pins and keys from API
  useEffect(() => {
    async function fetchData() {
      try {
        const [pinsResponse, keysResponse] = await Promise.all([
          fetch(`/api/pins/${map.id}`),
          fetch(`/api/keys/${map.id}`)
        ]);

        if (pinsResponse.ok) {
          const pinsData = await pinsResponse.json();
          setCustomPins(pinsData.pins || []);
        }

        if (keysResponse.ok) {
          const keysData = await keysResponse.json();
          // Only include keys that have map positions
          setCustomKeys((keysData.keys || []).filter((k: any) => k.x && k.y));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [map.id]);

  // Separate custom pins by type
  const customLootPins = customPins.filter(p => p.type === 'loot');
  const customBossPins = customPins.filter(p => p.type === 'boss');
  const customExtractPins = customPins.filter(p => p.type === 'extract');
  const customQuestPins = customPins.filter(p => p.type === 'quest');
  const customQuestItemPins = customPins.filter(p => p.type === 'quest_item');

  const allLootLocations = [...map.lootLocations, ...customLootPins];
  const allBossSpawns = [...map.bossSpawns, ...customBossPins];
  const allExtractions = [...map.extractions, ...customExtractPins];
  const allKeys = customKeys;
  const allQuests = customQuestPins;
  const allQuestItems = customQuestItemPins;

  const getMarkerColor = (type: MarkerType) => {
    switch (type) {
      case 'loot':
        return '#d4a94f'; // Dourado/Amarelo
      case 'boss':
        return '#c44f42'; // Vermelho
      case 'extract':
        return '#4ade80'; // Verde
      case 'key':
        return '#60a5fa'; // Azul
      case 'quest':
        return '#f59e42'; // Laranja
      case 'quest_item':
        return '#a855f7'; // Roxo
      default:
        return '#9fad7d';
    }
  };

  const shouldShowMarker = (type: MarkerType) => {
    return activeFilter === 'all' || activeFilter === type;
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Filter Controls */}
      <div className="flex gap-2 p-4 bg-[#1a1d1a] border-b border-[#4a5240] items-center justify-between">
        <div className="flex gap-2">
          <FilterButton
            active={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
            icon={<MapPin size={18} />}
            label="All"
          />
          <FilterButton
            active={activeFilter === 'loot'}
            onClick={() => setActiveFilter('loot')}
            icon={<MapPin size={18} />}
            label={`Places (${allLootLocations.length})`}
            color="#d4a94f"
          />
          <FilterButton
            active={activeFilter === 'boss'}
            onClick={() => setActiveFilter('boss')}
            icon={<Skull size={18} />}
            label={`Bosses (${allBossSpawns.length})`}
            color="#c44f42"
          />
          <FilterButton
            active={activeFilter === 'extract'}
            onClick={() => setActiveFilter('extract')}
            icon={<DoorOpen size={18} />}
            label={`Extracts (${allExtractions.length})`}
            color="#4ade80"
          />
          <FilterButton
            active={activeFilter === 'key'}
            onClick={() => setActiveFilter('key')}
            icon={<Key size={18} />}
            label={`Keys (${allKeys.length})`}
            color="#60a5fa"
          />
          <FilterButton
            active={activeFilter === 'quest'}
            onClick={() => setActiveFilter('quest')}
            icon={<Target size={18} />}
            label={`Quests (${allQuests.length})`}
            color="#f59e42"
          />
          <FilterButton
            active={activeFilter === 'quest_item'}
            onClick={() => setActiveFilter('quest_item')}
            icon={<Package size={18} />}
            label={`Items (${allQuestItems.length})`}
            color="#a855f7"
          />
        </div>
        
        {/* Pin Size Controls */}
        <div className="flex items-center gap-2">
          <span className="text-[#9fad7d] text-sm font-medium">Pin Size:</span>
          <button
            onClick={() => setPinSize(Math.max(0.5, pinSize - 0.25))}
            disabled={pinSize <= 0.5}
            className="px-3 py-1 bg-[#0a0a0a] text-[#9fad7d] rounded hover:bg-[#2a3025] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
          >
            −
          </button>
          <span className="text-[#e8e6e3] font-semibold min-w-[3rem] text-center">
            {Math.round(pinSize * 100)}%
          </span>
          <button
            onClick={() => setPinSize(Math.min(2, pinSize + 0.25))}
            disabled={pinSize >= 2}
            className="px-3 py-1 bg-[#0a0a0a] text-[#9fad7d] rounded hover:bg-[#2a3025] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={4}
          centerOnInit
          centerZoomedOut
        >
          <TransformComponent
            wrapperClass="w-full h-full flex items-center justify-center"
            contentClass="flex items-center justify-center"
          >
            <div 
              className="relative bg-[#2a3025]" 
              style={{ 
                width: `${map.width || 1573}px`, 
                height: `${map.height || 804}px` 
              }}
            >
              {/* Map Background */}
              <img 
                src={map.image} 
                alt={map.name}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Loot Markers */}
              {shouldShowMarker('loot') &&
                allLootLocations.map((location) => (
                  <Marker
                    key={location.id}
                    location={location}
                    color="#d4a94f"
                    icon={<MapPin size={16} />}
                    isSelected={selectedMarker === location.id}
                    onClick={() => setSelectedMarker(location.id)}
                    label={location.name}
                    pinSize={pinSize}
                  />
                ))}

              {/* Boss Markers */}
              {shouldShowMarker('boss') &&
                allBossSpawns.map((boss) => (
                  <Marker
                    key={boss.id}
                    location={boss}
                    color="#c44f42"
                    icon={<Skull size={16} />}
                    isSelected={selectedMarker === boss.id}
                    onClick={() => setSelectedMarker(boss.id)}
                    label={boss.name}
                    pinSize={pinSize}
                  />
                ))}

              {/* Extract Markers */}
              {shouldShowMarker('extract') &&
                allExtractions.map((extract) => (
                  <Marker
                    key={extract.id}
                    location={extract}
                    color="#4ade80"
                    icon={<DoorOpen size={16} />}
                    isSelected={selectedMarker === extract.id}
                    onClick={() => setSelectedMarker(extract.id)}
                    label={extract.name}
                    pinSize={pinSize}
                  />
                ))}

              {/* Key Markers */}
              {shouldShowMarker('key') &&
                allKeys.map((keyItem) => (
                  <Marker
                    key={keyItem.id}
                    location={keyItem}
                    color="#60a5fa"
                    icon={<Key size={16} />}
                    isSelected={selectedMarker === keyItem.id}
                    onClick={() => setSelectedMarker(keyItem.id)}
                    label={keyItem.name}
                    pinSize={pinSize}
                  />
                ))}

              {/* Quest Markers */}
              {shouldShowMarker('quest') &&
                allQuests.map((quest) => (
                  <Marker
                    key={quest.id}
                    location={quest}
                    color="#f59e42"
                    icon={<Target size={16} />}
                    isSelected={selectedMarker === quest.id}
                    onClick={() => setSelectedMarker(quest.id)}
                    label={quest.name}
                    pinSize={pinSize}
                  />
                ))}

              {/* Quest Item Markers */}
              {shouldShowMarker('quest_item') &&
                allQuestItems.map((item) => (
                  <Marker
                    key={item.id}
                    location={item}
                    color="#a855f7"
                    icon={<Package size={16} />}
                    isSelected={selectedMarker === item.id}
                    onClick={() => setSelectedMarker(item.id)}
                    label={item.name}
                    pinSize={pinSize}
                  />
                ))}
            </div>
          </TransformComponent>
        </TransformWrapper>

        {/* Info Panel */}
        {selectedMarker && (
          <InfoPanel
            marker={
              [...allLootLocations, ...allBossSpawns, ...allExtractions, ...allKeys, ...allQuests, ...allQuestItems].find(
                (m) => m.id === selectedMarker
              )!
            }
            onClose={() => setSelectedMarker(null)}
          />
        )}
      </div>

      {/* Legend */}
      <div className="p-4 bg-[#1a1d1a] border-t border-[#4a5240] text-sm">
        <div className="flex gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#d4a94f]"></div>
            <span className="text-[#9fad7d]">Interesting Place</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#c44f42]"></div>
            <span className="text-[#9fad7d]">Boss</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#4ade80]"></div>
            <span className="text-[#9fad7d]">Extract</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#60a5fa]"></div>
            <span className="text-[#9fad7d]">Key</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#f59e42]"></div>
            <span className="text-[#9fad7d]">Quest</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#a855f7]"></div>
            <span className="text-[#9fad7d]">Quest Item</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Marker Component
interface MarkerProps {
  location: { id: string; x: number; y: number; name: string; description?: string };
  color: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  label?: string;
  pinSize: number;
}

function Marker({ location, color, icon, isSelected, onClick, label, pinSize }: MarkerProps) {
  const baseSize = 32; // Base size in pixels (w-8 = 32px)
  const scaledSize = baseSize * pinSize;
  const iconSize = 16 * pinSize;
  
  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all"
      style={{
        left: `${location.x}%`,
        top: `${location.y}%`,
        zIndex: isSelected ? 50 : 10,
      }}
      onClick={onClick}
    >
      <div
        className={`relative flex items-center justify-center rounded-full transition-all ${
          isSelected ? 'scale-125 ring-4 ring-white/50' : 'hover:scale-110'
        }`}
        style={{ 
          backgroundColor: color,
          width: `${scaledSize}px`,
          height: `${scaledSize}px`,
        }}
      >
        <div className="text-white" style={{ transform: `scale(${pinSize})` }}>
          {icon}
        </div>
      </div>
      {label && (
        <div
          className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded text-xs font-semibold transition-all"
          style={{ 
            backgroundColor: color, 
            color: 'white',
            top: `${scaledSize + 8}px`,
            fontSize: '12px',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

// Filter Button
interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color?: string;
}

function FilterButton({ active, onClick, icon, label, color }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded transition-all font-medium ${
        active
          ? 'bg-[#4a5240] text-[#e8e6e3] scale-105'
          : 'bg-[#0a0a0a] text-[#9fad7d] hover:bg-[#2a3025]'
      }`}
      style={active && color ? { backgroundColor: color, color: 'white' } : {}}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}

// Info Panel
interface InfoPanelProps {
  marker: any;
  onClose: () => void;
}

function InfoPanel({ marker, onClose }: InfoPanelProps) {
  const isBoss = 'bossName' in marker;
  const isExtract = 'requirements' in marker || 'always' in marker;
  const isLoot = 'type' in marker && 'quality' in marker;
  const isKey = 'location' in marker && 'unlocks' in marker && 'worth' in marker;
  const isQuest = 'type' in marker && marker.type === 'quest';
  const isQuestItem = 'type' in marker && marker.type === 'quest_item';

  return (
    <div className="absolute top-4 right-4 w-80 bg-[#1a1d1a] border-2 border-[#4a5240] rounded-lg p-4 shadow-2xl animate-fade-in">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-[#e8e6e3]">{marker.name}</h3>
        <button
          onClick={onClose}
          className="text-[#9fad7d] hover:text-[#e8e6e3] transition-colors"
        >
          ✕
        </button>
      </div>

      {marker.description && (
        <p className="text-sm text-[#9fad7d] mb-3">{marker.description}</p>
      )}

      {isBoss && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#9fad7d]">Spawn Chance:</span>
            <span className="text-[#c44f42] font-bold">{marker.spawnChance}%</span>
          </div>
          {marker.guards && (
            <div className="flex justify-between">
              <span className="text-[#9fad7d]">Guards:</span>
              <span className="text-[#e8e6e3] font-bold">{marker.guards}</span>
            </div>
          )}
        </div>
      )}

      {isExtract && (
        <div className="space-y-2 text-sm">
          {marker.requirements && (
            <div>
              <span className="text-[#9fad7d]">Requirements: </span>
              <span className="text-[#d4a94f] font-medium">{marker.requirements}</span>
            </div>
          )}
          {marker.always && (
            <div className="text-[#4f9fd4] font-semibold">✓ Always available</div>
          )}
        </div>
      )}

      {isLoot && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#9fad7d]">Importance:</span>
              <span
                className={`font-bold ${
                  marker.quality === 'high'
                    ? 'text-[#d4a94f]'
                    : marker.quality === 'medium'
                    ? 'text-[#9fad7d]'
                    : 'text-[#6a7560]'
                }`}
              >
                {marker.quality.toUpperCase()}
              </span>
            </div>
          </div>
      )}

      {isQuest && (
        <div className="space-y-2 text-sm">
          {marker.quest_giver && (
            <div>
              <span className="text-[#9fad7d]">Quest Giver: </span>
              <span className="text-[#f59e42] font-bold">{marker.quest_giver}</span>
            </div>
          )}
          {marker.objective && (
            <div>
              <span className="text-[#9fad7d]">Objective: </span>
              <span className="text-[#e8e6e3]">{marker.objective}</span>
            </div>
          )}
        </div>
      )}

      {isQuestItem && (
        <div className="space-y-2 text-sm">
          {marker.item_name && (
            <div>
              <span className="text-[#9fad7d]">Item: </span>
              <span className="text-[#a855f7] font-bold">{marker.item_name}</span>
            </div>
          )}
          {marker.needed_for && (
            <div>
              <span className="text-[#9fad7d]">Needed For: </span>
              <span className="text-[#e8e6e3]">{marker.needed_for}</span>
            </div>
          )}
        </div>
      )}

      {isKey && (
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-[#9fad7d]">Found In: </span>
            <span className="text-[#e8e6e3] font-medium">{(marker as any).location}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9fad7d]">Uses:</span>
            <span className="text-[#e8e6e3] font-bold">
              {(marker as any).uses === -1 ? '∞ Unlimited' : (marker as any).uses}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9fad7d]">Worth:</span>
            <span
              className={`font-bold ${
                (marker as any).worth === 'high'
                  ? 'text-[#d4a94f]'
                  : (marker as any).worth === 'medium'
                  ? 'text-[#9fad7d]'
                  : 'text-[#6a7560]'
              }`}
            >
              {(marker as any).worth.toUpperCase()}
            </span>
          </div>
          <div className="pt-2 border-t border-[#4a5240]">
            <span className="text-[#9fad7d] block mb-1">Unlocks:</span>
            <span className="text-[#d4a94f]">{(marker as any).unlocks}</span>
          </div>
        </div>
      )}
    </div>
  );
}
