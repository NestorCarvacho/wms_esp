import { useState, type FormEvent } from 'react';
import { actualizarEmpresa } from '@/api/empresas';
import { LabelInput } from '@/components/ui/inputs';
import { PrimaryButton } from '@/components/ui/buttons';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import type { Empresa } from '@/types/api';
import { formatRut, rutError } from '@/utils/rut';
import { DireccionSelector } from '@/components/DireccionSelector';

export interface EmpresaEditPanelProps {
  empresa: Empresa;
  onSaved?: () => void;
}

export function EmpresaEditPanel({ empresa, onSaved }: EmpresaEditPanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const [razonSocial,    setRazonSocial]    = useState(empresa.razon_social);
  const [nombreFantasia, setNombreFantasia] = useState(empresa.nombre_fantasia ?? '');
  const [rut,            setRut]            = useState(empresa.rut ?? '');
  const [giro,           setGiro]           = useState(empresa.giro ?? '');
  const [telefono,       setTelefono]       = useState(empresa.telefono ?? '');
  const [correo,         setCorreo]         = useState(empresa.correo ?? '');
  const [sitioWeb,       setSitioWeb]       = useState(empresa.sitio_web ?? '');
  const [estaActiva,     setEstaActiva]     = useState(Boolean(empresa.esta_activa));
  const [direccionData,  setDireccionData]  = useState<{
    direccion?: string | null;
    region_id?: number | null;
    ciudad_id?: number | null;
    comuna_id?: number | null;
  }>({
    direccion: empresa.direccion ?? null,
    region_id: empresa.region_id ?? null,
    ciudad_id: empresa.ciudad_id ?? null,
    comuna_id: empresa.comuna_id ?? null,
  });
  const [rutValidationError, setRutValidationError] = useState<string | null>(null);
  const [locale, setLocale] = useState(empresa.locale ?? 'es-CL');
  const [timezone, setTimezone] = useState(empresa.timezone ?? 'America/Santiago');
  const [monedaCodigo, setMonedaCodigo] = useState(empresa.moneda_codigo ?? 'CLP');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const rutErr = rutError(rut);
    if (rutErr) { setRutValidationError(rutErr); return; }
    setSubmitting(true);
    try {
      await actualizarEmpresa(empresa.id, {
        razon_social:    razonSocial.trim(),
        nombre_fantasia: nombreFantasia.trim() || null,
        rut:             rut.trim() || null,
        giro:            giro.trim() || null,
        telefono:        telefono.trim() || null,
        correo:          correo.trim() || null,
        sitio_web:       sitioWeb.trim() || null,
        esta_activa:     estaActiva,
        locale,
        timezone,
        moneda_codigo:   monedaCodigo,
        ...direccionData,
      });
      showNotification({
        type: 'success',
        message: estaActiva ? 'Empresa actualizada correctamente' : 'Empresa inhabilitada',
      });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al actualizar empresa',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <LabelInput id="edit-codigo"       label="Código"          value={empresa.codigo}  onChange={() => undefined}  disabled />
      <LabelInput id="edit-razon-social" label="Razón social"    value={razonSocial}     onChange={setRazonSocial}   required />
      <LabelInput id="edit-fantasia"     label="Nombre de fantasía" value={nombreFantasia} onChange={setNombreFantasia} />
      <LabelInput
        id="edit-rut"
        label="RUT"
        value={rut}
        onChange={(v) => { setRut(v); setRutValidationError(rutError(v)); }}
        onBlur={() => { if (rut) setRut(formatRut(rut)); }}
        placeholder="12.345.678-9"
        hasError={!!rutValidationError}
        errorMessage={rutValidationError ?? ''}
      />
      <LabelInput id="edit-giro"         label="Giro"            value={giro}            onChange={setGiro} />
      <LabelInput id="edit-telefono"     label="Teléfono"        value={telefono}        onChange={setTelefono}       placeholder="+56222345678" />
      <LabelInput id="edit-correo"       label="Correo"          value={correo}          onChange={setCorreo}         placeholder="contacto@empresa.cl" />
      <LabelInput id="edit-web"          label="Sitio web"       value={sitioWeb}        onChange={setSitioWeb}       placeholder="https://empresa.cl" />

      <div className="border-t pt-4">
        <p className="mb-3 text-sm font-medium">Regionalización</p>
        <div className="grid gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span>Idioma / locale</span>
            <select value={locale} onChange={(e) => setLocale(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2">
              <option value="es-CL">Español (Chile)</option>
              <option value="es-MX">Español (México)</option>
              <option value="en-US">English (US)</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Zona horaria</span>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2">
              <option value="America/Santiago">America/Santiago</option>
              <option value="America/Mexico_City">America/Mexico_City</option>
              <option value="America/New_York">America/New_York</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Moneda</span>
            <select value={monedaCodigo} onChange={(e) => setMonedaCodigo(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2">
              <option value="CLP">CLP — Peso chileno</option>
              <option value="MXN">MXN — Peso mexicano</option>
              <option value="USD">USD — Dólar</option>
            </select>
          </label>
        </div>
      </div>

      <div className="border-t pt-4">
        <DireccionSelector value={direccionData} onChange={setDireccionData} disabled={submitting} />
      </div>

      {empresa.es_empresa_maestra ? (
        <p className="text-sm text-muted-foreground">La empresa maestra permanece siempre activa.</p>
      ) : (
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={estaActiva}
            onChange={(e) => setEstaActiva(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Empresa activa (operativa en listados y login de sus usuarios)
        </label>
      )}

      <div className="flex gap-3 pt-2">
        <PrimaryButton type="button" variant="outline" onClick={closeSidePanel}>Cancelar</PrimaryButton>
        <PrimaryButton type="submit" colorVariant="success" isLoading={submitting}>Guardar</PrimaryButton>
      </div>
    </form>
  );
}
