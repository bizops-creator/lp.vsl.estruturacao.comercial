import { motion } from 'motion/react';

export const Logo = ({ className }: { className?: string }) => (
  <motion.div 
    layout
    className={`flex items-center justify-center ${className}`}
  >
    <img src="/logo.png" alt="Valeur Logo" className="h-10 w-auto object-contain" referrerPolicy="no-referrer" />
  </motion.div>
);
