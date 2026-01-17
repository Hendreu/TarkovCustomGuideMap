'use client';

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { TarkovMap } from '../types/map';
import { MapPin, Skull, DoorOpen, Key, X, Target, Package } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';

interface AdminMapEditorProps {
  map: TarkovMap;
  onPinPlaced: (x: number, y: number) => void;
  onCancel: () => void;
  previewPin?: {
    x: number;
    y: number;
    type: 'loot' | 'boss' | 'extract' | 'key' | 'quest' | 'quest_item';
  };
}

export default function AdminMapEditor({ map, onPinPlaced, onCancel, previewPin }: AdminMapEditorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [tempPosition, setTempPosition] = useState<{ x: number; y: number } | null>(
    previewPin ? { x: previewPin.x, y: previewPin.y } : null
  );
  const mapRef = useRef<HTMLDivElement>(null);

  const getIconForType = (type: 'loot' | 'boss' | 'extract' | 'key' | 'quest' | 'quest_item') => {
    switch (type) {
      case 'loot':
        return <MapPin size={16} />;
      case 'boss':
        return <Skull size={16} />;
      case 'extract':
        return <DoorOpen size={16} />;
      case 'key':
        return <Key size={16} />;
      case 'quest':
        return <Target size={16} />;
      case 'quest_item':
        return <Package size={16} />;
    }
  };

  const getColorForType = (type: 'loot' | 'boss' | 'extract' | 'key' | 'quest' | 'quest_item') => {
    switch (type) {
      case 'loot':
        return '#d4a94f';
      case 'boss':
        return '#c44f42';
      case 'extract':
        return '#4f9fd4';
      case 'key':
        return '#9fad7d';
      case 'quest':
        return '#f59e42';
      case 'quest_item':
        return '#a855f7';
    }
  };

  const handleMapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setTempPosition({ x, y });
  }, []);

  const handleMapMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setTempPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }, [isDragging]);

  const handleConfirm = () => {
    if (tempPosition) {
      onPinPlaced(tempPosition.x, tempPosition.y);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#1a1d1a] border-b border-[#4a5240] p-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#e8e6e3]">Place Pin on {map.name}</h2>
          <p className="text-[#9fad7d] text-sm">
            Click on the map to place the pin, or drag the preview pin to adjust position
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-[#9fad7d] hover:text-[#e8e6e3] transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={4}
          centerOnInit
          centerZoomedOut
          disabled={isDragging}
        >
          <TransformComponent
            wrapperClass="w-full h-full flex items-center justify-center"
            contentClass="flex items-center justify-center"
          >
            <div
              ref={mapRef}
              className="relative w-[1573px] h-[804px] bg-[#2a3025] cursor-crosshair"
              onClick={handleMapClick}
              onMouseMove={handleMapMouseMove}
              onMouseUp={() => setIsDragging(false)}
            >
              {/* Map Background Image */}
              <img
                src={map.image}
                alt={map.name}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                draggable={false}
              />

              {/* Grid overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full opacity-20">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#4a5240" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Existing pins (readonly) */}
              {[...map.lootLocations, ...map.bossSpawns, ...map.extractions].map((location) => (
                <div
                  key={location.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-30"
                  style={{
                    left: `${location.x}%`,
                    top: `${location.y}%`,
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#9fad7d' }}
                  >
                    <MapPin size={12} className="text-white" />
                  </div>
                </div>
              ))}

              {/* Preview/Draggable Pin */}
              {tempPosition && previewPin && (
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move"
                  style={{
                    left: `${tempPosition.x}%`,
                    top: `${tempPosition.y}%`,
                    zIndex: 100,
                  }}
                  onMouseDown={() => setIsDragging(true)}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center ring-4 ring-white/50 shadow-lg animate-pulse"
                    style={{ backgroundColor: getColorForType(previewPin.type) }}
                  >
                    <div className="text-white">
                      {getIconForType(previewPin.type)}
                    </div>
                  </div>
                  
                  {/* Coordinates display */}
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    X: {tempPosition.x.toFixed(1)}%, Y: {tempPosition.y.toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>

      {/* Footer Actions */}
      <div className="bg-[#1a1d1a] border-t border-[#4a5240] p-4 flex items-center justify-between">
        <div className="text-[#9fad7d] text-sm">
          {tempPosition ? (
            <span>Position: X: {tempPosition.x.toFixed(1)}%, Y: {tempPosition.y.toFixed(1)}%</span>
          ) : (
            <span>Click on the map to place the pin</span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-[#0a0a0a] hover:bg-[#2a3025] text-[#9fad7d] rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!tempPosition}
            className="px-6 py-2 bg-[#4a5240] hover:bg-[#9fad7d] text-[#e8e6e3] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Position
          </button>
        </div>
      </div>
    </div>
  );
}
