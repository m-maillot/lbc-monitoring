import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LBC Monitoring - Configuration',
  description: 'Interface de gestion des recherches LeBonCoin',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
