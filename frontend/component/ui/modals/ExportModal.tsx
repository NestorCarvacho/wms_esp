import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton.tsx';
import { IconScout, type IconScoutName } from '@/components/ui/images/IconScout.tsx';
import { Card } from '@/components/ui/cards/Card.tsx';
import { Text } from '@/components/ui/text/Text.tsx';
import { colors } from '@/assets/styles/colors.ts';


interface ExportFormat {
  value: 'EXCEL' | 'PDF' | 'WORD';
  label: string;
  icon: IconScoutName;
}

type ExportFormatType = 'EXCEL' | 'PDF' | 'WORD';

interface ExportModalProps {
  onExport: (format: ExportFormatType) => void;
  onClose: () => void;
  availableFormats?: ExportFormatType[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ 
  onExport, 
  onClose,
  availableFormats = ['EXCEL', 'PDF', 'WORD'],
}) => {
  const { t: translate } = useTranslation();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormatType | null>(null);

  const allFormats: ExportFormat[] = [
    { value: 'EXCEL', label: translate('attendance:monthly.export.excel'), icon: 'table' },
    { value: 'PDF', label: translate('attendance:monthly.export.pdf'), icon: 'documentInfo' },
    { value: 'WORD', label: translate('attendance:monthly.export.word'), icon: 'fileAlt' },
  ];

  const formats = allFormats.filter(format => availableFormats.includes(format.value));

  const handleExport = () => {
    if (selectedFormat) {
      onExport(selectedFormat);
      onClose();
    }
  };

  return (
    <Card
      elevation={2}
      padding="24px"
      borderRadius="16px"
      data-testid="export-modal"
      className="flex flex-col gap-y-4 max-w-[370px]"
    >
      <div className="flex flex-col gap-2 mb-6">
        <Text variant="header-6">
          {translate('attendance:monthly.export.title')}
        </Text>
        <Text variant="body-regular" color={colors.grays.neutral66}>
          {translate('attendance:monthly.export.selectFormat')}
        </Text>
      </div>
      <div className="space-y-3 mb-6">
        {formats.map((format) => (
          <div
            key={format.value}
            onClick={() => setSelectedFormat(format.value)}
            data-testid={`format-${format.value.toLowerCase()}`}
          >
            <Card
              className="cursor-pointer p-4 transition-all"
              style={{
                borderWidth: selectedFormat === format.value ? '2px' : '1px',
                borderColor:
                  selectedFormat === format.value
                    ? colors.primary.main
                    : colors.grays.neutralE5,
                backgroundColor:
                  selectedFormat === format.value
                    ? colors.primary.background100
                    : colors.grays.neutralFF,
              }}
            >
              <div className="flex items-center gap-3">
                <IconScout name={format.icon} size={24} />
                <Text variant="body-medium">{format.label}</Text>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-end">
        <PrimaryButton
          type="button"
          onClick={onClose}
          variant="outline"
        >
          {translate('attendance:monthly.export.cancel')}
        </PrimaryButton>
        <PrimaryButton 
          onClick={handleExport} 
          disabled={!selectedFormat}
          iconLeft={<IconScout name="export" />}
        >
          {translate('attendance:monthly.export.download')}
        </PrimaryButton>
      </div>
    </Card>
  );
};
