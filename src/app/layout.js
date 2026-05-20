import { Syne, DM_Sans } from 'next/font/google';
import './globals.css';

const syne = Syne({ subsets: ['latin'], variable: '--font-syne', weight: ['400', '600', '700', '800'] });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm', weight: ['300', '400', '500'] });

export const metadata = {
  title: 'AgentLens - AI Representation Optimizer for Shopify',
  description: 'Understand how AI shopping agents perceive your Shopify store.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body style={{ margin: 0, padding: 0, background: '#0a0a0f', color: '#f0f0f5', fontFamily: 'var(--font-dm, sans-serif)' }}>
        {children}
      </body>
    </html>
  );
}
