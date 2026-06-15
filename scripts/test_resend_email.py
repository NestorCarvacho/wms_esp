"""Envía un correo de prueba con Resend (equivalente al snippet de la documentación).

Uso:
  1. En .env: RESEND_API_KEY=re_xxxxxxxxx
  2. Para pruebas locales sin dominio: EMAIL_DEV_LOG_ONLY=True (enlace en consola uvicorn)
  3. Para probar envío real en sandbox: EMAIL_DEV_LOG_ONLY=False y EMAIL_FROM=onboarding@resend.dev
     (solo puede enviar al email de su cuenta Resend)
  4. python scripts/test_resend_email.py
     python scripts/test_resend_email.py --to su-email@resend-cuenta.com
"""
from __future__ import annotations

import argparse
import os
import sys

from dotenv import load_dotenv

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

load_dotenv(os.path.join(ROOT, ".env"))

from app.core.config import APP_NAME  # noqa: E402
from app.infrastructure.email.resend_service import send_email_sync  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Prueba de envío con Resend API")
    parser.add_argument(
        "--to",
        default=os.getenv("RESEND_TEST_TO", "nestor.carvacho@gmail.com"),
        help="Destinatario del correo de prueba",
    )
    args = parser.parse_args()

    api_key = os.getenv("RESEND_API_KEY", "")
    if not api_key or api_key == "re_xxxxxxxxx":
        print(
            "Configure RESEND_API_KEY en .env con su clave real (re_…).\n"
            "Obtenerla en: https://resend.com/api-keys"
        )
        sys.exit(1)

    from_addr = os.getenv("EMAIL_FROM", "onboarding@resend.dev")
    dev_log = os.getenv("EMAIL_DEV_LOG_ONLY", "true").lower() == "true"
    if dev_log:
        print(
            "EMAIL_DEV_LOG_ONLY=True: no se envía correo. "
            "Desactive para probar Resend sandbox (onboarding@resend.dev)."
        )
        sys.exit(0)
    print(f"Remitente: {from_addr}")
    print(f"Destino:   {args.to}")

    result = send_email_sync(
        to=args.to,
        subject=f"Hello World — {APP_NAME}",
        html=f"<p>Congrats on sending your <strong>first email</strong> from {APP_NAME}!</p>",
        from_addr=from_addr,
    )
    print("Correo enviado:", result)


if __name__ == "__main__":
    main()
