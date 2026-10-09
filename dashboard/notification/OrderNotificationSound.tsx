'use client';

import React, { useEffect, useRef, useState } from 'react';

const OrderNotificationSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPendingCountRef = useRef<number>(-1);
  const lastConfirmedCardCountRef = useRef<number>(-1);
  const [showBanner, setShowBanner] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);

  // Activează sunetul după prima interacțiune a utilizatorului
  useEffect(() => {
    const handleInteraction = () => {
      setUserInteracted(true);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  const playNotificationSound = () => {
    if (!soundEnabled || !userInteracted) return;
    
    let playCount = 0;
    const maxPlays = 10;

    const playBeep = () => {
      if (playCount < maxPlays) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Două oscilatori pentru sunet mai puternic
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc1.type = 'square';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc2.frequency.setValueAtTime(1100, audioCtx.currentTime);
        
        gainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(1.0, audioCtx.currentTime + 0.6);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.9);
        
        osc1.start(audioCtx.currentTime);
        osc2.start(audioCtx.currentTime);
        osc1.stop(audioCtx.currentTime + 0.9);
        osc2.stop(audioCtx.currentTime + 0.9);
        
        playCount++;
        setTimeout(playBeep, 1200);
      }
    };

    playBeep();
  };

  useEffect(() => {
    const checkOrders = async () => {
      try {
        const [pendingRes, confirmedRes] = await Promise.all([
          fetch('/api/orders?status=pending'),
          fetch('/api/orders?status=confirmed'),
        ]);
        const pendingData = await pendingRes.json();
        const confirmedData = await confirmedRes.json();

        // Comenzi noi pending (cash)
        if (pendingData.success) {
          const pendingCount = pendingData.data.orders?.length || 0;
          if (lastPendingCountRef.current >= 0 && pendingCount > lastPendingCountRef.current) {
            const diff = pendingCount - lastPendingCountRef.current;
            setNewOrdersCount(diff);
            setShowBanner(true);
            playNotificationSound();
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Comandă Nouă!', {
                body: `${diff} comandă nouă în așteptare!`,
                icon: '/favicon.svg'
              });
            }
            setTimeout(() => setShowBanner(false), 10000);
          }
          lastPendingCountRef.current = pendingCount;
        }

        // Comenzi noi confirmed cu card
        if (confirmedData.success) {
          const confirmedCardOrders = (confirmedData.data.orders || []).filter(
            (o: any) => o.payment_method === 'card'
          );
          const confirmedCardCount = confirmedCardOrders.length;
          if (lastConfirmedCardCountRef.current >= 0 && confirmedCardCount > lastConfirmedCardCountRef.current) {
            const diff = confirmedCardCount - lastConfirmedCardCountRef.current;
            setNewOrdersCount(diff);
            setShowBanner(true);
            playNotificationSound();
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Plată Card Confirmată!', {
                body: `${diff} comandă nouă plătită cu cardul!`,
                icon: '/favicon.svg'
              });
            }
            setTimeout(() => setShowBanner(false), 10000);
          }
          lastConfirmedCardCountRef.current = confirmedCardCount;
        }
      } catch {}
    };

    // Solicită permisiune notificări browser
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    checkOrders();
    const interval = setInterval(checkOrders, 10000);
    return () => clearInterval(interval);
  }, [soundEnabled, userInteracted]);

  return (
    <>
      {/* Banner notificare comandă nouă */}
      {showBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white border-2 border-red-500 rounded-xl shadow-2xl px-6 py-4 flex items-center gap-4 animate-bounce">
          <span className="text-2xl">🔔</span>
          <p className="font-bold text-red-600 text-lg">
            {newOrdersCount} comandă nouă în așteptare!
          </p>
          <button
            onClick={() => setShowBanner(false)}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Buton toggle sunet */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        title={soundEnabled ? 'Dezactivează sunetul' : 'Activează sunetul'}
        className="fixed bottom-6 right-6 z-40 bg-white border-2 border-gray-200 rounded-full p-3 shadow-lg hover:shadow-xl transition-all"
      >
        {soundEnabled ? '🔔' : '🔕'}
      </button>
    </>
  );
};

export default OrderNotificationSound;
