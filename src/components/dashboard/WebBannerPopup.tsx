'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';

export function WebBannerPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSeenBanner = sessionStorage.getItem('hasSeenKottawaBanner_v5');
      if (!hasSeenBanner) {
        setIsVisible(true);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('hasSeenKottawaBanner_v5', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden border-4 border-white/20"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 z-30 w-10 h-10 bg-black/20 hover:bg-black/40 rounded-full text-white flex items-center justify-center transition-all hover:scale-110 shadow-lg backdrop-blur-md border border-white/20"
              aria-label="Close banner"
            >
              <X size={20} />
            </button>

            {/* Banner Image */}
            <div className="relative w-full aspect-[2.8/1]">
              <Image
                src="/images/kottawa_banner.png"
                alt="Leeds International School - Kottawa Opening Soon"
                fill
                priority
                className="object-cover"
              />
              
              {/* Optional: Subtle Overlay for Depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>

            {/* Content Footer (Optional, but makes it look more intentional) */}
            <div className="bg-primary p-6 text-center">
              <p className="text-white text-xs font-black uppercase tracking-[0.3em] opacity-80">
                New Branch Opening Soon • Stay Tuned
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
