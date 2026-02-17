'use client';

import React, { useCallback, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Food } from '@/types';
import { AlertCircle, MapPin, X } from 'lucide-react';

interface GoogleMapViewProps {
  foods: Food[];
  userLocation: { lat: number; lng: number } | null;
  isLoading: boolean;
}

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '16px',
};

const mapOptions = {
  fullscreenControl: true,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  styles: [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#f5f5f5"
        }
      ]
    },
    {
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#f5f5f5"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#bdbdbd"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#eeeeee"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e5e5e5"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#ffffff"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#dadada"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#c9c9c9"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    }
  ]
};

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  foods,
  userLocation,
  isLoading,
}) => {
  const [selectedMarker, setSelectedMarker] = useState<Food | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="w-full px-6 py-8 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 flex items-start gap-4 shadow-md">
        <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
        <div>
          <p className="font-bold text-red-800 text-lg">🗺️ Google Maps API Key Missing</p>
          <p className="text-sm text-red-700 mt-2">
            Please add{' '}
            <code className="bg-red-200 px-2 py-1 rounded font-mono">
              NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            </code>{' '}
            to your{' '}
            <code className="bg-red-200 px-2 py-1 rounded font-mono">.env.local</code> file.
          </p>
        </div>
      </div>
    );
  }

  // Validate coordinates
  const validFoods = foods.filter((food) => {
    const lat = typeof food.latitude === 'number' ? food.latitude : parseFloat(food.latitude);
    const lng = typeof food.longitude === 'number' ? food.longitude : parseFloat(food.longitude);
    return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  });

  const center = userLocation
    ? { lat: userLocation.lat, lng: userLocation.lng }
    : { lat: 40.7128, lng: -74.006 };

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    setMapError(null);

    if (validFoods.length > 0 && userLocation) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });

      validFoods.forEach((food) => {
        const lat = typeof food.latitude === 'number' ? food.latitude : parseFloat(food.latitude);
        const lng = typeof food.longitude === 'number' ? food.longitude : parseFloat(food.longitude);
        bounds.extend({ lat, lng });
      });

      if (validFoods.length > 0) {
        map.fitBounds(bounds, 100);
      }
    }
  }, [validFoods, userLocation]);

  const handleMapError = (error: Error) => {
    console.error('Google Maps Error:', error);
    setMapError('Failed to load Google Maps. Please check your API key and internet connection.');
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center shadow-lg border border-slate-200">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mapError && (
        <div className="px-6 py-4 rounded-2xl bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 flex items-start gap-3 shadow-md">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-yellow-800 font-medium">{mapError}</p>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-slate-100 hover:shadow-2xl transition-shadow duration-300">
        <LoadScript googleMapsApiKey={apiKey} onError={handleMapError}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={validFoods.length === 0 ? 12 : undefined}
            onLoad={handleMapLoad}
            options={mapOptions}
          >
            {/* User location marker */}
            {userLocation && (
              <Marker
                position={{ lat: userLocation.lat, lng: userLocation.lng }}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#3b82f6',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 3,
                }}
                title="📍 Your Location"
              />
            )}

            {/* Food location markers */}
            {validFoods.map((food) => {
              const lat = typeof food.latitude === 'number' ? food.latitude : parseFloat(food.latitude);
              const lng = typeof food.longitude === 'number' ? food.longitude : parseFloat(food.longitude);
              const isAvailable = food.status === 'available';

              return (
                <Marker
                  key={food._id}
                  position={{ lat, lng }}
                  onClick={() => setSelectedMarker(food)}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: isAvailable ? '#f97316' : '#ef4444',
                    fillOpacity: 0.95,
                    strokeColor: '#ffffff',
                    strokeWeight: 3,
                  }}
                  title={food.title}
                />
              );
            })}

            {/* Info window for selected marker */}
            {selectedMarker && (() => {
              const lat = typeof selectedMarker.latitude === 'number' ? selectedMarker.latitude : parseFloat(selectedMarker.latitude);
              const lng = typeof selectedMarker.longitude === 'number' ? selectedMarker.longitude : parseFloat(selectedMarker.longitude);

              return (
                <InfoWindow
                  position={{ lat, lng }}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="p-4 text-sm max-w-sm bg-white rounded-xl shadow-lg">
                    <h3 className="font-bold text-gray-900 text-base line-clamp-2 mb-1">
                      {selectedMarker.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {selectedMarker.description}
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-700">
                        <MapPin size={14} className="text-brand-500" />
                        <span className="font-medium">{selectedMarker.locationName}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Status: {selectedMarker.status === 'available' ? '🟢 Available' : '🔴 Requested'}
                      </div>
                      {selectedMarker.distanceKm !== undefined && (
                        <div className="text-xs text-gray-600">
                          📏 {selectedMarker.distanceKm.toFixed(2)} km away
                        </div>
                      )}
                    </div>
                  </div>
                </InfoWindow>
              );
            })()}
          </GoogleMap>
        </LoadScript>
      </div>

      {validFoods.length === 0 && (
        <div className="text-center py-12 px-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
          <MapPin size={40} className="mx-auto text-slate-400 mb-3" />
          <p className="text-gray-700 font-semibold text-lg">No food locations to display</p>
          <p className="text-sm text-gray-500 mt-2">
            {foods.length > 0
              ? 'Some food items have invalid coordinates'
              : 'Share food to add it to the map!'}
          </p>
        </div>
      )}

      <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-2xl border-2 border-slate-200 shadow-sm">
        <p className="text-xs font-semibold text-slate-700 mb-3">📍 Map Legend:</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md"></div>
            <span className="text-xs text-slate-700">Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-md"></div>
            <span className="text-xs text-slate-700">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-md"></div>
            <span className="text-xs text-slate-700">Requested</span>
          </div>
        </div>
      </div>
    </div>
  );
};
