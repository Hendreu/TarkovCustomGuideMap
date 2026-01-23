'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MAPS } from '@/app/data/maps';
import { TarkovMap, LootLocation, BossSpawn, ExtractionPoint } from '@/app/types/map';
import { Plus, Edit, Trash2, LogOut, Save, X, MapPin as MapPinIcon, Key, Target, Package } from 'lucide-react';
import AdminMapEditor from '@/app/components/AdminMapEditor';

type PinType = 'loot' | 'boss' | 'extract' | 'key' | 'quest' | 'quest_item';

interface PinFormData {
  mapId: string;
  type: PinType;
  name: string;
  x: number;
  y: number;
  description?: string;
  // Loot specific
  lootType?: 'weapon' | 'medical' | 'tech' | 'valuables' | 'food';
  quality?: 'high' | 'medium' | 'low';
  // Boss specific
  bossName?: string;
  spawnChance?: number;
  guards?: number;
  // Extract specific
  requirements?: string;
  always?: boolean;
  pmc?: boolean;
  scavOnly?: boolean;
  // Key specific
  location?: string;
  uses?: number;
  worth?: 'high' | 'medium' | 'low';
  unlocks?: string;
  // Quest specific
  questGiver?: string;
  objective?: string;
  // Quest Item specific
  itemName?: string;
  neededFor?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedMap, setSelectedMap] = useState<string>('customs');
  const [showForm, setShowForm] = useState(false);
  const [showMapEditor, setShowMapEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customPins, setCustomPins] = useState<Record<string, any[]>>({});
  const [customKeys, setCustomKeys] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'pins' | 'keys'>('pins');
  
  const [formData, setFormData] = useState<PinFormData>({
    mapId: 'customs',
    type: 'loot',
    name: '',
    x: 50,
    y: 50,
    lootType: 'weapon',
    quality: 'high',
    // Boss defaults
    bossName: '',
    spawnChance: 50,
    guards: 0,
    // Extract defaults
    requirements: '',
    always: false,
    pmc: true,
    scavOnly: false,
    // Key defaults
    location: '',
    uses: -1,
    worth: 'medium',
    unlocks: '',
  });

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('tarkov_admin_token');
    if (!token) {
      router.push('/admin');
    } else {
      setIsAuthenticated(true);
      loadPins();
      loadKeys();
    }
  }, [router]);

  // Update formData.mapId when selectedMap changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, mapId: selectedMap }));
  }, [selectedMap]);

  // Load pins from API
  const loadPins = async () => {
    try {
      const token = localStorage.getItem('tarkov_admin_token');
      const response = await fetch('/api/pins', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Group pins by map and type
        const grouped: Record<string, any[]> = {};
        data.pins.forEach((pin: any) => {
          const key = `${pin.map_id}_${pin.type}`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(pin);
        });
        setCustomPins(grouped);
      } else if (response.status === 401) {
        // Token invalid, logout
        localStorage.removeItem('tarkov_admin_token');
        router.push('/admin');
      }
    } catch (error) {
      console.error('Error loading pins:', error);
    }
  };

  // Load keys from API
  const loadKeys = async () => {
    try {
      const token = localStorage.getItem('tarkov_admin_token');
      const response = await fetch('/api/keys', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomKeys(data.keys || []);
      }
    } catch (error) {
      console.error('Error loading keys:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tarkov_admin_token');
    router.push('/');
  };

  const resetForm = () => {
    setShowForm(false);
    setShowMapEditor(false);
    setEditingId(null);
    setFormData({
      mapId: selectedMap,
      type: 'loot',
      name: '',
      x: 50,
      y: 50,
      lootType: 'weapon',
      quality: 'high',
      // Boss defaults
      bossName: '',
      spawnChance: 50,
      guards: 0,
      // Extract defaults
      requirements: '',
      always: false,
      pmc: true,
      scavOnly: false,
      // Key defaults
      location: '',
      uses: -1,
      worth: 'medium',
      unlocks: '',
    });
  };

  const handleOpenMapEditor = () => {
    setShowMapEditor(true);
  };

  const handlePinPlaced = (x: number, y: number) => {
    setFormData({ ...formData, x, y });
    setShowMapEditor(false);
    setShowForm(true);
  };

  const handleAddPin = async () => {
    try {
      const token = localStorage.getItem('tarkov_admin_token');

      // Handle key type separately
      if (formData.type === 'key') {
        const keyData: any = {
          map_id: formData.mapId,
          name: formData.name,
          location: formData.location || '',
          uses: formData.uses || -1,
          worth: formData.worth || 'medium',
          unlocks: formData.unlocks || '',
          x: formData.x,
          y: formData.y,
        };

        // Update or create
        if (editingId) {
          const response = await fetch(`/api/keys?id=${editingId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(keyData)
          });

          if (response.ok) {
            await loadKeys();
            resetForm();
          } else {
            alert('Failed to update key');
          }
        } else {
          keyData.id = `key-${Date.now()}`;
          const response = await fetch('/api/keys', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(keyData)
          });

          if (response.ok) {
            await loadKeys();
            resetForm();
          } else {
            alert('Failed to add key');
          }
        }
        return;
      }
      
      const pinData: any = {
        map_id: formData.mapId,
        type: formData.type,
        name: formData.name,
        x: formData.x,
        y: formData.y,
        description: formData.description,
      };

      if (formData.type === 'loot') {
        pinData.loot_type = formData.lootType || 'weapon';
        pinData.quality = formData.quality || 'high';
      } else if (formData.type === 'boss') {
        pinData.boss_name = formData.bossName || 'Unknown Boss';
        pinData.spawn_chance = formData.spawnChance ?? 50;
        pinData.guards = formData.guards ?? 0;
      } else if (formData.type === 'extract') {
        pinData.requirements = formData.requirements || '';
        pinData.always_available = formData.always ?? false;
        pinData.pmc = formData.pmc ?? true;
        pinData.scav_only = formData.scavOnly ?? false;
      } else if (formData.type === 'quest') {
        pinData.quest_giver = formData.questGiver || '';
        pinData.objective = formData.objective || '';
      } else if (formData.type === 'quest_item') {
        pinData.item_name = formData.itemName || '';
        pinData.needed_for = formData.neededFor || '';
      }

      // Update or create
      if (editingId) {
        const response = await fetch(`/api/pins?id=${editingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(pinData)
        });

        if (response.ok) {
          await loadPins();
          resetForm();
        } else {
          alert('Failed to update pin');
        }
      } else {
        pinData.id = `custom-${Date.now()}`;
        const response = await fetch('/api/pins', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(pinData)
        });

        if (response.ok) {
          await loadPins();
          resetForm();
        } else {
          alert('Failed to add pin');
        }
      }
    } catch (error) {
      console.error('Error adding/updating pin:', error);
      alert('Failed to add/update pin');
    }
  };

  const handleDeletePin = async (mapId: string, type: PinType, pinId: string) => {
    if (!confirm('Are you sure you want to delete this pin?')) return;

    try {
      const token = localStorage.getItem('tarkov_admin_token');
      
      const response = await fetch(`/api/pins?id=${pinId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Reload pins
        await loadPins();
      } else {
        alert('Failed to delete pin');
      }
    } catch (error) {
      console.error('Error deleting pin:', error);
      alert('Failed to delete pin');
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this key?')) return;

    try {
      const token = localStorage.getItem('tarkov_admin_token');
      
      const response = await fetch(`/api/keys?id=${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadKeys();
      } else {
        alert('Failed to delete key');
      }
    } catch (error) {
      console.error('Error deleting key:', error);
      alert('Failed to delete key');
    }
  };

  const handleEditPin = (pin: any) => {
    setEditingId(pin.id);
    setFormData({
      mapId: pin.map_id,
      type: pin.type,
      name: pin.name,
      x: pin.x,
      y: pin.y,
      description: pin.description || '',
      quality: pin.quality || 'high',
      bossName: pin.boss_name || '',
      spawnChance: pin.spawn_chance || 0,
      guards: pin.guards || 0,
      requirements: pin.requirements || '',
      always: pin.always_available === 1,
      pmc: pin.pmc === 1,
      scavOnly: pin.scav_only === 1,
    });
    setShowForm(true);
  };

  const handleEditKey = (key: any) => {
    setEditingId(key.id);
    setFormData({
      mapId: key.map_id,
      type: 'key',
      name: key.name,
      x: key.x || 50,
      y: key.y || 50,
      location: key.location,
      uses: key.uses,
      worth: key.worth,
      unlocks: key.unlocks,
    });
    setShowForm(true);
  };

  const getCurrentMap = () => MAPS.find(m => m.id === selectedMap);

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-[#9fad7d]">Loading...</div>
    </div>;
  }

  const currentMap = getCurrentMap();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#4a5240] bg-[#1a1d1a] sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#e8e6e3]">Admin Dashboard</h1>
            <p className="text-[#9fad7d] text-sm">Manage map pins</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-[#c44f42] hover:bg-[#d4625a] text-white rounded transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('pins')}
            className={`px-6 py-3 rounded-lg transition-all ${
              activeTab === 'pins'
                ? 'bg-[#4a5240] text-[#e8e6e3]'
                : 'bg-[#1a1d1a] text-[#9fad7d] hover:bg-[#2a3025]'
            }`}
          >
            <MapPinIcon className="inline mr-2" size={18} />
            Map Pins
          </button>
          <button
            onClick={() => setActiveTab('keys')}
            className={`px-6 py-3 rounded-lg transition-all ${
              activeTab === 'keys'
                ? 'bg-[#4a5240] text-[#e8e6e3]'
                : 'bg-[#1a1d1a] text-[#9fad7d] hover:bg-[#2a3025]'
            }`}
          >
            <Key className="inline mr-2" size={18} />
            Keys Management
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Selection & Pin List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Selector */}
            <div className="bg-[#1a1d1a] border border-[#4a5240] rounded-lg p-6">
              <h2 className="text-lg font-bold text-[#e8e6e3] mb-4">Select Map</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {MAPS.map(map => (
                  <button
                    key={map.id}
                    onClick={() => setSelectedMap(map.id)}
                    className={`p-4 rounded border-2 transition-all ${
                      selectedMap === map.id
                        ? 'border-[#9fad7d] bg-[#9fad7d]/10 text-[#e8e6e3]'
                        : 'border-[#4a5240] text-[#9fad7d] hover:border-[#9fad7d]/50'
                    }`}
                  >
                    <div className="font-bold">{map.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Pins List */}
            {activeTab === 'pins' && (
              <div className="bg-[#1a1d1a] border border-[#4a5240] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#e8e6e3]">
                    Custom Pins - {currentMap?.name}
                  </h2>
                  <button
                    onClick={handleOpenMapEditor}
                    className="flex items-center gap-2 px-4 py-2 bg-[#4a5240] hover:bg-[#9fad7d] text-[#e8e6e3] rounded transition-colors"
                  >
                    <Plus size={18} />
                    Add Pin
                  </button>
                </div>

                <div className="space-y-4">
                  {['loot', 'boss', 'extract', 'quest', 'quest_item'].map((type) => {
                    const mapKey = `${selectedMap}_${type}`;
                    const pins = customPins[mapKey] || [];
                    
                    if (pins.length === 0) return null;

                    return (
                      <div key={type}>
                        <h3 className="text-sm font-semibold text-[#9fad7d] mb-2 uppercase">
                          {type} Pins ({pins.length})
                        </h3>
                        <div className="space-y-2">
                          {pins.map((pin: any) => (
                            <div
                              key={pin.id}
                              className="bg-[#0a0a0a] border border-[#4a5240] rounded p-3 flex items-center justify-between"
                            >
                              <div>
                                <div className="text-[#e8e6e3] font-medium">{pin.name}</div>
                                <div className="text-[#9fad7d] text-xs">
                                  Position: ({pin.x}%, {pin.y}%)
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditPin(pin)}
                                  className="p-2 text-[#9fad7d] hover:bg-[#9fad7d]/20 rounded transition-colors"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => handleDeletePin(selectedMap, type as PinType, pin.id)}
                                  className="p-2 text-[#c44f42] hover:bg-[#c44f42]/20 rounded transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {Object.keys(customPins).filter(k => k.startsWith(selectedMap)).length === 0 && (
                    <p className="text-[#9fad7d] text-sm text-center py-8">
                      No custom pins yet. Click "Add Pin" to create one.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Keys Management List */}
            {activeTab === 'keys' && (
              <div className="bg-[#1a1d1a] border border-[#4a5240] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#e8e6e3]">
                    Keys - {currentMap?.name}
                  </h2>
                  <button
                    onClick={() => {
                      setFormData({
                        ...formData,
                        mapId: selectedMap,
                        type: 'key',
                        name: '',
                        location: '',
                        uses: -1,
                        worth: 'medium',
                        unlocks: '',
                      });
                      setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#4a5240] hover:bg-[#9fad7d] text-[#e8e6e3] rounded transition-colors"
                  >
                    <Plus size={18} />
                    Add Key
                  </button>
                </div>

                <div className="space-y-2">
                  {customKeys
                    .filter(key => key.map_id === selectedMap)
                    .map((key: any) => (
                      <div
                        key={key.id}
                        className="bg-[#0a0a0a] border border-[#4a5240] rounded p-4 hover:border-[#9fad7d]/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
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
                            <div className="space-y-1 text-sm">
                              <div>
                                <span className="text-[#9fad7d]">Location: </span>
                                <span className="text-[#e8e6e3]">{key.location}</span>
                              </div>
                              <div>
                                <span className="text-[#9fad7d]">Uses: </span>
                                <span className="text-[#e8e6e3]">
                                  {key.uses === -1 ? '∞ Unlimited' : key.uses}
                                </span>
                              </div>
                              <div>
                                <span className="text-[#9fad7d]">Unlocks: </span>
                                <span className="text-[#d4a94f]">{key.unlocks}</span>
                              </div>
                              {key.x && key.y && (
                                <div>
                                  <span className="text-[#9fad7d]">Map Position: </span>
                                  <span className="text-[#e8e6e3]">
                                    ({key.x.toFixed(1)}%, {key.y.toFixed(1)}%)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditKey(key)}
                              className="p-2 text-[#9fad7d] hover:bg-[#9fad7d]/20 rounded transition-colors"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteKey(key.id)}
                              className="p-2 text-[#c44f42] hover:bg-[#c44f42]/20 rounded transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                  {customKeys.filter(k => k.map_id === selectedMap).length === 0 && (
                    <p className="text-[#9fad7d] text-sm text-center py-8">
                      No keys yet. Click "Add Key" to create one.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Add Pin Form */}
          {showForm && (
            <div className="bg-[#1a1d1a] border border-[#4a5240] rounded-lg p-6 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#e8e6e3]">
                  {editingId 
                    ? (formData.type === 'key' ? 'Edit Key' : 'Edit Pin')
                    : (formData.type === 'key' ? 'Add New Key' : 'Add New Pin')
                  }
                </h2>
                <button onClick={resetForm} className="text-[#9fad7d] hover:text-[#e8e6e3]">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {formData.type !== 'key' && (
                  <div>
                    <label className="block text-[#9fad7d] text-sm mb-2">Pin Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as PinType })}
                      className="w-full bg-[#0a0a0a] border border-[#4a5240] rounded px-3 py-2 text-[#e8e6e3]"
                    >
                      <option value="loot">Interesting Place</option>
                      <option value="boss">Boss</option>
                      <option value="extract">Extract</option>
                      <option value="quest">Quest Location</option>
                      <option value="quest_item">Quest Item</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[#9fad7d] text-sm mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#4a5240] rounded px-3 py-2 text-[#e8e6e3]"
                    placeholder={formData.type === 'key' ? 'Key name' : 'Location name'}
                  />
                </div>

                {formData.type === 'key' && (
                  <>
                    <div>
                      <label className="block text-[#9fad7d] text-sm mb-2">Found In</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full bg-[#0a0a0a] border border-[#4a5240] rounded px-3 py-2 text-[#e8e6e3]"
                        placeholder="e.g., Customs Office"
                      />
                    </div>
                    <div>
                      <label className="block text-[#9fad7d] text-sm mb-2">Uses</label>
                      <input
                        type="number"
                        value={formData.uses === -1 ? '' : formData.uses}
                        onChange={(e) => setFormData({ ...formData, uses: e.target.value === '' ? -1 : Number(e.target.value) })}
                        className="w-full bg-[#0a0a0a] border border-[#4a5240] rounded px-3 py-2 text-[#e8e6e3]"
                        placeholder="Leave empty for unlimited"
                      />
                    </div>
                    <div>
                      <label className="block text-[#9fad7d] text-sm mb-2">Worth</label>
                      <select
                        value={formData.worth}
                        onChange={(e) => setFormData({ ...formData, worth: e.target.value as any })}
                        className="w-full bg-[#0a0a0a] border border-[#4a5240] rounded px-3 py-2 text-[#e8e6e3]"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#9fad7d] text-sm mb-2">Unlocks</label>
                      <textarea
                        value={formData.unlocks}
                        onChange={(e) => setFormData({ ...formData, unlocks: e.target.value })}
                        className="w-full bg-[#0a0a0a] border border-[#4a5240] rounded px-3 py-2 text-[#e8e6e3]"
                        rows={2}
                        placeholder="What does this key unlock?"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[#9fad7d] text-sm mb-2">
                    {formData.type === 'key' ? 'Map Position (Optional)' : 'Position'}
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-[#0a0a0a] border border-[#4a5240] rounded px-3 py-2 text-[#e8e6e3] text-sm">
                      X: {formData.x.toFixed(1)}%, Y: {formData.y.toFixed(1)}%
                    </div>
                    <button
                      onClick={handleOpenMapEditor}
                      className="px-4 py-2 bg-[#4a5240] hover:bg-[#9fad7d] text-[#e8e6e3] rounded transition-colors flex items-center gap-2"
                    >
                      <MapPinIcon size={16} />
                      {formData.type === 'key' ? 'Set Position' : 'Reposition'}
                    </button>
                  </div>
                </div>

                {formData.type !== 'key' && (
                  <div>
                    <label className="block text-[#9fad7d] text-sm mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#4a5240] rounded px-3 py-2 text-[#e8e6e3]"
                      rows={2}
                      placeholder="Optional description"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[#9fad7d] text-sm mb-2">
                    {formData.type === 'key' ? 'Map Position (Optional)' : 'Position'}
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-[#0a0a0a] border border-[#4a5240] rounded px-3 py-2 text-[#e8e6e3] text-sm">
                      X: {formData.x.toFixed(1)}%, Y: {formData.y.toFixed(1)}%
                    </div>
                    <button
                      onClick={handleOpenMapEditor}
                      className="px-4 py-2 bg-[#4a5240] hover:bg-[#9fad7d] text-[#e8e6e3] rounded transition-colors flex items-center gap-2"
                    >
                      <MapPinIcon size={16} />
                      {formData.type === 'key' ? 'Set Position' : 'Reposition'}
                    </button>
                  </div>
                </div>

                {formData.type !== 'key' && (
                  <>
                    {/* Type-specific fields */}
                    {formData.type === 'loot' && (
                      <>
                        <div>
                          <label className="block text-[#9fad7d] text-sm mb-2">Importance</label>
                          <select
                            value={formData.quality}
                            onChange={(e) => setFormData({ ...formData, quality: e.target.value as any })}
                            className="w-full bg-[#0a0a0a] border border-[#4a5240] rounded px-3 py-2 text-[#e8e6e3]"
                          >
                            <option value="high">High (Very good)</option>
                            <option value="medium">Medium (Normal)</option>
                            <option value="low">Low (Poor)</option>
                          </select>
                        </div>
                      </>
                    )}

                    {formData.type === 'boss' && (
                      <>
                        <div>
                          <label className="block text-[#9fad7d] text-sm mb-2">Boss Name</label>
                          <input
                            type="text"
                            value={formData.bossName}
                            onChange={(e) => setFormData({ ...formData, bossName: e.target.value })}
                            className="w-full bg-[#0a0a0a] border border-[#4a5240] rounded px-3 py-2 text-[#e8e6e3]"
                            placeholder="e.g., Reshala"
                          />
                        </div>
                        <div>
                          <label className="block text-[#9fad7d] text-sm mb-2">Spawn Chance %</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={formData.spawnChance}
                            onChange={(e) => setFormData({ ...formData, spawnChance: Number(e.target.value) })}
                            className="w-full bg-[#0a0a0a] border border-[#4a5240] rounded px-3 py-2 text-[#e8e6e3]"
                          />
                        </div>
                        <div>
                          <label className="block text-[#9fad7d] text-sm mb-2">Guards</label>
                          <input
                            type="number"
                            min="0"
                            value={formData.guards}
                            onChange={(e) => setFormData({ ...formData, guards: Number(e.target.value) })}
                            className="w-full bg-[#0a0a0a] border border-[#4a5240] rounded px-3 py-2 text-[#e8e6e3]"
                          />
                        </div>
                      </>
                    )}

                    {formData.type === 'extract' && (
                      <>
                        <div>
                          <label className="block text-[#9fad7d] text-sm mb-2">Requirements</label>
                          <input
                            type="text"
                            value={formData.requirements}
                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                            className="w-full bg-[#0a0a0a] border border-[#4a5240] rounded px-3 py-2 text-[#e8e6e3]"
                            placeholder="e.g., Money (7000₽)"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="always"
                            checked={formData.always}
                            onChange={(e) => setFormData({ ...formData, always: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <label htmlFor="always" className="text-[#9fad7d] text-sm">
                            Always available
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="pmc"
                            checked={formData.pmc}
                            onChange={(e) => setFormData({ ...formData, pmc: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <label htmlFor="pmc" className="text-[#9fad7d] text-sm">
                            PMC extract
                          </label>
                        </div>
                      </>
                    )}

                    {formData.type === 'quest' && (
                      <>
                        <div>
                          <label className="block text-[#9fad7d] text-sm mb-2">Quest Giver</label>
                          <input
                            type="text"
                            value={formData.questGiver}
                            onChange={(e) => setFormData({ ...formData, questGiver: e.target.value })}
                            className="w-full bg-[#0a0a0a] border border-[#4a5240] rounded px-3 py-2 text-[#e8e6e3]"
                            placeholder="e.g., Prapor"
                          />
                        </div>
                        <div>
                          <label className="block text-[#9fad7d] text-sm mb-2">Objective</label>
                          <textarea
                            value={formData.objective}
                            onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                            className="w-full bg-[#0a0a0a] border border-[#4a5240] rounded px-3 py-2 text-[#e8e6e3]"
                            placeholder="e.g., Find the marked room"
                            rows={3}
                          />
                        </div>
                      </>
                    )}

                    {formData.type === 'quest_item' && (
                      <>
                        <div>
                          <label className="block text-[#9fad7d] text-sm mb-2">Item Name</label>
                          <input
                            type="text"
                            value={formData.itemName}
                            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                            className="w-full bg-[#0a0a0a] border border-[#4a5240] rounded px-3 py-2 text-[#e8e6e3]"
                            placeholder="e.g., Bronze Pocket Watch"
                          />
                        </div>
                        <div>
                          <label className="block text-[#9fad7d] text-sm mb-2">Needed For</label>
                          <input
                            type="text"
                            value={formData.neededFor}
                            onChange={(e) => setFormData({ ...formData, neededFor: e.target.value })}
                            className="w-full bg-[#0a0a0a] border border-[#4a5240] rounded px-3 py-2 text-[#e8e6e3]"
                            placeholder="e.g., Prapor quest 'Checking'"
                          />
                        </div>
                      </>
                    )}
              </>
            )}

                <button
                  onClick={handleAddPin}
                  disabled={!formData.name}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#4a5240] hover:bg-[#9fad7d] text-[#e8e6e3] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Editor Modal */}
      {showMapEditor && currentMap && (
        <AdminMapEditor
          map={currentMap}
          onPinPlaced={handlePinPlaced}
          onCancel={() => setShowMapEditor(false)}
          previewPin={{
            x: formData.x,
            y: formData.y,
            type: formData.type,
          }}
        />
      )}
    </div>
  );
}
