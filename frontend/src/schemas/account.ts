export interface ChangePasswordData {
  newPassword: string;
  confirmPassword: string;
}

export function validateChangePassword(data: ChangePasswordData): string | null {
  if (data.newPassword.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }
  if (!/[A-Z]/.test(data.newPassword)) {
    return 'La contraseña debe incluir al menos una mayúscula';
  }
  if (!/[0-9]/.test(data.newPassword)) {
    return 'La contraseña debe incluir al menos un número';
  }
  if (data.newPassword !== data.confirmPassword) {
    return 'Las contraseñas no coinciden';
  }
  return null;
}
