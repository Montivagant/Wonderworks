'use client';

import { motion } from 'framer-motion';

// Decor Icon (First SVG)
export const AnimatedVaseIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <motion.div
    className={className}
    animate={{ y: [0, -2, 0] }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
  >
    <svg viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M256 32c-17.7 0-32 14.3-32 32v32h-32c-17.7 0-32 14.3-32 32v32c0 17.7 14.3 32 32 32h32v32c0 17.7 14.3 32 32 32s32-14.3 32-32v-32h32c17.7 0 32-14.3 32-32v-32c0-17.7-14.3-32-32-32h-32V64c0-17.7-14.3-32-32-32z" />
      <path d="M256 320c-70.7 0-128 57.3-128 128h256c0-70.7-57.3-128-128-128z" />
    </svg>
  </motion.div>
);

// Home Icon (Second SVG)
export const AnimatedShelvesIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <motion.div
    className={className}
    animate={{ y: [0, -2, 0] }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
  >
    <svg viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M256 32L32 256h64v192h128V320h64v128h128V256h64L256 32z" />
    </svg>
  </motion.div>
);

// Stationary Icon (Third SVG)
export const AnimatedPencilCupIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <motion.div
    className={className}
    animate={{ y: [0, -2, 0] }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
  >
    <svg viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M96 464c0 26.5 21.5 48 48 48h224c26.5 0 48-21.5 48-48V176H96v288zm320-336V80c0-26.5-21.5-48-48-48H144c-26.5 0-48 21.5-48 48v48h320z" />
    </svg>
  </motion.div>
);

// Toys & Games Icon (Fourth SVG)
export const AnimatedLegoIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <motion.div
    className={className}
    animate={{ y: [0, -2, 0] }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
  >
    <svg viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M256 32c-61.9 0-112 50.1-112 112s50.1 112 112 112 112-50.1 112-112S317.9 32 256 32zm0 192c-44.2 0-80-35.8-80-80s35.8-80 80-80 80 35.8 80 80-35.8 80-80 80z" />
      <path d="M464 288H48c-26.5 0-48 21.5-48 48v128c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V336c0-26.5-21.5-48-48-48z" />
    </svg>
  </motion.div>
); 