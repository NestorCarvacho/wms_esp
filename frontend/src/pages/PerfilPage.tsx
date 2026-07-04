import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { actualizarPerfilUsuario, actualizarUsuario, obtenerUsuario } from '@/api/usuarios';
import { cambiarContrasena, setStoredUser } from '@/api/auth';
import { PageLayout } from '@/components/layout/PageLayout';
import { FormLayout } from '@/components/layout/FormLayout';
import { LabelInput } from '@/components/ui/inputs';
import { ComboBox } from '@/components/ui/inputs/ComboBox';
import { PrimaryButton } from '@/components/ui/buttons';
import { Text } from '@/components/ui/text/Text';
import { useAuthContext } from '@/context/AuthContext';
import { ApiError } from '@/api/client';
import { colorClass } from '@/assets/styles/colors';
import { useUI } from '@/hooks/ui';
import type { PerfilUsuarioActualizar } from '@/types/api';
import { appPath } from '@/routes/paths';
import { DireccionSelector } from '@/components/DireccionSelector';
import { formatRut, rutError } from '@/utils/rut';

const GENERO_OPTIONS = [
  { label: 'Masculino', value: 'M' },
  { label: 'Femenino', value: 'F' },
  { label: 'Otro', value: 'Otro' },
];

function toDateInputValue(value?: string | null): string {
  if (!value) return '';
  return value.slice(0, 10);
}

function emptyIfBlank(value: string): string | null {
  const trimmed = value.trim();
  return trimmed || null;
}

export function PerfilPage() {
  const navigate = useNavigate();
  const { user, isSuperAdmin, roles } = useAuthContext();
  const { showNotification } = useUI();
  const canEditEmail = isSuperAdmin || roles.includes('Administrador');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rutValidationError, setRutValidationError] = useState<string | null>(null);
  const [initialEmail, setInitialEmail] = useState('');

  const [email, setEmail] = useState('');
  const [empresaNombre, setEmpresaNombre] = useState('');
  const [cargoNombre, setCargoNombre] = useState('');
  const [rut, setRut] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [genero, setGenero] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccionData, setDireccionData] = useState<{
    direccion?: string | null;
    region_id?: number | null;
    ciudad_id?: number | null;
    comuna_id?: number | null;
  }>({});
  const [pais, setPais] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [biografia, setBiografia] = useState('');
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [contrasenaNueva, setContrasenaNueva] = useState('');
  const [contrasenaConfirmacion, setContrasenaConfirmacion] = useState('');

  const loadPerfil = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const datos = await obtenerUsuario(user.id);
      const perfil = datos.perfil;

      setInitialEmail(datos.email);
      setEmail(datos.email);
      setEmpresaNombre(datos.empresa_nombre ?? '');
      setCargoNombre(datos.cargo_nombre ?? '');
      setRut(perfil?.rut ?? '');
      setNombres(perfil?.nombres ?? '');
      setApellidoPaterno(perfil?.apellido_paterno ?? '');
      setApellidoMaterno(perfil?.apellido_materno ?? '');
      setFechaNacimiento(toDateInputValue(perfil?.fecha_nacimiento));
      setGenero(perfil?.genero ?? '');
      setTelefono(perfil?.telefono ?? '');
      setDireccionData({
        direccion: perfil?.direccion ?? null,
        region_id: perfil?.region_id ?? null,
        ciudad_id: perfil?.ciudad_id ?? null,
        comuna_id: perfil?.comuna_id ?? null,
      });
      setPais(perfil?.pais ?? 'Chile');
      setFotoUrl(perfil?.foto_url ?? '');
      setBiografia(perfil?.biografia ?? '');
    } catch (err) {
      showNotification({ type: 'error', message: err instanceof ApiError ? err.message : 'Error al cargar el perfil' });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadPerfil();
  }, [loadPerfil]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user?.id) return;

    const rutErr = rutError(rut);
    if (rutErr) { setRutValidationError(rutErr); return; }

    setSubmitting(true);

    try {
      if (canEditEmail && email.trim() !== initialEmail) {
        await actualizarUsuario(user.id, { email: email.trim() });
        setInitialEmail(email.trim());
        setStoredUser({ ...user, email: email.trim() });
      }

      const perfilPayload: PerfilUsuarioActualizar = {
        rut: emptyIfBlank(rut),
        nombres: emptyIfBlank(nombres),
        apellido_paterno: emptyIfBlank(apellidoPaterno),
        apellido_materno: emptyIfBlank(apellidoMaterno),
        fecha_nacimiento: fechaNacimiento || null,
        genero: emptyIfBlank(genero),
        telefono: emptyIfBlank(telefono),
        direccion: direccionData.direccion ?? null,
        region_id: direccionData.region_id ?? null,
        ciudad_id: direccionData.ciudad_id ?? null,
        comuna_id: direccionData.comuna_id ?? null,
        pais: emptyIfBlank(pais),
        foto_url: emptyIfBlank(fotoUrl),
        biografia: emptyIfBlank(biografia),
      };

      await actualizarPerfilUsuario(user.id, perfilPayload);

      if (contrasenaNueva.trim()) {
        if (!contrasenaActual.trim()) {
          throw new Error('Ingrese su contraseña actual para cambiarla');
        }
        if (contrasenaNueva !== contrasenaConfirmacion) {
          throw new Error('La confirmación de contraseña no coincide');
        }
        await cambiarContrasena(contrasenaActual, contrasenaNueva);
        setContrasenaActual('');
        setContrasenaNueva('');
        setContrasenaConfirmacion('');
      }

      showNotification({ type: 'success', message: 'Perfil actualizado correctamente' });
      await loadPerfil();
    } catch (err) {
      showNotification({ type: 'error', message: err instanceof ApiError ? err.message : 'Error al guardar el perfil' });
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <PageLayout
      routes={[{ text: 'Inicio', onClick: () => navigate(appPath()) }, { text: 'Mi perfil' }]}
      icon="user"
      supportingText="Datos de cuenta y perfil personal"
    >
      {loading ? (
        <Text variant="body-regular" className={colorClass.muted}>Cargando perfil…</Text>
      ) : (
        <FormLayout onSubmit={handleSubmit} columns={2}>
          <FormLayout.Section title="Cuenta">
            <LabelInput
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              required
              disabled={!canEditEmail}
              readOnly={!canEditEmail}
              helperText={!canEditEmail ? 'Solo un administrador puede cambiar el correo' : undefined}
            />
            <LabelInput id="empresa" label="Empresa" value={empresaNombre || '—'} onChange={() => undefined} disabled />
            <LabelInput id="cargo" label="Cargo" value={cargoNombre || '—'} onChange={() => undefined} disabled />
            {isSuperAdmin && (
              <Text variant="small-regular" className={colorClass.muted}>
                Como super admin puedes ver tu empresa asignada. Los datos personales se guardan en el perfil.
              </Text>
            )}
          </FormLayout.Section>

          <FormLayout.Section title="Contraseña">
            <LabelInput
              id="contrasenaActual"
              label="Contraseña actual"
              type="password"
              value={contrasenaActual}
              onChange={setContrasenaActual}
              helperText="Complete solo si desea cambiar su contraseña"
            />
            <LabelInput
              id="contrasenaNueva"
              label="Nueva contraseña"
              type="password"
              value={contrasenaNueva}
              onChange={setContrasenaNueva}
            />
            <LabelInput
              id="contrasenaConfirmacion"
              label="Confirmar nueva contraseña"
              type="password"
              value={contrasenaConfirmacion}
              onChange={setContrasenaConfirmacion}
            />
          </FormLayout.Section>

          <FormLayout.Section title="Datos personales">
            <LabelInput
              id="rut"
              label="RUT"
              value={rut}
              onChange={(v) => { setRut(v); setRutValidationError(rutError(v)); }}
              onBlur={() => { if (rut) setRut(formatRut(rut)); }}
              placeholder="12.345.678-9"
              hasError={!!rutValidationError}
              errorMessage={rutValidationError ?? ''}
            />
            <LabelInput id="nombres" label="Nombres" value={nombres} onChange={setNombres} required />
            <LabelInput id="apellidoPaterno" label="Apellido paterno" value={apellidoPaterno} onChange={setApellidoPaterno} />
            <LabelInput id="apellidoMaterno" label="Apellido materno" value={apellidoMaterno} onChange={setApellidoMaterno} />
            <LabelInput
              id="fechaNacimiento"
              label="Fecha de nacimiento"
              type="date"
              value={fechaNacimiento}
              onChange={setFechaNacimiento}
            />
            <ComboBox
              id="genero"
              label="Género"
              options={[{ label: 'Seleccionar', value: '' }, ...GENERO_OPTIONS]}
              value={genero}
              onChange={(v) => setGenero(String(v))}
            />
            <LabelInput id="telefono" label="Teléfono" value={telefono} onChange={setTelefono} placeholder="+56912345678" />
          </FormLayout.Section>

          <FormLayout.Section title="Dirección">
            <DireccionSelector
              value={direccionData}
              onChange={setDireccionData}
              disabled={submitting}
            />
            <LabelInput id="pais" label="País" value={pais} onChange={setPais} />
          </FormLayout.Section>

          <FormLayout.Section title="Información adicional">
            <LabelInput id="fotoUrl" label="URL foto de perfil" value={fotoUrl} onChange={setFotoUrl} />
            <LabelInput id="biografia" label="Biografía" value={biografia} onChange={setBiografia} />
          </FormLayout.Section>

          <FormLayout.Footer
            cancelButton={
              <PrimaryButton type="button" variant="outline" onClick={() => navigate(appPath())}>
                Volver
              </PrimaryButton>
            }
            primaryButton={
              <PrimaryButton type="submit" colorVariant="success" isLoading={submitting}>
                Guardar perfil
              </PrimaryButton>
            }
          />
        </FormLayout>
      )}
    </PageLayout>
  );
}
