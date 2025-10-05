import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import NavigationBar from "./components/NavigationBar";
import Footer from "./components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "YaungWel",
  description: "A platform for buying and selling second-hand items",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} m-0 p-0`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <NavigationBar />
            <main className="flex-grow flex flex-col bg-gradient-to-br from-[#B5EAEA] via-[#F4F4F2] to-[#EDF6E5]">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}