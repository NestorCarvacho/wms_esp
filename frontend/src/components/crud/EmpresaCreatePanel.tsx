import { useState, type FormEvent } from 'react';
import { crearEmpresa } from '@/api/empresas';
import { LabelInput } from '@/components/ui/inputs';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import { CrudPanelFooter } from './CrudPanelFooter';
import { DireccionSelector } from '@/components/DireccionSelector';
import { formatRut, rutError } from '@/utils/rut';

export interface EmpresaCreatePanelProps {
  onSaved?: () => void;
}

export function EmpresaCreatePanel({ onSaved }: EmpresaCreatePanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const [codigo, setCodigo] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [nombreFantasia, setNombreFantasia] = useState('');
  const [rut, setRut] = useState('');
  const [giro, setGiro] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [sitioWeb, setSitioWeb] = useState('');
  const [direccionData, setDireccionData] = useState<{
    direccion?: string | null;
    region_id?: number | null;
    ciudad_id?: number | null;
    comuna_id?: number | null;
  }>({});
  const [rutValidationError, setRutValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const rutErr = rutError(rut);
    if (rutErr) { setRutValidationError(rutErr); return; }
    setSubmitting(true);
    try {
      await crearEmpresa({
        codigo: codigo.trim(),
        razon_social: razonSocial.trim(),
        nombre_fantasia: nombreFantasia.trim() || null,
        rut: rut.trim() || null,
        giro: giro.trim() || null,
        telefono: telefono.trim() || null,
        correo: correo.trim() || null,
        sitio_web: sitioWeb.trim() || null,
        ...direccionData,
      });
      showNotification({ type: 'success', message: 'Empresa creada correctamente' });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al crear empresa',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <LabelInput id="create-codigo"       label="Código"          value={codigo}        onChange={setCodigo}        required />
      <LabelInput id="create-razon-social" label="Razón social"    value={razonSocial}   onChange={setRazonSocial}   required />
      <LabelInput id="create-fantasia"     label="Nombre de fantasía" value={nombreFantasia} onChange={setNombreFantasia} />
      <LabelInput
        id="create-rut"
        label="RUT"
        value={rut}
        onChange={(v) => { setRut(v); setRutValidationError(rutError(v)); }}
        onBlur={() => { if (rut) setRut(formatRut(rut)); }}
        placeholder="12.345.678-9"
        hasError={!!rutValidationError}
        errorMessage={rutValidationError ?? ''}
      />
      <LabelInput id="create-giro"         label="Giro"            value={giro}          onChange={setGiro} />
      <LabelInput id="create-telefono"     label="Teléfono"        value={telefono}      onChange={setTelefono}       placeholder="+56222345678" />
      <LabelInput id="create-correo"       label="Correo"          value={correo}        onChange={setCorreo}         placeholder="contacto@empresa.cl" />
      <LabelInput id="create-web"          label="Sitio web"       value={sitioWeb}      onChange={setSitioWeb}       placeholder="https://empresa.cl" />

      <div className="border-t pt-4">
        <DireccionSelector value={direccionData} onChange={setDireccionData} disabled={submitting} />
      </div>

      <CrudPanelFooter submitting={submitting} submitLabel="Guardar empresa" />
    </form>
  );
}
