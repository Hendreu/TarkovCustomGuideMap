'use client';

import Link from 'next/link';
import { MAPS } from './data/maps';
import { Map, Skull, Package, DoorOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#4a5240] bg-[#1a1d1a]">
        <div className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-5xl font-bold text-[#e8e6e3] mb-2 tracking-tight">
                TARKOV TACTICAL MAPS
              </h1>
              <p className="text-[#9fad7d] text-lg">
                Interactive guide for maps, loot, bosses and extractions
              </p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-[#4a5240] hover:bg-[#9fad7d] text-[#e8e6e3] rounded transition-colors text-sm font-medium"
            >
              Admin
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Stats Bar */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatCard icon={<Map />} label="Maps" value={MAPS.length} />
          <StatCard
            icon={<Package />}
            label="Loot Spots"
            value={MAPS.reduce((acc, map) => acc + map.lootLocations.length, 0)}
          />
          <StatCard
            icon={<Skull />}
            label="Boss Spawns"
            value={MAPS.reduce((acc, map) => acc + map.bossSpawns.length, 0)}
          />
          <StatCard
            icon={<DoorOpen />}
            label="Extractions"
            value={MAPS.reduce((acc, map) => acc + map.extractions.length, 0)}
          />
        </motion.div>

        {/* Maps Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {MAPS.map((map, index) => (
            <motion.div
              key={map.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <Link href={`/map/${map.id}`}>
                <div className="group relative bg-[#1a1d1a] border-2 border-[#4a5240] rounded-lg overflow-hidden hover:border-[#9fad7d] transition-all duration-300 cursor-pointer hover:scale-[1.02]">
                  {/* Map Preview */}
                  <div className="relative h-64 bg-[#2a3025] flex items-center justify-center">
                    <div className="text-[#4a5240] text-6xl font-bold opacity-20 group-hover:opacity-30 transition-opacity">
                      {map.name.toUpperCase()}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1d1a] to-transparent opacity-60"></div>
                  </div>

                  {/* Map Info */}
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-[#e8e6e3] mb-2 group-hover:text-[#9fad7d] transition-colors">
                      {map.name}
                    </h2>
                    <p className="text-[#9fad7d] mb-4">{map.description}</p>

                    {/* Quick Stats */}
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1 text-[#d4a94f]">
                        <Package size={16} />
                        <span>{map.lootLocations.length} loot</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#c44f42]">
                        <Skull size={16} />
                        <span>{map.bossSpawns.length} boss</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#4f9fd4]">
                        <DoorOpen size={16} />
                        <span>{map.extractions.length} extract</span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-[#9fad7d] opacity-0 group-hover:opacity-5 transition-opacity"></div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-[#4a5240] bg-[#1a1d1a] py-8">
        <div className="container mx-auto px-6 text-center text-[#9fad7d] text-sm">
          <p>Tarkov Tactical Maps - Unofficial guide for Escape from Tarkov</p>
          <p className="mt-2 text-[#4a5240]">
            Community-based information • Always check for updates
          </p>
        </div>
      </footer>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-[#1a1d1a] border border-[#4a5240] rounded-lg p-4 flex items-center gap-4">
      <div className="text-[#9fad7d]">{icon}</div>
      <div>
        <div className="text-2xl font-bold text-[#e8e6e3]">{value}</div>
        <div className="text-sm text-[#9fad7d]">{label}</div>
      </div>
    </div>
  );
}
