import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { companyService } from '@/api/domains/company';
import {
  validateLogoFile,
  fileToDataURL,
  validateCroppedImageSize,
} from '@/utils/imageProcessing';


export interface UseCompanyLogoProps {
  companyId?: number;
  currentLogoUrl?: string | null;
  onLogoUpdated?: (logoUrl: string) => void;
  onError?: (error: string) => void;
}

export interface UseCompanyLogoReturn {
  // State
  logoFile: File | null;
  logoPreviewUrl: string | null;
  croppedLogoUrl: string | null;
  isModalOpen: boolean;
  isUploading: boolean;
  uploadError: string | null;
  currentLogoUrl: string | null;

  // Actions
  handleFileSelect: (file: File | null) => void;
  openCropModal: () => void;
  closeCropModal: () => void;
  handleCropComplete: (croppedImageUrl: string) => void;
  handleUpload: () => Promise<void>;
  resetLogo: () => void;
}

/**
 * Hook for managing company logo upload with cropping functionality
 */
export function useCompanyLogo({
  companyId,
  currentLogoUrl,
  onLogoUpdated,
  onError,
}: UseCompanyLogoProps): UseCompanyLogoReturn {
  const { t: translate } = useTranslation();

  // State for file selection and preview
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [croppedLogoUrl, setCroppedLogoUrl] = useState<string | null>(null);
  const [currentLogo, setCurrentLogo] = useState<string | null>(currentLogoUrl || null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  /**
   * Handles file selection from input
   * Validates file and converts to data URL for preview
   */
  const handleFileSelect = useCallback(async (file: File | null) => {
    // Reset state
    setUploadError(null);
    setCroppedLogoUrl(null);

    if (!file) {
      setLogoFile(null);
      setLogoPreviewUrl(null);
      return;
    }

    // Validate file
    const validation = validateLogoFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error || translate('company:logo.errors.invalidFile'));
      if (onError) {
        onError(validation.error || translate('company:logo.errors.invalidFile'));
      }
      return;
    }

    // Convert to data URL for preview
    try {
      const dataUrl = await fileToDataURL(file);
      setLogoFile(file);
      setLogoPreviewUrl(dataUrl);
      setIsModalOpen(true); // Auto-open crop modal
    } catch {
      const errorMessage = translate('company:logo.errors.processingFailed');
      setUploadError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [onError, translate]);

  /**
   * Opens the crop modal
   */
  const openCropModal = useCallback(() => {
    if (logoPreviewUrl) {
      setIsModalOpen(true);
    }
  }, [logoPreviewUrl]);

  /**
   * Closes the crop modal
   */
  const closeCropModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  /**
   * Handles crop completion
   * Validates the cropped image size before setting
   */
  const handleCropComplete = useCallback((croppedImageUrl: string) => {
    // Validate cropped image size
    const validation = validateCroppedImageSize(croppedImageUrl);
    if (!validation.isValid) {
      setUploadError(validation.error || translate('company:logo.errors.croppedTooLarge'));
      if (onError) {
        onError(validation.error || translate('company:logo.errors.croppedTooLarge'));
      }
      return;
    }

    setCroppedLogoUrl(croppedImageUrl);
    setIsModalOpen(false);
    setUploadError(null);
  }, [onError, translate]);

  /**
   * Uploads the cropped logo to the server
   */
  const handleUpload = useCallback(async () => {
    if (!companyId) {
      const error = translate('company:logo.errors.noCompanyId');
      setUploadError(error);
      if (onError) {
        onError(error);
      }
      return;
    }

    if (!croppedLogoUrl) {
      const error = translate('company:logo.errors.noCroppedImage');
      setUploadError(error);
      if (onError) {
        onError(error);
      }
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await companyService.updateLogo(companyId, croppedLogoUrl);

      if (result.success && result.logoUrl) {
        // Update current logo URL
        setCurrentLogo(result.logoUrl);
        
        // Reset upload state
        setLogoFile(null);
        setLogoPreviewUrl(null);
        setCroppedLogoUrl(null);

        // Notify parent component
        if (onLogoUpdated) {
          onLogoUpdated(result.logoUrl);
        }
      } else {
        const errorMsg = result.error || result.message || translate('company:logo.errors.uploadFailed');
        setUploadError(errorMsg);
        if (onError) {
          onError(errorMsg);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : translate('company:logo.errors.unknownError');
      setUploadError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  }, [companyId, croppedLogoUrl, onLogoUpdated, onError, translate]);

  /**
   * Resets the logo upload state
   */
  const resetLogo = useCallback(() => {
    setLogoFile(null);
    setLogoPreviewUrl(null);
    setCroppedLogoUrl(null);
    setUploadError(null);
    setIsModalOpen(false);
  }, []);

  return {
    // State
    logoFile,
    logoPreviewUrl,
    croppedLogoUrl,
    isModalOpen,
    isUploading,
    uploadError,
    currentLogoUrl: currentLogo,

    // Actions
    handleFileSelect,
    openCropModal,
    closeCropModal,
    handleCropComplete,
    handleUpload,
    resetLogo,
  };
}
