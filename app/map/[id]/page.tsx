'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { getMapById } from '@/app/data/maps';
import InteractiveMap from '@/app/components/InteractiveMap';
import { ArrowLeft, Key, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { notFound } from 'next/navigation';

export default function MapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const map = getMapById(id);
  const [customKeys, setCustomKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKeys() {
      try {
        const response = await fetch(`/api/keys/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCustomKeys(data.keys || []);
        }
      } catch (error) {
        console.error('Error fetching keys:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchKeys();
  }, [id]);

  if (!map) {
    notFound();
  }

  // Combine static and custom keys
  const allKeys = [...map.keys, ...customKeys];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#4a5240] bg-[#1a1d1a] sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-[#9fad7d] hover:text-[#e8e6e3] transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </Link>
            <div className="h-6 w-px bg-[#4a5240]"></div>
            <h1 className="text-2xl font-bold text-[#e8e6e3]">{map.name}</h1>
            <span className="text-[#9fad7d] text-sm">/ {map.description}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Map Viewer */}
        <div className="flex-1 lg:h-screen">
          <InteractiveMap map={map} />
        </div>

        {/* Keys Sidebar */}
        <motion.div
          className="lg:w-96 bg-[#1a1d1a] border-l border-[#4a5240] overflow-y-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Key className="text-[#d4a94f]" size={24} />
              <h2 className="text-xl font-bold text-[#e8e6e3]">Important Keys</h2>
            </div>

            {allKeys.length === 0 ? (
              <p className="text-[#9fad7d] text-sm">No special keys for this map.</p>
            ) : (
              <div className="space-y-4">
                {allKeys.map((key) => (
                  <motion.div
                    key={key.id}
                    className="bg-[#0a0a0a] border border-[#4a5240] rounded-lg p-4 hover:border-[#9fad7d] transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-[#e8e6e3] font-semibold">{key.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          key.worth === 'high'
                            ? 'bg-[#d4a94f] text-black'
                            : key.worth === 'medium'
                            ? 'bg-[#9fad7d] text-black'
                            : 'bg-[#4a5240] text-[#e8e6e3]'
                        }`}
                      >
                        {key.worth.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-[#9fad7d]">Location: </span>
                        <span className="text-[#e8e6e3]">{key.location}</span>
                      </div>
                      <div>
                        <span className="text-[#9fad7d]">Uses: </span>
                        <span className="text-[#e8e6e3]">
                          {key.uses === Infinity || key.uses === -1 ? '∞ Unlimited' : key.uses}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-[#4a5240]">
                        <span className="text-[#9fad7d] block mb-1">Unlocks:</span>
                        <span className="text-[#d4a94f]">{key.unlocks}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Map Info Section */}
            <div className="mt-8 pt-6 border-t border-[#4a5240]">
              <h3 className="text-lg font-bold text-[#e8e6e3] mb-4">Map Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#9fad7d]">Loot Spots:</span>
                  <span className="text-[#d4a94f] font-bold">
                    {map.lootLocations.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9fad7d]">Boss Spawns:</span>
                  <span className="text-[#c44f42] font-bold">{map.bossSpawns.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9fad7d]">Extractions:</span>
                  <span className="text-[#4f9fd4] font-bold">{map.extractions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9fad7d]">Keys:</span>
                  <span className="text-[#e8e6e3] font-bold">{allKeys.length}</span>
                </div>
              </div>
            </div>

            {/* Tips Section */}
            <div className="mt-8 pt-6 border-t border-[#4a5240]">
              <h3 className="text-lg font-bold text-[#e8e6e3] mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-[#9fad7d]" />
                Tips
              </h3>
              <div className="space-y-2 text-sm text-[#9fad7d]">
                <p>• Use mouse wheel to zoom in/out</p>
                <p>• Drag to move the map</p>
                <p>• Click markers for more information</p>
                <p>• Use filters to focus on specific types</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
