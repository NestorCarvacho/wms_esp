import { Helmet } from 'react-helmet-async';
import { APP_NAME, APP_TAGLINE } from '@/config/appBrand';
import { CONTACT_EMAIL, SITE_URL } from '@/config/seo';
import { PRICING_PLANS } from '@/config/pricing';

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: APP_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/og-image.svg`,
        description: APP_TAGLINE,
        email: CONTACT_EMAIL,
        areaServed: { '@type': 'Country', name: 'Chile' },
        sameAs: [],
      }}
    />
  );
}

export function SoftwareApplicationJsonLd() {
  const starter = PRICING_PLANS[0];
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: `${APP_NAME} WMS`,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description:
          'Software WMS en la nube para gestión de bodega, control de inventario por ubicación, recepción, traslado y despacho.',
        offers: {
          '@type': 'Offer',
          price: String(starter.priceMonthly),
          priceCurrency: 'CLP',
          priceValidUntil: '2027-12-31',
        },
        areaServed: 'CL',
        inLanguage: 'es',
        url: SITE_URL,
      }}
    />
  );
}

export function FaqJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }}
    />
  );
}
