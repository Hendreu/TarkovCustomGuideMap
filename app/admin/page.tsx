'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('tarkov_admin_token');
    if (token) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('tarkov_admin_token', data.token);
        router.push('/admin/dashboard');
      } else {
        setError('Invalid password');
        setPassword('');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-[#1a1d1a] border-2 border-[#4a5240] rounded-lg p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-[#4a5240] p-4 rounded-full mb-4">
              <Lock size={32} className="text-[#e8e6e3]" />
            </div>
            <h1 className="text-2xl font-bold text-[#e8e6e3] mb-2">Admin Access</h1>
            <p className="text-[#9fad7d] text-sm text-center">
              Enter password to manage map pins
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-[#9fad7d] text-sm mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full bg-[#0a0a0a] border border-[#4a5240] rounded px-4 py-3 text-[#e8e6e3] focus:outline-none focus:border-[#9fad7d] transition-colors"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-[#c44f42]/20 border border-[#c44f42] rounded px-4 py-2 text-[#c44f42] text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#4a5240] hover:bg-[#9fad7d] text-[#e8e6e3] font-semibold py-3 rounded transition-colors"
            >
              Login
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#4a5240]">
            <p className="text-[#9fad7d] text-xs text-center">
              Default password: <span className="text-[#d4a94f]">alisucksbutwehelp</span>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-[#9fad7d] hover:text-[#e8e6e3] transition-colors text-sm">
            ← Back to Maps
          </a>
        </div>
      </div>
    </div>
  );
}
