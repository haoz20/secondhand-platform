import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider"; // Import the provider

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "YaungWel",
  description: "A platform for buying and selling second-hand items",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider> {/* Wrap children */}
      </body>
    </html>
  );
}