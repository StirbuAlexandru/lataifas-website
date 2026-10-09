'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Check, X, Package, Truck, CheckCircle, Bell, BellOff } from 'lucide-react';

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  customer_address: string;
  delivery_notes?: string;
  total_amount: number;
  status: string;
  payment_method: string;
  client_ip?: string;
  created_at: string;
  confirmed_at?: string;
  delivered_at?: string;
  items: OrderItem[];
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const url = statusFilter === 'all' 
        ? '/api/orders'
        : `/api/orders?status=${statusFilter}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        const newOrders = data.data.orders;
        
        // Verifică dacă există comenzi noi cu status 'pending'
        if (silent && soundEnabled && lastOrderCount > 0) {
          const pendingOrders = newOrders.filter((o: Order) => o.status === 'pending');
          const oldPendingOrders = orders.filter(o => o.status === 'pending');
          
          if (pendingOrders.length > oldPendingOrders.length) {
            // Comandă nouă detectată - redă sunetul
            playNotificationSound();
            
            // Afișează notificare în pagină
            const newOrdersCount = pendingOrders.length - oldPendingOrders.length;
            setNotificationMessage(`🔔 ${newOrdersCount} comandă nouă în așteptare!`);
            setShowNotification(true);
            
            // Ascunde notificarea după 10 secunde
            setTimeout(() => {
              setShowNotification(false);
            }, 10000);
            
            // Afișează notificare browser
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Comandă Nouă!', {
                body: `Aveți o comandă nouă în așteptare`,
                icon: '/favicon.svg'
              });
            }
          }
        }
        
        setOrders(newOrders);
        setLastOrderCount(newOrders.length);
      } else {
        setError(data.error || 'Eroare la încărcarea comenzilor');
      }
    } catch (err: any) {
      setError('Eroare la conectarea cu serverul');
      console.error('Error fetching orders:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const playNotificationSound = () => {
    if (!soundEnabled) return;

    let playCount = 0;
    const maxPlays = 10;

    const playBeep = () => {
      if (playCount < maxPlays && soundEnabled) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
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

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrder(orderId);
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh orders list
        await fetchOrders();
      } else {
        alert('Eroare: ' + data.error);
      }
    } catch (err: any) {
      alert('Eroare la actualizarea comenzii');
      console.error('Error updating order:', err);
    } finally {
      setUpdatingOrder(null);
    }
  };

  useEffect(() => {
    fetchOrders();
    requestNotificationPermission();
    
    // Inițializează elementul audio
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIFWa56+efTRAMT6jj8LdjHAU1kdD01H0tBSF1xO7ekjwODFqz5OyrWBYKQ5zd77BsJAUqgMrv3IU2Bxhmu+rqok4RDEyn4u69YhwGNpHQ8taCLQUgdcPp4Y47DwxYsOPwtFkXCkOb3O+xbiQFKoDK7d2FNgcYZrrn7KFOEQxMp+Ltu2IcBjaR0PPVgi0FIHbD6d+OOw8MW6/g77VaGApDm9zvsG4kBSmAyuzczTYHGGa56+mhThEMTKff7b5iHAY2kdDy1oItBSB2w+ngjjsODFuw4O+1WRgKQ5vc77BuJAUpgcrs3M02BxhmuerpoE4RDEyn3+2+YhwGNpHQ8taCLQUgdsPp4I47Dgxbr+HvtVkYCkKb3e+wbiQFKYHK7d3NNgcYZrnr6qBOEQxMp9/tvmIcBjaR0PLWgi0FIHbD6eCOOw4MW7Dg77VZGApCm93vsG4kBSmByuzczTYHGGa66+qgThEMTKff7b5iHAY2kdDy1oItBSB2w+ngjjsODFqw4e+1WRgKQpvd77BuJAUpgcrs3M02Bxhmuurqok4RDEyn3+2+YhwGNpHQ8taCLQUgdsPp4I47Dgxar+HvtVkYCkKb3e+wbiQFKYHK7dzNNgcYZrnq66JOEQxMp9/tvmIcBjaR0PLWgi0FIHbD6eCOOw4MWrDh77VZGApCm93vsG4kBSmByuzczTYHGGa66uqiThEMTKff7b5iHAY2kdDy1oItBSB2w+ngjjsODFqw4e+1WRgKQpvd77BuJAUpgcrs3M02Bxhmuurqok4RDEyn3+2+YhwGNpHQ8taCLQUgdsPp4I47Dgxar+HvtVkYCkKb3e+wbiQFKYHK7dzNNgcYZrnq66JOEQxMp9/tvmIcBjaR0PLWgi0FIHbD6eCOOw4MWrDh77VZGApCm93vsG4kBSmByuzczTYHGGa66uqiThEMTKff7b5iHAY2kdDy1oItBSB2w+ngjjsODFqw4e+1WRgKQpvd77BuJAUpgcrs3M02Bxhmuurqok4RDEyn3+2+Yhw=');
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  // Polling pentru comenzi noi - verifică la fiecare 10 secunde
  useEffect(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    pollIntervalRef.current = setInterval(() => {
      fetchOrders(true); // silent = true, nu arată loading
    }, 10000); // 10 secunde

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [orders, soundEnabled, lastOrderCount, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'preparing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'ready': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'delivered': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'În așteptare';
      case 'confirmed': return 'Confirmată';
      case 'preparing': return 'În preparare';
      case 'ready': return 'Gata';
      case 'delivered': return 'Livrată';
      case 'cancelled': return 'Anulată';
      default: return status;
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Comenzi</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gestionează comenzile și tranzacțiile clienților ({orders.length} total)
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">Toate comenzile</option>
            <option value="pending">În așteptare</option>
            <option value="confirmed">Confirmate</option>
            <option value="preparing">În preparare</option>
            <option value="ready">Gata</option>
            <option value="delivered">Livrate</option>
            <option value="cancelled">Anulate</option>
          </select>
          <Button 
            onClick={toggleSound} 
            variant="outline"
            className={soundEnabled 
              ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/60' 
              : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-900/60'
            }
          >
            {soundEnabled ? (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Sunet Activ
              </>
            ) : (
              <>
                <BellOff className="mr-2 h-4 w-4" />
                Sunet Oprit
              </>
            )}
          </Button>
          <Button 
            onClick={playNotificationSound} 
            variant="outline"
            className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/60 font-semibold"
          >
            🔊 Testează Sunet
          </Button>
          <Button onClick={() => fetchOrders()} variant="outline" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizează
          </Button>
        </div>
      </div>

      {/* Notificare comandă nouă - fundal alb cu animație */}
      {showNotification && (
        <div className="mb-6 p-6 bg-white dark:bg-white border-4 border-green-500 rounded-lg shadow-2xl animate-pulse">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <Bell className="h-12 w-12 text-green-600 animate-bounce" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                COMANDĂ NOUĂ!
              </h3>
              <p className="text-lg text-gray-700 font-semibold">
                {notificationMessage}
              </p>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="flex-shrink-0 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">Încă nu există comenzi</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {order.order_number}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <p><strong>Client:</strong> {order.customer_name}</p>
                      <p><strong>Telefon:</strong> {order.customer_phone}</p>
                      {order.customer_email && <p><strong>Email:</strong> {order.customer_email}</p>}
                      <p><strong>Adresă:</strong> {order.customer_address}</p>
                      {order.delivery_notes && (
                        <p className="col-span-2"><strong>Observații:</strong> {order.delivery_notes}</p>
                      )}
                      <p><strong>Dată:</strong> {new Date(order.created_at).toLocaleString('ro-RO')}</p>
                      <p><strong>Plată:</strong> {order.payment_method === 'cash' ? 'Numerar' : 'Card'}</p>
                      {order.client_ip && (
                        <p><strong>IP Client:</strong> <span className="font-mono text-xs">{order.client_ip}</span></p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {order.total_amount.toFixed(2)} RON
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Produse:</h4>
                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>{item.quantity}x {item.product_name}</span>
                        <span>{item.subtotal.toFixed(2)} RON</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                {order.status === 'pending' && order.payment_method !== 'card' && (
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      disabled={updatingOrder === order.id}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Confirmă
                    </Button>
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      disabled={updatingOrder === order.id}
                      size="sm"
                      variant="destructive"
                    >
                      <X className="mr-1 h-4 w-4" />
                      Anulează
                    </Button>
                  </div>
                )}
                {order.status === 'confirmed' && order.payment_method === 'card' && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm font-semibold">
                      💳 Plată confirmată prin card
                    </span>
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      disabled={updatingOrder === order.id}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Package className="mr-1 h-4 w-4" />
                      Îcepe prepararea
                    </Button>
                  </div>
                )}
                {order.status === 'confirmed' && order.payment_method !== 'card' && (
                  <Button
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                    disabled={updatingOrder === order.id}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Package className="mr-1 h-4 w-4" />
                    Începe prepararea
                  </Button>
                )}
                {order.status === 'preparing' && (
                  <Button
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                    disabled={updatingOrder === order.id}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Marchează ca gata
                  </Button>
                )}
                {order.status === 'ready' && (
                  <Button
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                    disabled={updatingOrder === order.id}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Truck className="mr-1 h-4 w-4" />
                    Marchează ca livrată
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
