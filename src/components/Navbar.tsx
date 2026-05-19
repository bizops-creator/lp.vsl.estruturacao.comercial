import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Logo } from './ui/Logo';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Portfólio', href: '#provas' },
    { label: 'Soluções', href: '#beneficios' },
    { label: 'Ecossistema', href: '#metodo' }
  ];

  return (
    <nav className={`fixed top-12 left-0 right-0 z-50 transition-all duration-700 ${isScrolled ? 'py-2' : 'py-5'}`}>
      <div className={`max-w-7xl mx-auto px-6 flex items-center justify-center relative transition-all duration-500`}>
        <div className={`bg-brand-black/40 backdrop-blur-xl rounded-full border border-white/5 flex items-center px-6 py-2 transition-all duration-500 ${isScrolled ? 'shadow-2xl translate-y-[-10px]' : ''}`}>
          <Logo className="scale-75 origin-left" />
          
          <div className="hidden md:flex items-center gap-2 ml-8">
            {menuItems.map((item) => (
              <a 
                key={item.label} 
                href={item.href} 
                className="relative px-5 py-2 text-[10px] font-eyebrow uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors"
                onMouseEnter={() => setHoveredPath(item.href)}
                onMouseLeave={() => setHoveredPath(null)}
              >
                <span className="relative z-10">{item.label}</span>
                {hoveredPath === item.href && (
                  <motion.div 
                    layoutId="navbar-hover"
                    className="absolute inset-0 bg-white/5 rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </a>
            ))}
            <a href="#aplicar" className="ml-4 px-8 py-2.5 bg-gradient-cta rounded-full text-brand-black font-eyebrow text-[10px] uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg">
              APLICAR AGORA
            </a>
          </div>
        </div>

        <button className="md:hidden absolute right-6 w-12 h-12 bg-brand-black/40 backdrop-blur-xl rounded-full border border-white/5 flex items-center justify-center text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden bg-bg-dark/98 backdrop-blur-2xl fixed inset-0 z-[60] p-12 flex flex-col gap-10"
          >
            <div className="flex justify-between items-center mb-4">
              <Logo />
              <button onClick={() => setMobileMenuOpen(false)} className="text-white"><X size={32} /></button>
            </div>
            <div className="flex flex-col gap-8">
              {menuItems.map((item, i) => (
                <motion.a 
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  href={item.href} 
                  className="text-4xl font-eyebrow text-off-white uppercase tracking-tight"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </motion.a>
              ))}
              <motion.a 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                href="#aplicar" 
                className="w-full py-6 bg-gradient-cta rounded-2xl font-eyebrow text-2xl text-brand-black flex items-center justify-center gap-3 shadow-2xl"
                onClick={() => setMobileMenuOpen(false)}
              >
                APLICAR AGORA <ArrowRight />
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
