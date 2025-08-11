import './globals.css';
import React from 'react';
export const metadata = { title: 'KI-Bewerbungsassistent', description: 'Next.js + OpenAI' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
