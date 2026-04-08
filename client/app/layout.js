import './globals.css';

export const metadata = {
  title: 'TaskFlow — Productivity Dashboard',
  description: 'Track tasks, time, and productivity insights',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
