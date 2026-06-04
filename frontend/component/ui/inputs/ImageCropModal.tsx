import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { Text } from '@/components/ui/text/Text';
import { colorClass, palette } from '@/assets/styles/colors';
import { cn } from '@/lib/utils';
import {
  getCroppedImageBase64,
  validateCroppedImageSize,
} from '@/utils/imageProcessing';
import type { ImageUploaderConfig } from './ImageUploader';


export interface ImageCropModalProps {
  imageSrc: string;
  config: Required<ImageUploaderConfig>;
  onCropComplete: (croppedImageUrl: string) => void;
  onError: (error: string) => void;
  onClose?: () => void;
}

/**
 * Calculates container dimensions for the crop area
 * Container is larger than output to show shadow/overlay
 * 
 * Strategy: Container = Output × 2 (with MIN/MAX limits)
 * - Min: 400px (usable for very small outputs like 10x10)
 * - Max: 600px (prevents too large containers for big outputs like 4000x4000)
 * - Scale: 2x output size (provides space for shadow)
 */
export const calculateContainerDimensions = (width: number, height: number) => {
  const MIN_SIZE = 400;
  const MAX_SIZE = 600;
  const SCALE_FACTOR = 2; // Container 2x larger than output for shadow space
  
  const scaledWidth = width * SCALE_FACTOR;
  const scaledHeight = height * SCALE_FACTOR;
  const aspectRatio = width / height;
  
  // If scaled size fits within MAX_SIZE, use it (with MIN_SIZE floor)
  if (scaledWidth <= MAX_SIZE && scaledHeight <= MAX_SIZE) {
    return {
      width: Math.max(MIN_SIZE, scaledWidth),
      height: Math.max(MIN_SIZE, scaledHeight),
    };
  }
  
  // If too large, scale down to MAX_SIZE maintaining aspect ratio
  if (width >= height) {
    return {
      width: MAX_SIZE,
      height: Math.round(MAX_SIZE / aspectRatio),
    };
  }
  
  return {
    width: Math.round(MAX_SIZE * aspectRatio),
    height: MAX_SIZE,
  };
};

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  imageSrc,
  config,
  onCropComplete,
  onError,
  onClose,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate container dimensions (larger than output for shadow space)
  const containerDimensions = calculateContainerDimensions(config.outputWidth, config.outputHeight);
  
  // Calculate crop size as 70% of container for optimal UX (always visible area + shadow)
  const cropSize = {
    width: Math.round(containerDimensions.width * 0.7),
    height: Math.round(containerDimensions.height * 0.7),
  };

  const handleCropChange = useCallback((newCrop: { x: number; y: number }) => {
    setCrop(newCrop);
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const handleCropCompleteInternal = useCallback(
    (_croppedArea: Area, croppedAreaPixelsParam: Area) => {
      setCroppedAreaPixels(croppedAreaPixelsParam);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedImageBase64 = await getCroppedImageBase64(
        imageSrc,
        croppedAreaPixels,
        config.outputWidth,
        config.outputHeight,
      );

      // Validate cropped image size
      const validation = validateCroppedImageSize(croppedImageBase64);
      if (!validation.isValid) {
        onError(validation.error || 'Imagen demasiado grande');
        return;
      }

      onCropComplete(croppedImageBase64);
      if (onClose) onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar la imagen';
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [imageSrc, croppedAreaPixels, config, onCropComplete, onError, onClose]);

  const handleCancel = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    if (onClose) onClose();
  }, [onClose]);

  return (
    <div className="flex flex-col h-full">
      {/* Crop Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex justify-center">
          <div
            className="relative rounded-lg overflow-hidden"
            style={{
              backgroundColor: palette.border,
              width: `${containerDimensions.width}px`,
              height: `${containerDimensions.height}px`,
            }}
            data-testid="image-crop-modal-crop-area"
          >
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={config.aspectRatio}
              cropShape={config.cropShape}
              showGrid
              cropSize={cropSize}
              onCropChange={handleCropChange}
              onZoomChange={handleZoomChange}
              onCropComplete={handleCropCompleteInternal}
              style={{
                containerStyle: {
                  width: '100%',
                  height: '100%',
                },
              }}
            />
          </div>
        </div>

        {/* Zoom Control */}
        <div className="mt-6">
          <Text variant="subheader-medium" className={cn(colorClass.muted, 'mb-2')}>
            Zoom: {zoom.toFixed(1)}x
          </Text>
          <input
            id="zoom-slider"
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              backgroundColor: palette.border,
              accentColor: palette.brand,
            }}
            data-testid="image-crop-modal-zoom-slider"
          />
        </div>

        {/* Info */}
        <div className={cn('mt-4 rounded-lg p-3', colorClass.brandBg)}>
          <Text variant="small-medium" className={colorClass.brand}>
            Dimensiones finales: {config.outputWidth}x{config.outputHeight} píxeles
          </Text>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-shrink-0 items-center justify-end gap-4 border-t border-slate-200 p-6"
      >
        <PrimaryButton
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isProcessing}
          data-testid="image-crop-modal-cancel-button"
        >
          Cancelar
        </PrimaryButton>
        <PrimaryButton
          type="button"
          onClick={handleSave}
          isLoading={isProcessing}
          disabled={!croppedAreaPixels}
          data-testid="image-crop-modal-save-button"
        >
          Guardar
        </PrimaryButton>
      </div>
    </div>
  );
};
