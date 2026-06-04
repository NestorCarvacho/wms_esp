import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { actualizarPerfilUsuario, actualizarUsuario, obtenerUsuario } from '@/api/usuarios';
import { setStoredUser } from '@/api/auth';
import { PageLayout } from '@/components/layout/PageLayout';
import { FormLayout } from '@/components/layout/FormLayout';
import { LabelInput } from '@/components/ui/inputs';
import { ComboBox } from '@/components/ui/inputs/ComboBox';
import { PrimaryButton } from '@/components/ui/buttons';
import { Text } from '@/components/ui/text/Text';
import { Feedback } from '@/app/Feedback';
import { useAuthContext } from '@/context/AuthContext';
import { ApiError } from '@/api/client';
import { colorClass } from '@/assets/styles/colors';
import type { PerfilUsuarioActualizar } from '@/types/api';

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
  const { user, isSuperAdmin } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
  const [direccion, setDireccion] = useState('');
  const [comuna, setComuna] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [region, setRegion] = useState('');
  const [pais, setPais] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [biografia, setBiografia] = useState('');

  const loadPerfil = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
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
      setDireccion(perfil?.direccion ?? '');
      setComuna(perfil?.comuna ?? '');
      setCiudad(perfil?.ciudad ?? '');
      setRegion(perfil?.region ?? '');
      setPais(perfil?.pais ?? 'Chile');
      setFotoUrl(perfil?.foto_url ?? '');
      setBiografia(perfil?.biografia ?? '');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al cargar el perfil');
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

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (email.trim() !== initialEmail) {
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
        direccion: emptyIfBlank(direccion),
        comuna: emptyIfBlank(comuna),
        ciudad: emptyIfBlank(ciudad),
        region: emptyIfBlank(region),
        pais: emptyIfBlank(pais),
        foto_url: emptyIfBlank(fotoUrl),
        biografia: emptyIfBlank(biografia),
      };

      await actualizarPerfilUsuario(user.id, perfilPayload);
      setSuccess('Perfil actualizado correctamente');
      await loadPerfil();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al guardar el perfil');
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <PageLayout
      routes={[{ text: 'Inicio', onClick: () => navigate('/') }, { text: 'Mi perfil' }]}
      icon="user"
      supportingText="Datos de cuenta y perfil personal"
    >
      {error && <Feedback type="error" message={error} />}
      {success && <Feedback type="success" message={success} />}

      {loading ? (
        <Text variant="body-regular" className={colorClass.muted}>Cargando perfil…</Text>
      ) : (
        <FormLayout onSubmit={handleSubmit} columns={2}>
          <FormLayout.Section title="Cuenta">
            <LabelInput id="email" label="Email" type="email" value={email} onChange={setEmail} required />
            <LabelInput id="empresa" label="Empresa" value={empresaNombre || '—'} onChange={() => undefined} disabled />
            <LabelInput id="cargo" label="Cargo" value={cargoNombre || '—'} onChange={() => undefined} disabled />
            {isSuperAdmin && (
              <Text variant="small-regular" className={colorClass.muted}>
                Como super admin puedes ver tu empresa asignada. Los datos personales se guardan en el perfil.
              </Text>
            )}
          </FormLayout.Section>

          <FormLayout.Section title="Datos personales">
            <LabelInput id="rut" label="RUT" value={rut} onChange={setRut} placeholder="12.345.678-9" />
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
            <LabelInput id="direccion" label="Dirección" value={direccion} onChange={setDireccion} />
            <LabelInput id="comuna" label="Comuna" value={comuna} onChange={setComuna} />
            <LabelInput id="ciudad" label="Ciudad" value={ciudad} onChange={setCiudad} />
            <LabelInput id="region" label="Región" value={region} onChange={setRegion} />
            <LabelInput id="pais" label="País" value={pais} onChange={setPais} />
          </FormLayout.Section>

          <FormLayout.Section title="Información adicional">
            <LabelInput id="fotoUrl" label="URL foto de perfil" value={fotoUrl} onChange={setFotoUrl} />
            <LabelInput id="biografia" label="Biografía" value={biografia} onChange={setBiografia} />
          </FormLayout.Section>

          <FormLayout.Footer
            cancelButton={
              <PrimaryButton type="button" variant="outline" onClick={() => navigate('/')}>
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
