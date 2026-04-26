import React, { useEffect, useRef, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { cn } from '../lib/utils';

interface GlobeMapProps {
  onLocationSelect: (lat: number, lng: number, name: string) => void;
  className?: string;
}

export const GlobeMap: React.FC<GlobeMapProps> = ({ onLocationSelect, className }) => {
  const globeEl = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [countries, setCountries] = useState({ features: [] });
  
  useEffect(() => {
    // Fetch country polygons for bright land overlay from a stable source
    const fetchCountries = async () => {
      try {
        const res = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setCountries(data);
      } catch (error) {
        console.error('Failed to fetch country data:', error);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (globeEl.current) {
      // Configure initial view
      const controls = globeEl.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      
      // Adjust lighting for brightness
      const scene = globeEl.current.scene();
      scene.children.forEach((obj: any) => {
        if (obj.type === 'DirectionalLight') obj.intensity = 2.5;
        if (obj.type === 'AmbientLight') obj.intensity = 1.5;
      });

      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });
    }
  }, []);

  const handleGlobeClick = async ({ lat, lng }: { lat: number, lng: number }) => {
    if (!globeEl.current) return;

    // Zoom in on click
    globeEl.current.pointOfView({ lat, lng, altitude: 1.5 }, 1000);
    
    // Initial name based on coords
    const coordName = `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
    onLocationSelect(lat, lng, coordName);
    
    // Reverse geocode using a free/public service (Nominatim)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
      const data = await res.json();
      
      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || '';
      const country = data.address?.country || '';
      const finalName = city ? `${city}, ${country}` : country || coordName;
      
      onLocationSelect(lat, lng, finalName);
    } catch (e) {
      console.warn("Geocoding failed", e);
    }
  };

  const BRIGHT_COLORS = ['#00f2c4', '#00d4aa', '#3b82f6', '#8b5cf6', '#f59e0b'];

  return (
    <div className={cn("relative w-full h-full bg-[#0a0f1e] overflow-hidden flex items-center justify-center", className)}>
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        showAtmosphere={true}
        atmosphereColor="#00f2c4"
        atmosphereAltitude={0.15}
        polygonsData={countries.features}
        polygonCapColor={() => BRIGHT_COLORS[Math.floor(Math.random() * BRIGHT_COLORS.length)]}
        polygonSideColor={() => 'rgba(0, 242, 196, 0.05)'}
        polygonStrokeColor={() => 'rgba(255, 255, 255, 0.3)'}
        onGlobeClick={handleGlobeClick}
        enablePointerInteraction={true}
        onZoom={() => {
          if (globeEl.current) {
            globeEl.current.controls().autoRotate = false;
          }
        }}
      />
      
      {/* Visual Enhancements */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[650px] h-[650px] rounded-full shadow-[inset_0_0_120px_rgba(0,212,170,0.2)] border border-teal-accent/10" />
      </div>
      
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_55%,#0a0f1e_100%)]" />
    </div>
  );
};
