import React, { useState, useEffect, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Marker,
  Pin,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Search,
  Crosshair,
  Layers,
  Sun,
  ShieldCheck,
  Navigation,
  LocateFixed,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { GeoLocation, RegionId } from '../types';
import { calculateIrradiationFromCoordinates } from '../utils/solarCalculator';

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAg2iHgGMMr21myDEMbqWRQZTu9ChfJbHU';

// Un ID de carte valide dans Google Cloud Console est requis pour les Advanced Markers.
// En l'absence d'un Map ID Cloud dédié, on bascule proprement sur les repères Marker standard
// pour éliminer l'erreur "La carte est initialisée sans ID de carte valide".
const rawMapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
const HAS_CUSTOM_MAP_ID = Boolean(rawMapId && rawMapId !== 'DEMO_MAP_ID');
const GOOGLE_MAPS_MAP_ID = HAS_CUSTOM_MAP_ID ? rawMapId : undefined;

interface GoogleMapsInstallationPickerProps {
  location: GeoLocation;
  onLocationChange: (newLocation: GeoLocation, newRegion: RegionId) => void;
  systemPowerKWp: number;
}

// Composant interne pour recentrer et zoomer la carte par programmation
const MapController: React.FC<{ center: { lat: number; lng: number }; zoom?: number }> = ({
  center,
  zoom,
}) => {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
      if (zoom !== undefined) {
        map.setZoom(zoom);
      }
    }
  }, [map, center.lat, center.lng, zoom]);
  return null;
};

export const GoogleMapsInstallationPicker: React.FC<GoogleMapsInstallationPickerProps> = ({
  location,
  onLocationChange,
  systemPowerKWp,
}) => {
  const [mapType, setMapType] = useState<'hybrid' | 'roadmap'>('hybrid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // État de géolocalisation de l'utilisateur
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccessNotice, setLocationSuccessNotice] = useState<string | null>(null);
  const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);

  // Villes et régions de test rapides pour observer l'impact du gisement solaire
  const cityPresets = [
    { name: 'Marseille 🇫🇷', lat: 43.2965, lng: 5.3698 },
    { name: 'Bordeaux 🇫🇷', lat: 44.8378, lng: -0.5792 },
    { name: 'Toulouse 🇫🇷', lat: 43.6047, lng: 1.4442 },
    { name: 'Lyon 🇫🇷', lat: 45.7640, lng: 4.8357 },
    { name: 'Nantes 🇫🇷', lat: 47.2184, lng: -1.5536 },
    { name: 'Paris 🇫🇷', lat: 48.8566, lng: 2.3522 },
    { name: 'Bruxelles 🇧🇪', lat: 50.8503, lng: 4.3517 },
    { name: 'Genève 🇨🇭', lat: 46.2044, lng: 6.1432 },
    { name: 'Madrid 🇪🇸', lat: 40.4168, lng: -3.7038 },
    { name: 'Berlin 🇩🇪', lat: 52.5200, lng: 13.4050 },
    { name: 'Rome 🇮🇹', lat: 41.9028, lng: 12.4964 },
    { name: 'Londres 🇬🇧', lat: 51.5074, lng: -0.1278 },
    { name: 'Montréal 🇨🇦', lat: 45.5017, lng: -73.5673 },
    { name: 'Casablanca 🇲🇦', lat: 33.5731, lng: -7.5898 },
    { name: 'Tunis 🇹🇳', lat: 36.8065, lng: 10.1815 },
    { name: 'Sousse 🇹🇳', lat: 35.8256, lng: 10.6369 },
  ];

  // Géocodage inverse lors d'un clic ou déplacement du marqueur
  const updatePosition = useCallback(
    async (lat: number, lng: number) => {
      const { annualIrradiation, region } = calculateIrradiationFromCoordinates(lat, lng);

      try {
        // Géocodage inverse via l'API Google Maps
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=fr`
        );
        const data = await response.json();

        let address = `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
        let city = 'Position sélectionnée';
        let postalCode = '';
        let countryCode = '';
        let countryName = '';

        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const result = data.results[0];
          address = result.formatted_address || address;

          for (const component of result.address_components) {
            if (component.types.includes('locality')) {
              city = component.long_name;
            } else if (component.types.includes('postal_code')) {
              postalCode = component.long_name;
            } else if (component.types.includes('country')) {
              countryCode = component.short_name.toUpperCase();
              countryName = component.long_name;
            }
          }
        }

        onLocationChange(
          {
            lat,
            lng,
            formattedAddress: address,
            city,
            postalCode,
            countryCode: countryCode || undefined,
            countryName: countryName || undefined,
            annualIrradiationKWhPerKWp: annualIrradiation,
            source: 'google_maps_solar',
          },
          region
        );
      } catch {
        // En cas d'erreur réseau, mise à jour immédiate avec les coordonnées GPS
        onLocationChange(
          {
            lat,
            lng,
            formattedAddress: `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
            city: 'Position GPS',
            postalCode: '',
            annualIrradiationKWhPerKWp: annualIrradiation,
            source: 'pvgis_gps',
          },
          region
        );
      }
    },
    [onLocationChange]
  );

  // Recherche d'adresse
  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          searchQuery
        )}&key=${GOOGLE_MAPS_API_KEY}&language=fr`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const place = data.results[0];
        const newLat = place.geometry.location.lat;
        const newLng = place.geometry.location.lng;
        setMapZoom(18);
        await updatePosition(newLat, newLng);
        setSearchQuery('');
      } else {
        setSearchError('Adresse non trouvée. Essayez avec un code postal ou une ville.');
      }
    } catch {
      setSearchError('Erreur de connexion au service de recherche.');
    } finally {
      setIsSearching(false);
    }
  };

  // Géolocalisation haute précision de l'utilisateur
  const handleCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setSearchError("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setIsLocating(true);
    setSearchError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setUserLocation({ lat: userLat, lng: userLng });
        setMapZoom(19); // Zoom précis sur la toiture
        setIsLocating(false);
        setLocationSuccessNotice(
          'Votre position actuelle a été localisée ! Vous pouvez ajuster le marqueur jaune sur votre toit.'
        );
        setTimeout(() => setLocationSuccessNotice(null), 6000);
        await updatePosition(userLat, userLng);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setSearchError(
            'Autorisation de géolocalisation refusée. Vous pouvez rechercher votre adresse ou ville dans le champ de recherche.'
          );
        } else if (err.code === err.TIMEOUT) {
          setSearchError('Délai d’attente GPS dépassé. Veuillez réessayer.');
        } else {
          setSearchError('Impossible de déterminer votre position géographique.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [updatePosition]);

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-neutral-900">
                Positionnement de la Toiture sur Google Maps
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-3 h-3 mr-1" />
                GPS Haute Précision
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Activez votre position ou placez le repère directement sur votre toiture
            </p>
          </div>
        </div>

        {/* Map View Toggle & Geolocation button */}
        <div className="flex items-center space-x-2">
          <div className="inline-flex rounded-lg border border-neutral-200 bg-white p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMapType('hybrid')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
                mapType === 'hybrid'
                  ? 'bg-neutral-900 text-white font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Layers className="w-3 h-3" />
              Vue Satellite (Toiture)
            </button>
            <button
              type="button"
              onClick={() => setMapType('roadmap')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                mapType === 'roadmap'
                  ? 'bg-neutral-900 text-white font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Plan
            </button>
          </div>

          <button
            type="button"
            id="btn-geolocate-header"
            onClick={handleCurrentLocation}
            disabled={isLocating}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-bold transition-all shadow-2xs ${
              isLocating
                ? 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse'
                : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
            }`}
            title="Localiser automatiquement ma position actuelle"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <LocateFixed className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span>{isLocating ? 'Recherche GPS...' : 'Ma position'}</span>
          </button>
        </div>
      </div>

      {/* Geolocation success notice banner */}
      {locationSuccessNotice && (
        <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <span className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {locationSuccessNotice}
          </span>
          <button
            type="button"
            onClick={() => setLocationSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 text-sm font-bold px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Address Search Form */}
      <div className="p-3 bg-neutral-100/70 border-b border-neutral-200">
        <form onSubmit={handleSearchAddress} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher une adresse, ville ou code postal (ex: 12 rue de la Paix, 33000 Bordeaux)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 shrink-0"
          >
            {isSearching ? 'Recherche...' : 'Localiser'}
          </button>
        </form>

        {searchError && (
          <p className="text-xs text-red-600 mt-1.5 font-medium">{searchError}</p>
        )}

        {/* Quick Location Presets & User Location Button */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 text-[11px] text-neutral-600 scrollbar-none">
          <button
            type="button"
            id="btn-geolocate-preset"
            onClick={handleCurrentLocation}
            disabled={isLocating}
            className={`shrink-0 px-2.5 py-1 rounded-md border flex items-center gap-1.5 font-bold transition-all shadow-2xs ${
              userLocation
                ? 'border-blue-500 bg-blue-50 text-blue-900 ring-1 ring-blue-400'
                : 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
            }`}
            title="Localiser immédiatement mon adresse actuelle avec le GPS"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
            ) : (
              <LocateFixed className="w-3.5 h-3.5 text-current" />
            )}
            <span>{isLocating ? 'Détection...' : '📍 Ma position actuelle'}</span>
          </button>

          <span className="shrink-0 text-neutral-400 font-medium ml-1">Villes :</span>
          {cityPresets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                setMapZoom(16);
                updatePosition(preset.lat, preset.lng);
              }}
              className={`shrink-0 px-2.5 py-1 rounded-md border transition-all ${
                Math.abs(location.lat - preset.lat) < 0.05 && Math.abs(location.lng - preset.lng) < 0.05
                  ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Google Map Stage */}
      <div className="relative w-full h-[340px] sm:h-[400px] bg-neutral-200">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <Map
            mapId={GOOGLE_MAPS_MAP_ID}
            style={{ width: '100%', height: '100%' }}
            defaultCenter={{ lat: location.lat, lng: location.lng }}
            defaultZoom={18}
            mapTypeId={mapType}
            gestureHandling="greedy"
            disableDefaultUI={false}
            mapTypeControl={false}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            onClick={(e) => {
              if (e.detail?.latLng) {
                updatePosition(e.detail.latLng.lat, e.detail.latLng.lng);
              }
            }}
          >
            <MapController
              center={{ lat: location.lat, lng: location.lng }}
              zoom={mapZoom}
            />

            {/* Point de localisation de l'utilisateur (Point bleu GPS) */}
            {userLocation && (
              GOOGLE_MAPS_MAP_ID ? (
                <AdvancedMarker
                  position={{ lat: userLocation.lat, lng: userLocation.lng }}
                  title="Votre position GPS détectée"
                  zIndex={15}
                >
                  <div className="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
                    <div className="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping pointer-events-none" />
                    <div className="absolute w-6 h-6 bg-blue-400/20 rounded-full border border-blue-400 pointer-events-none" />
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md z-10 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-neutral-900/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm whitespace-nowrap opacity-90 pointer-events-none flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      Votre position
                    </div>
                  </div>
                </AdvancedMarker>
              ) : (
                <Marker
                  position={{ lat: userLocation.lat, lng: userLocation.lng }}
                  title="Votre position GPS actuelle"
                  icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                />
              )
            )}

            {/* Draggable Solar Installation Marker */}
            {GOOGLE_MAPS_MAP_ID ? (
              <AdvancedMarker
                position={{ lat: location.lat, lng: location.lng }}
                draggable={true}
                zIndex={25}
                onDragEnd={(e) => {
                  if (e.latLng) {
                    updatePosition(e.latLng.lat(), e.latLng.lng());
                  }
                }}
                title="Emplacement de votre installation solaire"
              >
                <Pin
                  background="#f59e0b"
                  borderColor="#b45309"
                  glyphColor="#ffffff"
                  scale={1.2}
                />
              </AdvancedMarker>
            ) : (
              <Marker
                position={{ lat: location.lat, lng: location.lng }}
                draggable={true}
                onDragEnd={(e) => {
                  if (e.latLng) {
                    updatePosition(e.latLng.lat(), e.latLng.lng());
                  }
                }}
                title="Emplacement de votre installation solaire (glissez pour déplacer)"
              />
            )}
          </Map>
        </APIProvider>

        {/* Floating Solar Flux Indicator on Top of Map */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-md border border-neutral-200 text-xs space-y-1 max-w-xs pointer-events-none z-10">
          <div className="flex items-center gap-1.5 text-amber-800 font-bold">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Gisement Solaire au Point Fixé :</span>
          </div>
          <div className="text-base font-extrabold text-neutral-900">
            {location.annualIrradiationKWhPerKWp}{' '}
            <span className="text-xs font-normal text-neutral-500">kWh/kWc/an</span>
          </div>
          <div className="text-[11px] text-neutral-600 truncate">
            {location.formattedAddress}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono">
            GPS : {location.lat.toFixed(5)}°N, {location.lng.toFixed(5)}°E
          </div>
        </div>

        {/* Quick Snap back to user position button if marker was moved away */}
        {userLocation &&
          (Math.abs(location.lat - userLocation.lat) > 0.00015 ||
            Math.abs(location.lng - userLocation.lng) > 0.00015) && (
            <button
              type="button"
              onClick={() => updatePosition(userLocation.lat, userLocation.lng)}
              className="absolute top-3 right-3 z-10 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              title="Replacer le marqueur solaire directement sur votre position GPS"
            >
              <Navigation className="w-3.5 h-3.5 fill-white" />
              <span>Recaler sur ma position</span>
            </button>
          )}

        {/* Floating FAB Geolocation Control on Map (Google Maps Style) */}
        <button
          type="button"
          id="btn-geolocate-fab"
          onClick={handleCurrentLocation}
          disabled={isLocating}
          className="absolute bottom-4 left-4 z-10 bg-white/95 hover:bg-white text-neutral-800 px-3.5 py-2.5 rounded-xl shadow-lg border border-neutral-300 flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 group backdrop-blur-xs"
          title="Centrer la carte sur ma position géographique"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Crosshair className="w-4 h-4 text-blue-600 group-hover:rotate-45 transition-transform" />
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full absolute" />
            </div>
          )}
          <span>{isLocating ? 'Localisation GPS...' : 'Me géolocaliser'}</span>
        </button>

        {/* Floating Instructions */}
        <div className="absolute bottom-3 right-3 bg-neutral-900/80 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-[11px] font-medium shadow-sm pointer-events-none z-10 hidden sm:block">
          Cliquez ou glissez le repère jaune sur votre toit
        </div>
      </div>

      {/* Position Status Bar */}
      <div className="p-4 bg-amber-50/60 border-t border-amber-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-neutral-900 bg-white border border-amber-200 px-2.5 py-1 rounded-md shadow-2xs">
            {location.city || 'Position Fixée'}
          </span>
          <span className="text-neutral-700">
            Adresse : <strong className="text-neutral-900">{location.formattedAddress}</strong>
          </span>
          {userLocation && (
            <span className="inline-flex items-center gap-1 text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              Position utilisateur active
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 font-medium text-neutral-700">
          <span>
            Irradiation locale :{' '}
            <strong className="text-amber-800 font-bold">
              {location.annualIrradiationKWhPerKWp} kWh/kWc
            </strong>
          </span>
          <span className="text-neutral-300">|</span>
          <span>
            Production estimée ({systemPowerKWp} kWc) :{' '}
            <strong className="text-emerald-700 font-bold">
              {Math.round(systemPowerKWp * location.annualIrradiationKWhPerKWp * 0.86)} kWh/an
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};
