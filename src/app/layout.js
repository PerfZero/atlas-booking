import { Geist, Geist_Mono } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sfProDisplay = localFont({
  src: [
    {
      path: '../fonts/SFProDisplay-Thin.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../fonts/SFProDisplay-Ultralight.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../fonts/SFProDisplay-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../fonts/SFProDisplay-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/SFProDisplay-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/SFProDisplay-Semibold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../fonts/SFProDisplay-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/SFProDisplay-Heavy.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../fonts/SFProDisplay-Black.woff2',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../fonts/SFProDisplay-ThinItalic.woff2',
      weight: '100',
      style: 'italic',
    },
    {
      path: '../fonts/SFProDisplay-UltralightItalic.woff2',
      weight: '200',
      style: 'italic',
    },
    {
      path: '../fonts/SFProDisplay-LightItalic.woff2',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../fonts/SFProDisplay-RegularItalic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../fonts/SFProDisplay-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../fonts/SFProDisplay-SemiboldItalic.woff2',
      weight: '600',
      style: 'italic',
    },
    {
      path: '../fonts/SFProDisplay-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../fonts/SFProDisplay-HeavyItalic.woff2',
      weight: '800',
      style: 'italic',
    },
    {
      path: '../fonts/SFProDisplay-BlackItalic.woff2',
      weight: '900',
      style: 'italic',
    },
  ],
  variable: '--font-primary',
});

export const metadata = {
  title: "Atlas Hajj",
  description: "Atlas Hajj - ваш путеводитель по хадж",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className={`${sfProDisplay.variable} ${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
