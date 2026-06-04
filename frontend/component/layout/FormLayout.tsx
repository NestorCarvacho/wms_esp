import React, { type FormEvent, type ReactNode, createContext, useContext } from 'react';
import { Text } from '@/components/ui/text/Text';
import { colorClass } from '@/assets/styles/colors';


// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface FormLayoutProps {
  onSubmit: (event: FormEvent) => void;
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

interface FormLayoutSectionProps {
  title: string;
  children: ReactNode;
}

interface FormLayoutFooterProps {
  cancelButton?: ReactNode;
  secondaryButton?: ReactNode;
  primaryButton?: ReactNode;
}

interface FormLayoutContextValue {
  columns: 1 | 2 | 3 | 4;
}

// ============================================================================
// CONTEXT
// ============================================================================

const FormLayoutContext = createContext<FormLayoutContextValue>({ columns: 2 });

const useFormLayoutContext = () => {
  const context = useContext(FormLayoutContext);
  if (!context) {
    throw new Error('FormLayout compound components must be used within FormLayout');
  }
  return context;
};


// ============================================================================
// COMPOUND COMPONENTS
// ============================================================================

/**
 * FormLayout.Section - Section with title and grid layout
 * 
 * @description
 * Renders a titled section with a responsive grid layout.
 * Inherits column configuration from parent FormLayout.
 * Use multiple sections to organize forms into logical groups.
 * 
 * @example
 * <FormLayout columns={3}>
 *   <FormLayout.Section title="Datos personales">
 *     <LabelInput label="Nombre" />
 *     <LabelInput label="Apellido" />
 *     <DatePicker label="Fecha de nacimiento" />
 *   </FormLayout.Section>
 * </FormLayout>
 */
const FormLayoutSection: React.FC<FormLayoutSectionProps> = ({
  title,
  children,
}) => {
  const { columns } = useFormLayoutContext();
  
  const gridColsClass = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }[columns];

  return (
    <>
      <Text variant="body-medium" className={colorClass.brandLight}>
        {title}
      </Text>
      <div className={`grid grid-cols-1 ${gridColsClass} gap-6`}>
        {children}
      </div>
    </>
  );
};

/**
 * FormLayout.Footer - Adaptive footer with buttons
 * 
 * @description
 * Renders form action buttons with auto-adaptive layout:
 * - 1 or 2 buttons: Grouped and centered with gap-6
 * - 3 buttons: Cancel separated 56px from secondary+primary group (gap-6)
 * 
 * @example
 * <FormLayout.Footer
 *   cancelButton={<PrimaryButton variant="outline">Cancelar</PrimaryButton>}
 *   primaryButton={<PrimaryButton type="submit">Guardar</PrimaryButton>}
 * />
 * 
 * @example
 * // Wizard navigation
 * <FormLayout.Footer
 *   cancelButton={<PrimaryButton variant="outline">Cancelar</PrimaryButton>}
 *   secondaryButton={<PrimaryButton variant="outline">Anterior</PrimaryButton>}
 *   primaryButton={<PrimaryButton>Siguiente</PrimaryButton>}
 * />
 */
const FormLayoutFooter: React.FC<FormLayoutFooterProps> = ({
  cancelButton,
  secondaryButton,
  primaryButton,
}) => {
  const buttons = [cancelButton, secondaryButton, primaryButton].filter(Boolean);
  const totalButtons = buttons.length;

  if (totalButtons === 0) return null;

  // Case: 3 buttons → cancel separated 56px from secondary+primary group
  if (totalButtons === 3) {
    return (
      <div className="flex justify-center items-center">
        {cancelButton}
        <div className="w-14" /> {/* 56px spacer (gap-14 = 3.5rem = 56px) */}
        <div className="flex gap-6">
          {secondaryButton}
          {primaryButton}
        </div>
      </div>
    );
  }

  // Cases: 1 or 2 buttons → all grouped with gap-6, centered
  return (
    <div className="flex gap-6 justify-center">
      {cancelButton}
      {secondaryButton}
      {primaryButton}
    </div>
  );
};


// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * FormLayout - Layout wrapper for forms with sections and footer buttons
 * 
 * @description
 * Form layout component using Compound Components pattern.
 * Use `FormLayout.Section` for titled sections and `FormLayout.Footer` for action buttons.
 * Define columns at FormLayout level for consistency across all sections.
 * 
 * @example
 * // Multiple sections sharing same column configuration
 * <FormLayout onSubmit={handleSubmit} columns={3}>
 *   <FormLayout.Section title="Datos personales">
 *     <LabelInput label="RUT" />
 *     <LabelInput label="Nombre" />
 *     <DatePicker label="Fecha nacimiento" />
 *   </FormLayout.Section>
 *   
 *   <FormLayout.Section title="Estado civil">
 *     <ComboBox label="Género" options={genderOptions} />
 *     <ComboBox label="Estado civil" options={maritalOptions} />
 *     <div aria-hidden="true" className="hidden md:block" />
 *   </FormLayout.Section>
 *   
 *   <FormLayout.Footer
 *     cancelButton={<PrimaryButton variant="outline">Cancelar</PrimaryButton>}
 *     primaryButton={<PrimaryButton type="submit">Guardar</PrimaryButton>}
 *   />
 * </FormLayout>
 * 
 * @example
 * // Single section form with 2 columns (default)
 * <FormLayout onSubmit={handleSubmit}>
 *   <FormLayout.Section title="Datos de contacto">
 *     <LabelInput label="Email" />
 *     <LabelInput label="Teléfono" />
 *   </FormLayout.Section>
 *   
 *   <FormLayout.Footer
 *     cancelButton={<PrimaryButton variant="outline">Cancelar</PrimaryButton>}
 *     primaryButton={<PrimaryButton type="submit">Guardar</PrimaryButton>}
 *   />
 * </FormLayout>
 */
export const FormLayout: React.FC<FormLayoutProps> & {
  Section: typeof FormLayoutSection;
  Footer: typeof FormLayoutFooter;
} = ({
  onSubmit,
  children,
  columns = 2,
  className = '',
}) => (
  <FormLayoutContext.Provider value={{ columns }}>
    <form 
      className={`flex flex-col gap-6 ${className}`}
      onSubmit={onSubmit}
    >
      {children}
    </form>
  </FormLayoutContext.Provider>
);

// Attach subcomponents as static properties
FormLayout.Section = FormLayoutSection;
FormLayout.Footer = FormLayoutFooter;

export default FormLayout;
