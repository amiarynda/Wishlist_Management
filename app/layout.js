import './globals.css';

export const metadata = {
  title: 'Little Wishlist',
  description: 'A cozy place to keep track of things you want to buy.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
