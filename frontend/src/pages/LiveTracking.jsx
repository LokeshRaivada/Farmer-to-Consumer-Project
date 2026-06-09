import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { MapPin, Truck, ArrowLeft } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LiveTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Default to Hyderabad
  const [farmerLocation, setFarmerLocation] = useState([17.3850, 78.4867]); 
  const [status, setStatus] = useState('Connecting to driver...');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setStatus('Waiting for location updates...');
      // Join a specific room for this order
      newSocket.emit('join_room', `order_${orderId}`);
    });

    newSocket.on('receive_location', (data) => {
      setFarmerLocation([data.lat, data.lng]);
      setStatus('Driver is on the move');
    });

    newSocket.on('disconnect', () => {
      setStatus('Disconnected from server.');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [orderId]);

  // If user is a farmer, they should broadcast their location
  useEffect(() => {
    let watchId;
    if (user?.role === 'farmer' && socket) {
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition((position) => {
          const { latitude, longitude } = position.coords;
          setFarmerLocation([latitude, longitude]);
          
          socket.emit('update_location', {
            room: `order_${orderId}`,
            lat: latitude,
            lng: longitude
          });
          setStatus('Broadcasting your location...');
        }, (error) => {
          console.error("Error watching location:", error);
          setStatus('Failed to get location permission.');
        }, { enableHighAccuracy: true });
      }
    }
    
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    }
  }, [user, socket, orderId]);

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)} 
        className="btn-ghost" 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.5rem 1rem', borderRadius: '1rem' }}
      >
        <ArrowLeft size={18} /> Back to Orders
      </button>

      <div className="glass" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Live Delivery Tracking</h1>
              <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={18} /> Order #{orderId}
              </p>
            </div>
            
            <div style={{ background: 'rgba(0, 255, 157, 0.1)', border: '1px solid var(--primary)', padding: '0.5rem 1.5rem', borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)', animation: 'bgPulse 2s infinite' }}></div>
               {status}
            </div>
        </div>

        <Map 
          center={farmerLocation} 
          zoom={15} 
          style={{ height: '500px', width: '100%', borderRadius: '1rem' }}
          markers={[
            {
              position: farmerLocation,
              title: user?.role === 'farmer' ? "You are here" : "Delivery Driver",
              description: "Current Location"
            }
          ]}
        />
      </div>
    </div>
  );
};

export default LiveTracking;
