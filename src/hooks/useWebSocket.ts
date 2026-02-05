import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store';
import type { WSMessage, Person, HailoEvent, DashboardStats } from '../types';
import toast from 'react-hot-toast';

export function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  
  // Get store values
  const store = useStore();
  const { useMockData, setWsConnected } = store;

  const handleMessage = useCallback((message: WSMessage) => {
    const state = useStore.getState();
    
    switch (message.type) {
      case 'person_detected': {
        const person = message.payload as Person;
        state.setPeople(state.people.map(p => p.id === person.id ? person : p));
        break;
      }
      
      case 'fall_detected': {
        const event = message.payload as HailoEvent;
        state.addEvent(event);
        toast.error(event.message, {
          icon: '🚨',
          duration: 10000,
        });
        break;
      }
      
      case 'loiter_alert': {
        const event = message.payload as HailoEvent;
        state.addEvent(event);
        if (event.severity === 'critical') {
          toast.error(event.message, { icon: '⚠️', duration: 8000 });
        } else {
          toast(event.message, { icon: '👁️', duration: 5000 });
        }
        break;
      }
      
      case 'crowd_alert': {
        const event = message.payload as HailoEvent;
        state.addEvent(event);
        toast(event.message, { 
          icon: '👥', 
          duration: 5000,
          style: event.severity === 'critical' ? { background: '#ff3b3b' } : undefined 
        });
        break;
      }
      
      case 'zone_update': {
        const stats = message.payload as DashboardStats;
        state.setStats(stats);
        break;
      }
    }
  }, []);

  const connect = useCallback(() => {
    if (useMockData) return;

    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setWsConnected(true);
        toast.success('Connected to Hailo backend', { icon: '🔌' });
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnected(false);
        // Attempt reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('WebSocket connection error');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    }
  }, [url, useMockData, setWsConnected, handleMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setWsConnected(false);
  }, [setWsConnected]);

  useEffect(() => {
    if (!useMockData) {
      connect();
    }
    return () => disconnect();
  }, [useMockData, connect, disconnect]);

  return { connect, disconnect };
}
