import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from '../components/navbar/Navbar'
import TwSizeIndicator from "@/components/TwSizeIndicator";
import config from "@/config/config.json";
import theme from "@/config/theme.json";
import Footer from "@/partials/Footer";
import Header from "@/partials/Header";
import Providers from "@/partials/Providers";
import { NextAuthProvider } from "@/partials/AuthProviders";

import "@/styles/main.scss";



const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Hello Job",
  description:
    "헬로잡은 신입 개발자를 위한 최고의 취업 플랫폼, Hello Job에서 당신의 꿈을 이뤄보세요!",
};

export default function RootLayout({ children }) {
  const pf = theme.fonts.font_family.primary;
  const sf = theme.fonts.font_family.secondary;
  
  return (
    <html suppressHydrationWarning={true} lang="en">
      <head>
        {/* responsive meta */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />

        {/* favicon */}
        <link rel="shortcut icon" href={config.site.favicon} />
        {/* theme meta */}
        <meta name="theme-name" content="HelloJob" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#fff"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#000"
        />

        {/* google font css */}
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href={`https://fonts.googleapis.com/css2?family=${pf}${
            sf ? "&family=" + sf : ""
          }&display=swap`}
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning={true}>
        <TwSizeIndicator />
        <Providers>
          <NextAuthProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </NextAuthProvider>
        </Providers>
      </body>
    </html>
  );
}
