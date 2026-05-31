import React from 'react';
import { Text } from '@/components/ui/text/Text';
import { IconScout } from '@/components/ui/images/IconScout';
import { colors } from '@/assets/styles/colors';


interface WizardStep {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface WizardProps {
  steps: WizardStep[];
  currentStep: number; // 0-indexed
  completedSteps?: Set<number>;
  onStepChange?: (stepIndex: number) => void;
  className?: string;
}

export const Wizard: React.FC<WizardProps> = ({
  steps,
  currentStep,
  completedSteps = new Set(),
  onStepChange,
  className = '',
}) => {
  const getStepStatus = (index: number): 'completed' | 'current' | 'pending' => {
    if (completedSteps.has(index)) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.primary.main;
      case 'current':
        return colors.primary.main;
      case 'pending':
        return colors.grays.neutralCC;
      default:
        return colors.grays.neutralCC;
    }
  };

  const handleStepClick = (index: number) => {
    // Solo permite navegar a pasos completados o anteriores al actual
    if (completedSteps.has(index) || index < currentStep) {
      onStepChange?.(index);
    }
  };

  return (
    <div className={className} data-testid="wizard">
      {/* Step Indicators */}
      <div className="flex items-start justify-center mb-8">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const stepColor = getStepColor(status);
          const isClickable = completedSteps.has(index) || index < currentStep;
          
          return (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <div
                className="flex flex-col items-center w-[120px]"
                onClick={() => isClickable && handleStepClick(index)}
                style={{ 
                  cursor: isClickable ? 'pointer' : 'default',
                  opacity: status === 'pending' && index > currentStep ? 0.5 : 1,
                }}
                data-testid={`wizard-step-${index}`}
                aria-current={status === 'current' ? 'step' : undefined}
              >
                {/* Circle with number or checkmark */}
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 mb-1"
                  style={{
                    backgroundColor: status === 'current' ? stepColor : 'transparent',
                    border: `2px solid ${stepColor}`,
                  }}
                  data-testid={`wizard-step-circle-${index}`}
                >
                  {status === 'completed' ? (
                    <IconScout
                      name="check"
                      size={20}
                      color={stepColor}
                    />
                  ) : (
                    <Text
                      variant="subheader-medium"
                      color={status === 'current' ? colors.grays.neutralFF : stepColor}
                    >
                      {index + 1}
                    </Text>
                  )}
                </div>

                {/* Step Label */}
                <Text
                  variant="body-regular"
                  color={stepColor}
                  className="mt-2 text-center w-full break-words"
                >
                  {step.label}
                </Text>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-2"
                  style={{
                    backgroundColor: completedSteps.has(index)
                      ? colors.primary.main
                      : colors.grays.neutralE5,
                    maxWidth: '80px',
                    minWidth: '20px',
                    marginTop: '20px', // Align with center of circle (40px height / 2)
                  }}
                  data-testid={`wizard-connector-${index}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="wizard-content" role="region" aria-live="polite">
        {steps[currentStep]?.content}
      </div>
    </div>
  );
};

export default Wizard;
