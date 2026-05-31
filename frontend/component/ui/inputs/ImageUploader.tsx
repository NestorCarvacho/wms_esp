import React, { useState, useCallback, useRef, useMemo } from 'react';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { Text } from '@/components/ui/text/Text';
import { colors } from '@/assets/styles/colors';
import { useUI } from '@/hooks/ui';
import {
  validateLogoFile,
  fileToDataURL,
  IMAGE_CONSTANTS,
} from '@/utils/imageProcessing';

/**
 * Configuration interface for ImageUploader
 */
export interface ImageUploaderConfig {
  // Dimensions and crop
  outputWidth?: number;
  outputHeight?: number;
  aspectRatio?: number;
  cropShape?: 'rect' | 'round';
  enableCrop?: boolean;

  // Validations
  maxInputSizeMB?: number;
  maxOutputSizeKB?: number;
  jpegQuality?: number;
  acceptedFormats?: string;

  // UI
  previewWidth?: number;
  previewHeight?: number;
}

/**
 * Preset configurations for common use cases
 */
export type ImageUploaderPreset = 'logo' | 'custom';

/**
 * Predefined presets for common image upload scenarios
 * Uses IMAGE_PRESETS from imageProcessing.ts as single source of truth.
 * 
 * Available presets:
 * - 'logo': Square logo with crop (200x200px, 5MB input, 500KB output)
 * - 'custom': Empty preset for fully customized configuration
 * 
 * Future presets can be added here:
 * - 'avatar': Circular profile picture (128x128px, 2MB input, 200KB output)
 * - 'banner': Rectangular banner (1200x400px, 10MB input, 1MB output)
 * - 'image': General image without crop (variable size, 5MB input, 2MB output)
 */
const PRESETS: Record<ImageUploaderPreset, ImageUploaderConfig> = {
  logo: {
    outputWidth: IMAGE_CONSTANTS.PRESETS.LOGO.sizePx,
    outputHeight: IMAGE_CONSTANTS.PRESETS.LOGO.sizePx,
    aspectRatio: IMAGE_CONSTANTS.PRESETS.LOGO.aspectRatio,
    cropShape: 'rect',
    enableCrop: true,
    maxInputSizeMB: IMAGE_CONSTANTS.PRESETS.LOGO.maxInputSizeMB,
    maxOutputSizeKB: IMAGE_CONSTANTS.PRESETS.LOGO.maxOutputSizeKB,
    jpegQuality: IMAGE_CONSTANTS.PRESETS.LOGO.jpegQuality,
    previewWidth: IMAGE_CONSTANTS.PRESETS.LOGO.sizePx,
    previewHeight: IMAGE_CONSTANTS.PRESETS.LOGO.sizePx,
  },
  custom: {},
};

/**
 * Props for ImageUploader component
 */
export interface ImageUploaderProps {
  preset?: ImageUploaderPreset;
  config?: Partial<ImageUploaderConfig>;
  onFileSelect?: (file: File) => void;
  onCropComplete?: (imageBase64: string) => void;
  onUpload?: (imageBase64: string) => Promise<void>;
  onRemove?: () => void;
  onError?: (error: string) => void;
  currentImageUrl?: string;
  disabled?: boolean;
  showUploadButton?: boolean;
  testId?: string;
}

/**
 * Generic image uploader component with crop functionality
 * Supports presets for common use cases and custom configuration
 */
export const ImageUploader: React.FC<ImageUploaderProps> = ({
  preset = 'logo',
  config = {},
  onFileSelect,
  onCropComplete,
  onUpload,
  onRemove,
  onError,
  currentImageUrl,
  disabled = false,
  showUploadButton = false,
  testId = 'image-uploader',
}) => {
  const { openModal } = useUI();
  
  // Merge configuration: IMAGE_CONSTANTS → preset → config override
  const finalConfig: Required<ImageUploaderConfig> = useMemo(() => {
    const presetConfig = PRESETS[preset] || {};
    return {
      outputWidth: config.outputWidth ?? presetConfig.outputWidth ?? IMAGE_CONSTANTS.LOGO_SIZE_PX,
      outputHeight:
        config.outputHeight ?? presetConfig.outputHeight ?? IMAGE_CONSTANTS.LOGO_SIZE_PX,
      aspectRatio: config.aspectRatio ?? presetConfig.aspectRatio ?? 1,
      cropShape: config.cropShape ?? presetConfig.cropShape ?? 'rect',
      enableCrop: config.enableCrop ?? presetConfig.enableCrop ?? false,
      maxInputSizeMB:
        config.maxInputSizeMB ?? presetConfig.maxInputSizeMB ?? IMAGE_CONSTANTS.MAX_INPUT_SIZE_MB,
      maxOutputSizeKB:
        config.maxOutputSizeKB ??
        presetConfig.maxOutputSizeKB ??
        IMAGE_CONSTANTS.MAX_OUTPUT_SIZE_KB,
      jpegQuality:
        config.jpegQuality ?? presetConfig.jpegQuality ?? IMAGE_CONSTANTS.JPEG_QUALITY,
      acceptedFormats:
        config.acceptedFormats ??
        presetConfig.acceptedFormats ??
        IMAGE_CONSTANTS.ACCEPTED_FILE_TYPES,
      previewWidth: config.previewWidth ?? presetConfig.previewWidth ?? 200,
      previewHeight: config.previewHeight ?? presetConfig.previewHeight ?? 200,
    };
  }, [config, preset]);

  // State
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const fileInputReference = useRef<HTMLInputElement>(null);

  // File selection handler
  const handleFileInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setImageError(null);

      // Validate file
      const validation = validateLogoFile(file);
      if (!validation.isValid) {
        setImageError(validation.error || 'Archivo no válido');
        if (onError) onError(validation.error || 'Archivo no válido');
        return;
      }

      // Notify parent
      if (onFileSelect) {
        onFileSelect(file);
      }

      try {
        const dataUrl = await fileToDataURL(file);

        if (finalConfig.enableCrop) {
          // Open modal for cropping
          openModal(
            'ImageCropModal',
            {
              imageSrc: dataUrl,
              config: finalConfig,
              onCropComplete: (croppedBase64: string) => {
                setCroppedImageUrl(croppedBase64);
                if (onCropComplete) {
                  onCropComplete(croppedBase64);
                }
              },
              onError: (errorMessage: string) => {
                setImageError(errorMessage);
                if (onError) onError(errorMessage);
              },
            },
            true,
          );
        } else {
          // If crop is disabled, use the image directly
          setCroppedImageUrl(dataUrl);
          if (onCropComplete) {
            onCropComplete(dataUrl);
          }
        }
      } catch {
        const errorMessage = 'Error al procesar la imagen';
        setImageError(errorMessage);
        if (onError) onError(errorMessage);
      }
    },
    [finalConfig, onFileSelect, onCropComplete, onError, openModal],
  );

  const handleSelectFileClick = () => {
    fileInputReference.current?.click();
  };

  const handleRemoveImage = () => {
    setCroppedImageUrl(null);
    setImageError(null);
    if (fileInputReference.current) {
      fileInputReference.current.value = '';
    }
    if (onRemove) {
      onRemove();
    }
  };

  const handleUploadClick = async () => {
    if (!croppedImageUrl || !onUpload) return;

    setIsUploading(true);
    setImageError(null);

    try {
      await onUpload(croppedImageUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al subir la imagen';
      setImageError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Determine which image to display
  const displayImageUrl = croppedImageUrl || currentImageUrl;
  const hasImage = !!displayImageUrl;

  return (
    <div className="flex flex-col gap-4" data-testid={testId}>
      {/* Image Preview */}
      <div className="flex items-start gap-6">
        {/* Image Display */}
        <div
          className={`flex-shrink-0 border-2 border-dashed rounded-lg overflow-hidden flex items-center justify-center ${
            finalConfig.cropShape === 'round' ? 'rounded-full' : ''
          }`}
          style={{
            borderColor: colors.grays.neutralCC,
            backgroundColor: colors.grays.neutralFA,
            width: `${finalConfig.previewWidth}px`,
            height: `${finalConfig.previewHeight}px`,
          }}
          data-testid={`${testId}-preview-container`}
        >
          {hasImage ? (
            <img
              src={displayImageUrl}
              alt="Imagen"
              className={`w-full h-full object-contain ${finalConfig.cropShape === 'round' ? 'rounded-full' : ''}`}
              data-testid={`${testId}-preview-image`}
            />
          ) : (
            <div className="text-center p-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                stroke={colors.grays.neutral99}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <Text variant="small-regular" color={colors.grays.neutral99} className="mt-2">
                Sin imagen
              </Text>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col gap-3">
          {/* File Input (Hidden) */}
          <input
            ref={fileInputReference}
            type="file"
            accept={finalConfig.acceptedFormats}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled || isUploading}
            data-testid={`${testId}-file-input`}
          />

          {/* Select Button */}
          <PrimaryButton
            type="button"
            variant="outline"
            onClick={handleSelectFileClick}
            disabled={disabled || isUploading}
            data-testid={`${testId}-select-button`}
          >
            Seleccionar imagen
          </PrimaryButton>

          {/* Upload Button (conditional) */}
          {showUploadButton && croppedImageUrl && onUpload && (
            <PrimaryButton
              type="button"
              onClick={handleUploadClick}
              isLoading={isUploading}
              disabled={disabled}
              data-testid={`${testId}-upload-button`}
            >
              {isUploading ? 'Subiendo...' : 'Guardar'}
            </PrimaryButton>
          )}

          {/* Remove Button */}
          {(croppedImageUrl || currentImageUrl) && !isUploading && (
            <PrimaryButton
              type="button"
              variant="outline"
              onClick={handleRemoveImage}
              disabled={disabled}
              data-testid={`${testId}-remove-button`}
            >
              Quitar
            </PrimaryButton>
          )}

          {/* Info Text */}
          <div className="flex flex-col gap-1">
            <Text variant="small-regular" color={colors.grays.neutral66}>
              Formatos admitidos: {finalConfig.acceptedFormats.replace(/\./g, '').toUpperCase()}
            </Text>
            <Text variant="small-regular" color={colors.grays.neutral66}>
              Tamaño máximo de entrada: {finalConfig.maxInputSizeMB}MB
            </Text>
            {finalConfig.enableCrop && (
              <>
                <Text variant="small-regular" color={colors.grays.neutral66}>
                  Tamaño máximo de salida: {finalConfig.maxOutputSizeKB}KB
                </Text>
                <Text variant="small-regular" color={colors.grays.neutral66}>
                  Dimensiones: {finalConfig.outputWidth}x{finalConfig.outputHeight} píxeles (calidad{' '}
                  {finalConfig.jpegQuality * 100}%)
                </Text>
              </>
            )}
          </div>

          {/* Error Message */}
          {imageError && (
            <div
              className="p-3 rounded-lg border"
              style={{
                backgroundColor: colors.feedback.error100,
                borderColor: colors.feedback.error300,
              }}
              data-testid={`${testId}-error-message`}
            >
              <Text variant="small-regular" color={colors.feedback.error400}>
                {imageError}
              </Text>
            </div>
          )}

          {/* Success Message */}
          {currentImageUrl && !croppedImageUrl && !imageError && (
            <div
              className="p-3 rounded-lg border"
              style={{
                backgroundColor: colors.feedback.success100,
                borderColor: colors.feedback.success200,
              }}
              data-testid={`${testId}-success-message`}
            >
              <Text variant="small-regular" color={colors.feedback.success400}>
                Imagen guardada correctamente
              </Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
