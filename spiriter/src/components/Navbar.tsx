"use client";

import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isLogged, setIsLogged] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          setIsLogged(true);
          return;
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }

    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        buttonRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setIsLogged(false);
        window.location.href = "/auth/login"; // Redirect to login page
      } else {
        console.error("Logout failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const NavLinks = () => (
    <>
      <Link href="/" onClick={handleLinkClick}>
        <div className="cursor-pointer rounded-3xl nav-hover-btn">
          Home
        </div>
      </Link>
      <Link href="/leaderboard" onClick={handleLinkClick}>
        <div className="cursor-pointer rounded-3xl nav-hover-btn">
          Leaderboard
        </div>
      </Link>
      <Link href="/players" onClick={handleLinkClick}>
        <div className="cursor-pointer rounded-3xl nav-hover-btn">
          Players
        </div>
      </Link>
      {isLogged && (
        <>
          <Link href="/team" onClick={handleLinkClick}>
            <div className="cursor-pointer rounded-3xl nav-hover-btn">
              Your Team
            </div>
          </Link>
          <Link href="/budget" onClick={handleLinkClick}>
            <div className="cursor-pointer rounded-3xl nav-hover-btn">
              Budget
            </div>
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="fixed top-0 w-full h-24 z-40 backdrop-blur-xs shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link href="/" onClick={handleLinkClick} className="flex items-center">
            <div className="flex-shrink-0">
              <img className="h-8" src="/images/logo-hor.png" alt="Logo" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 text-white">
            <NavLinks />
            {isLogged ? (
              <button
                onClick={handleLogout}
                className="cursor-pointer py-2 px-6 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 transition-opacity"
              >
                Logout
              </button>
            ) : (
              <Link href="/auth/signup" onClick={handleLinkClick}>
                <div className="cursor-pointer py-2 px-6 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 transition-opacity">
                  Sign Up
                </div>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              ref={buttonRef}
              onClick={toggleMobileMenu}
              className="text-white p-2 rounded-md hover:bg-white/40"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="shadow-2xs w-full backdrop-blur-3xl z-40 bg-[#000018]/90">
          
          <div className="px-2 pt-2 pb-3 space-y-1 text-white z-50">
            <div className="flex flex-col space-y-4 p-4">
              <NavLinks />
              {isLogged ? (
                <button
                  onClick={handleLogout}
                  className="cursor-pointer py-2 px-6 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 transition-opacity text-center"
                >
                  Logout
                </button>
              ) : (
                <Link href="/auth/signup" onClick={handleLinkClick}>
                  <div className="cursor-pointer py-2 px-6 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 transition-opacity text-center">
                    Sign Up
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;