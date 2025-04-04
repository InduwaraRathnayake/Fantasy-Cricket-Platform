"use client";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import ChatBot from "@/components/ChatBot";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Provider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  // Reset loading state when pathname changes (page navigation)
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Existing hidden paths for Navbar and ChatBot
  const hiddenPaths = ["/auth/login", "/auth/signup", ...pathname.startsWith("/admin") ? [pathname] : []];
  
  // New array for paths where the Footer should be hidden.
  // Replace "/your-page" with the actual route of your page.tsx.
  const hideFooterPaths = ["/"]; 
  
  // Compute whether to show the common components.
  const show = !hiddenPaths.includes(pathname);
  // Decide if the Footer should be rendered.
  const showFooter = !hideFooterPaths.includes(pathname);

  return (
    <div className="overflow-x-hidden w-full">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#000018] z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
      {show && <Navbar />}
      {show && <ChatBot />}
      {children}
      {show && showFooter && <Footer />}
    </div>
  );
}
