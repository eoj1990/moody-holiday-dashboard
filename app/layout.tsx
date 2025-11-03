import './styles/globals.css';

export const metadata = { title: 'Moody Holiday Dashboard' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body className="antialiased bg-zinc-50">
      <div className="max-w-6xl mx-auto p-4">{children}</div>
    </body></html>
  );
}
