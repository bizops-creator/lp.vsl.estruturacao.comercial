import { motion } from 'motion/react';

export const MarqueeHeader = () => {
  const phrase = "Para operações comerciais de R$75k a R$5M+/mês";
  
  return (
    <div className="w-full bg-gold-primary py-3 overflow-hidden border-b border-gold-alt/20 relative z-[70] mt-10">
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ 
          duration: 30, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="flex whitespace-nowrap"
      >
        {[...Array(20)].map((_, i) => (
          <span key={i} className="text-xs md:text-sm font-display font-black text-bg-primary uppercase italic tracking-wide flex items-center shrink-0">
            {phrase} <span className="mx-12 text-[10px]">●</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};
