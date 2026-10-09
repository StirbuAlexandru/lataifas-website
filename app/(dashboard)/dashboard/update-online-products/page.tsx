'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface UpdateResult {
  success: boolean;
  updatedCount: number;
  skippedExistingCount: number;
  notFoundInProductsCount: number;
  errorsCount: number;
  updated: { name: string; price: number }[];
  skippedExisting: string[];
  notFoundInProducts: string[];
  errors: string[];
  error?: string;
}

export default function UpdateOnlineProductsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UpdateResult | null>(null);

  const handleUpdate = async () => {
    if (!confirm('Actualizez DOAR produsele care există deja în Comandă Online. Continui?')) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/update-online-product-prices', { method: 'POST' });
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        updatedCount: 0,
        skippedExistingCount: 0,
        notFoundInProductsCount: 0,
        errorsCount: 1,
        updated: [],
        skippedExisting: [],
        notFoundInProducts: [],
        errors: [error.message],
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Actualizare Comandă Online</h1>
      <p className="text-gray-600 mb-6">
        Actualizează prețurile și descrierile produselor existente în <strong>Comandă Online</strong>, pe baza documentului nou de prețuri.
        Nu adaugă automat toate produsele din meniu, ca să nu apară produse care nu trebuie comandate online.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold text-blue-900 mb-2">Ce face acest buton?</h2>
        <ul className="text-blue-800 text-sm space-y-1 mb-4 list-disc pl-5">
          <li>caută produsele existente după nume;</li>
          <li>actualizează doar prețul și descrierea;</li>
          <li>nu modifică imaginile;</li>
          <li>nu introduce toate produsele din meniu dacă nu există deja în Comandă Online.</li>
        </ul>
        <Button onClick={handleUpdate} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
          {loading ? '⏳ Actualizez...' : '🚀 Actualizează prețuri și descrieri'}
        </Button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className={result.success ? 'bg-green-50 border border-green-300 rounded-lg p-4' : 'bg-red-50 border border-red-300 rounded-lg p-4'}>
            <p className={result.success ? 'text-green-800 font-bold' : 'text-red-800 font-bold'}>
              {result.success ? '✅ Actualizare finalizată' : '❌ Eroare la actualizare'}
            </p>
            {result.error && <p className="text-red-700 mt-1">{result.error}</p>}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
              <div className="bg-white rounded p-3"><strong>{result.updatedCount}</strong><br />actualizate</div>
              <div className="bg-white rounded p-3"><strong>{result.skippedExistingCount}</strong><br />existente fără potrivire</div>
              <div className="bg-white rounded p-3"><strong>{result.notFoundInProductsCount}</strong><br />din document negăsite online</div>
              <div className="bg-white rounded p-3"><strong>{result.errorsCount}</strong><br />erori</div>
            </div>
          </div>

          {result.updated.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-bold mb-2">Produse actualizate</h3>
              <div className="max-h-64 overflow-y-auto text-sm space-y-1">
                {result.updated.map((item) => <p key={item.name}>✅ {item.name} — {item.price} lei</p>)}
              </div>
            </div>
          )}

          {result.skippedExisting.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-bold mb-2 text-yellow-900">Produse existente în Comandă Online, dar fără potrivire în document</h3>
              <div className="max-h-64 overflow-y-auto text-sm text-yellow-800 space-y-1">
                {result.skippedExisting.map((name) => <p key={name}>⚠️ {name}</p>)}
              </div>
            </div>
          )}

          {result.notFoundInProducts.length > 0 && (
            <div className="bg-gray-50 border rounded-lg p-4">
              <h3 className="font-bold mb-2">Produse din document care nu există în Comandă Online</h3>
              <p className="text-sm text-gray-600 mb-2">Acestea au fost ignorate intenționat. Le adăugăm separat doar dacă vreți să fie comandabile online.</p>
              <div className="max-h-64 overflow-y-auto text-sm text-gray-700 space-y-1">
                {result.notFoundInProducts.map((name) => <p key={name}>- {name}</p>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
