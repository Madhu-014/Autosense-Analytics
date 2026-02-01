import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import AppProvider from "../components/AppProvider";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "AutoSense Analytics",
  description: "AI-Generated Visual Insights Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light"
          forcedTheme="light"
        >
          <AppProvider>
            {children}
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
