import React from 'react';
import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';

export const SectionWrapper = ({ 
  children, 
  className = "", 
  staggerChildren = false 
}: { 
  children: React.ReactNode, 
  className?: string,
  staggerChildren?: boolean
}) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: staggerChildren ? 0.08 : 0
      }
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const FadeUp = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } }
    }}
  >
    {children}
  </motion.div>
);
