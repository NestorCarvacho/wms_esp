import React, { useEffect, useRef, useState } from 'react';
import { palette } from '@/assets/styles/colors';


export interface GoogleStaticMapProps {
	mapUrl?: string;
	isUnavailable?: boolean;
	loading?: boolean; 
	width?: number;           
	height?: number;           
	className?: string;
	style?: React.CSSProperties;
	ariaLabel?: string;        
	alt?: string;              
}

export const GoogleStaticMap: React.FC<GoogleStaticMapProps> = ({
  mapUrl,
  isUnavailable,
  loading,
  width = 320,
  height = 220,
  className,
  style,
  ariaLabel = 'Mapa no disponible',
  alt = 'Mapa de ubicación',
}) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const previousUrlRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (previousUrlRef.current !== mapUrl) {
      previousUrlRef.current = mapUrl;
      setHasLoaded(false);
      setHasError(false);
    }
  }, [mapUrl]);

  const showUnavailable = isUnavailable || (!loading && !mapUrl);
  const isStillLoading = loading || (!!mapUrl && !hasLoaded && !hasError && !showUnavailable);

  if (showUnavailable || hasError) {
    return (
      <div
        className={`flex items-center justify-center text-center rounded-lg border ${className ?? ''}`}
        style={{
				  width,
				  height,
				  borderColor: palette.brandAux,
				  background: 'repeating-linear-gradient(45deg, #fafafa, #fafafa 10px, #f0f0f0 10px, #f0f0f0 20px)',
				  ...style,
        }}
        aria-label={ariaLabel}
        aria-live={hasError ? 'polite' : undefined}
        data-testid="map-unavailable"
      >
        <span className="text-xs text-gray-500 px-2">Ubicación no disponible</span>
      </div>
    );
  }

  return (
    <div
      className={`relative inline-block ${className ?? ''}`}
      style={{ width, height, ...style }}
      aria-busy={isStillLoading ? 'true' : 'false'}
      data-testid="map-wrapper"
    >
      {mapUrl && (
        <img
          src={mapUrl}
          width={width}
          height={height}
          alt={alt}
          className={`rounded-lg border object-cover w-full h-full ${isStillLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
          style={{ borderColor: palette.brandAux }}
          loading="lazy"
          onLoad={() => setHasLoaded(true)}
          onError={() => setHasError(true)}
          data-testid="map-image"
        />
      )}
      {isStillLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-lg border"
          style={{ borderColor: palette.brandAux }}
          data-testid="map-loading"
        >
          <div
            className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-transparent rounded-full"
            aria-hidden="true"
          />
          <span className="sr-only">Cargando mapa...</span>
        </div>
      )}
    </div>
  );
};

export default GoogleStaticMap;
