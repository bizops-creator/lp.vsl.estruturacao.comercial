import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { collection, getDocs, orderBy, query, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { CLIENTS } from './data/clients';

export default function App() {
  const [videoEnded, setVideoEnded] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [formData, setFormData] = useState({
    travamento: '',
    segmento: '',
    perfil: '',
    revenue: '',
    vendedores: '',
    name: '',
    email: '',
    phone: ''
  });

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    // 0 is the state for 'ended'
    if (event.data === 0) {
      setVideoEnded(true);
      // Wait a bit and scroll to form
      setTimeout(() => {
        document.getElementById('application-form-container')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  };

  const handleInputChange = (field: string, value: string, autoAdvance = false) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (autoAdvance && currentStep < 5) {
      setTimeout(() => nextStep(), 400);
    }
  };

  const handlePhoneChange = (value: string) => {
    const numeric = value.replace(/\D/g, "").slice(0, 11);
    let mask = numeric;
    if (numeric.length > 0) mask = "(" + numeric;
    if (numeric.length > 2) mask = "(" + numeric.slice(0, 2) + ") " + numeric.slice(2);
    if (numeric.length > 6) {
       if (numeric.length === 11) {
         mask = "(" + numeric.slice(0, 2) + ") " + numeric.slice(2, 7) + "-" + numeric.slice(7);
       } else {
         mask = "(" + numeric.slice(0, 2) + ") " + numeric.slice(2, 6) + "-" + numeric.slice(6);
       }
    }
    handleInputChange('phone', mask);
  };

  const nextStep = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setIsTransitioning(false);
    }, 300);
  };
  const prevStep = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setIsTransitioning(false);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          answers: {
            travamento: formData.travamento,
            segmento: formData.segmento,
            perfil: formData.perfil,
            revenue: formData.revenue,
            vendedores: formData.vendedores
          }
        })
      });

      if (response.ok) {
        // Redirect to Calendly
        const calendlyUrl = import.meta.env.VITE_CALENDLY_URL || 'https://calendly.com/valeur-consultoria';
        window.location.href = calendlyUrl;
      } else {
        alert('Ocorreu um erro ao enviar seus dados. Por favor, tente novamente.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const stepsLayout = [
    { id: 'travamento', name: 'Travamento' },
    { id: 'segmento', name: 'Segmento' },
    { id: 'perfil', name: 'Perfil' },
    { id: 'receita', name: 'Receita' },
    { id: 'time', name: 'Time' },
    { id: 'contato', name: 'Contato' }
  ];

  const OptionCard = ({ label, value, field, index }: { label: string, value: string, field: string, index: number, key?: any }) => {
    const isSelected = formData[field as keyof typeof formData] === value;
    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleInputChange(field, value, true)}
        className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 group relative overflow-hidden ${
          isSelected 
            ? 'border-[#0C0C0C] bg-gradient-to-br from-white to-gray-50 shadow-[0_15px_35px_rgba(0,0,0,0.06)]' 
            : 'border-white bg-white hover:border-gray-100 shadow-sm hover:shadow-md'
        }`}
      >
        {isSelected && (
          <motion.div 
            layoutId="active-bg"
            className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent pointer-events-none"
          />
        )}
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
          isSelected ? 'border-[#0C0C0C] bg-[#0C0C0C] scale-110' : 'border-gray-200 group-hover:border-black/30'
        }`}>
          {isSelected && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 rounded-full bg-white" 
            />
          )}
        </div>
        <div className="flex-1 relative z-10">
          <p className={`font-bold text-base transition-colors duration-300 ${isSelected ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>
            {label}
          </p>
        </div>
      </motion.button>
    );
  };

  const TrustSignals = () => (
    <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">
       <div className="flex items-center gap-2.5 transition-colors hover:text-gray-600">
         <div className="w-1.5 h-1.5 rounded-full bg-[#D9B26E] shadow-[0_0_8px_rgba(217,178,110,0.6)] animate-pulse" /> 
         +2.500 Diagnósticos Realizados
       </div>
       <div className="flex items-center gap-2.5 transition-colors hover:text-gray-600">
         <div className="w-1.5 h-1.5 rounded-full bg-[#D9B26E]" /> 
         Metodologia Valeur 2.0
       </div>
       <div className="flex items-center gap-2.5 transition-colors hover:text-gray-600">
         <div className="w-1.5 h-1.5 rounded-full bg-[#D9B26E]" /> 
         Resposta em até 4h úteis
       </div>
    </div>
  );

  const ScarcityBadge = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-100 rounded-full mb-4"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
      </span>
      <span className="text-[10px] font-black text-red-600 uppercase tracking-wider">Vagas limitadas para esta semana</span>
    </motion.div>
  );

  const SocialProofTicker = () => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
      <div className="flex flex-col items-center">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] mb-12 text-center px-4 leading-loose">
          Empresas que escalaram processos comerciais com a Valeur
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 max-w-5xl px-8">
          {CLIENTS.map((logo, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.85, y: 15 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                onHoverStart={() => setHoveredIndex(i)}
                onHoverEnd={() => setHoveredIndex(null)}
                whileHover={{ 
                  y: -8, 
                  scale: 1.12,
                }}
                viewport={{ once: true }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 22
                }}
                className="h-14 w-32 flex items-center justify-center cursor-pointer select-none"
              >
                <img 
                  src={logo.url} 
                  alt={logo.name} 
                  style={{
                    filter: isHovered 
                      ? "drop-shadow(0px 4px 8px rgba(0,0,0,0.5)) drop-shadow(0px 15px 25px rgba(0,0,0,0.4)) drop-shadow(0px 25px 45px rgba(0,0,0,0.3))"
                      : "drop-shadow(0px 2px 4px rgba(0,0,0,0.4)) drop-shadow(0px 8px 16px rgba(0,0,0,0.3)) drop-shadow(0px 12px 24px rgba(0,0,0,0.15))"
                  }}
                  className="h-full object-contain max-h-11 max-w-full transition-all duration-300 transform-gpu" 
                  referrerPolicy="no-referrer" 
                />
              </motion.div>
            );
          })}
        </div>
        <div className="mt-12 flex flex-col items-center gap-3">
          <p className="text-[10px] text-[#A67C37] font-black uppercase tracking-[0.25em] animate-pulse">
            Transformando operações de vendas em todo o Brasil
          </p>
          <div className="h-px w-8 bg-zinc-300" />
          <p className="text-[9px] text-zinc-500 font-bold italic tracking-wider">
            E mais de 150 empresas mentoradas este ano
          </p>
        </div>
      </div>
    );
  };

  const StepCircle = ({ index, label, active, completed }: { index: number, label: string, active: boolean, completed: boolean, key?: any }) => (
    <div className="flex items-center gap-2 opacity-100 transition-opacity text-white">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
        completed ? 'bg-[#22C55E] text-white' : active ? 'bg-[#D9B26E] text-white' : 'bg-[#333] text-gray-500'
      }`}>
        {completed ? '✓' : index + 1}
      </div>
      <span className={`text-[10px] font-eyebrow font-bold uppercase tracking-wider hidden md:block ${active ? 'text-white' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );

  const videoOptions: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      rel: 0,
    },
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans selection:bg-[#D9B26E] selection:text-white pb-20">
      {/* Top Red Ribbon */}
      <div className="bg-[#E11D48] py-3.5 px-4 text-center sticky top-0 z-50 shadow-lg">
        <p className="text-white font-black text-[10px] md:text-xs tracking-[0.2em] uppercase">
          ESPERE! SEU DIAGNÓSTICO COMERCIAL AINDA NÃO ESTÁ CONCLUÍDO!
        </p>
      </div>

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-10 flex flex-col items-center">
        {/* Progress Section */}
        <div className="w-full max-w-md mb-10">
          <div className="flex justify-between items-end mb-2.5 px-1">
            <p className="font-black text-gray-900 text-xs tracking-tighter uppercase">{videoEnded ? "Diagnóstico: 95% Concluído" : "Status: 89% Completo"}</p>
            <p className="text-[10px] font-black text-red-600 animate-pulse uppercase tracking-widest">Quase lá!</p>
          </div>
          <div className="w-full h-3.5 bg-gray-200 rounded-full overflow-hidden shadow-inner p-1">
            <motion.div 
              initial={{ width: "89%" }}
              animate={{ width: videoEnded ? "95%" : "89%" }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="h-full bg-gradient-to-r from-[#E11D48] via-[#F43F5E] to-[#E11D48] rounded-full relative overflow-hidden"
              style={{ backgroundSize: '200% 100%' }}
            >
              <motion.div 
                animate={{ x: ["0%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-white/20 skew-x-[-20deg] w-1/2"
              />
            </motion.div>
          </div>
        </div>

        {/* Warning Header */}
        <div className="text-center mb-10">
          <h2 className="text-[#F97316] font-black text-xs md:text-sm mb-2 uppercase tracking-[0.3em]">Aviso importante:</h2>
          <h1 className="text-gray-900 font-display font-black text-3xl md:text-6xl leading-[1.0] uppercase tracking-tighter">
            NÃO FECHE ESTA PÁGINA.
          </h1>
          <p className="text-gray-600 font-bold text-lg md:text-xl mt-5 px-4 leading-relaxed max-w-2xl mx-auto italic">
            "{videoEnded ? "Parabéns por assistir! Agora preencha a aplicação abaixo para receber seu plano." : "Assista ao vídeo abaixo para entender como escalar seus processos comerciais."}"
          </p>
        </div>

        {/* Video Player Box */}
        <div className="w-full aspect-video bg-black rounded-xl shadow-2xl overflow-hidden relative border-4 border-white/5 max-w-3xl">
          <YouTube 
            videoId="dQw4w9WgXcQ" // Replace with actual Video ID
            opts={videoOptions}
            onStateChange={onPlayerStateChange}
            className="w-full h-full"
          />
        </div>

        {/* Application Form Section - Only shows after video ends */}
        <AnimatePresence>
          {videoEnded && (
            <motion.div 
              id="application-form-container"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl mt-12 overflow-hidden bg-white rounded-2xl shadow-2xl border border-gray-100"
            >
              {/* Form Header */}
              <div className="bg-[#0C0C0C] p-6 md:px-10">
                <div className="flex justify-between md:justify-start md:gap-8 items-center mb-6">
                  <div className="flex items-center gap-3 mr-auto md:mr-8">
                    <div className="w-6 h-6 bg-[#D9B26E] rounded flex items-center justify-center font-black text-[10px] italic">V</div>
                    <h3 className="text-white font-display font-black text-sm md:text-base uppercase italic tracking-tighter">VALEUR | DIAGNÓSTICO</h3>
                  </div>
                  <div className="flex gap-4 md:gap-8 items-center">
                    {stepsLayout.map((s, idx) => (
                      <StepCircle 
                        key={s.id} 
                        index={idx} 
                        label={s.name} 
                        active={currentStep === idx} 
                        completed={currentStep > idx} 
                      />
                    ))}
                  </div>
                </div>

                <div className="relative h-px bg-[#222] mb-6">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / stepsLayout.length) * 100}%` }}
                    className="absolute h-full bg-[#D9B26E]"
                  />
                </div>
                
                <div className="flex justify-between items-center mt-6">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Etapa {currentStep + 1} de {stepsLayout.length}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Diagnóstico Comercial</p>
                </div>
              </div>

              {/* Form Body */}
              <div className="p-8 md:p-12 relative min-h-[400px]">
                {loading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center"
                  >
                    <div className="w-12 h-12 border-4 border-gray-100 border-t-[#D9B26E] rounded-full animate-spin mb-4" />
                    <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Enviando aplicação...</p>
                  </motion.div>
                )}
                <AnimatePresence mode="wait">
                  {!isTransitioning && (
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8"
                    >
                      <form onSubmit={handleSubmit} className="space-y-8">
                        {currentStep === 0 && (
                          <div className="space-y-6">
                            <header>
                              <ScarcityBadge />
                              <p className="text-[10px] font-eyebrow font-black text-[#D9B26E] uppercase tracking-[0.2em] mb-2">ETAPA 1 DE 6 · DIAGNÓSTICO</p>
                              <h4 className="text-2xl md:text-3xl font-display font-black text-gray-900 leading-tight">Qual destes é o seu maior travamento hoje?</h4>
                              <p className="text-gray-500 mt-2">Onde está a maior alavanca de receita parada na sua operação?</p>
                            </header>
                            <div className="space-y-3">
                              {[
                                { id: 'Vendedores', label: 'O resultado depende de poucos vendedores estrela' },
                                { id: 'Processo', label: 'Não possuo um processo comercial replicável' },
                                { id: 'Playbooks', label: 'Falta de playbooks e documentação comercial' },
                                { id: 'Captacao', label: 'Captação ativa é instável ou inexistente' },
                                { id: 'Trafego', label: 'Baixa previsibilidade nos canais de tráfego pago' }
                              ].map((opt, i) => (
                                <OptionCard key={opt.id} index={i} field="travamento" value={opt.id} label={opt.label} />
                              ))}
                            </div>
                          </div>
                        )}

                        {currentStep === 1 && (
                          <div className="space-y-6">
                            <header>
                              <p className="text-[10px] font-eyebrow font-black text-[#D9B26E] uppercase tracking-[0.2em] mb-2">ETAPA 2 DE 6 · SEGMENTO</p>
                              <h4 className="text-2xl md:text-3xl font-display font-black text-gray-900 leading-tight">Qual o segmento da sua empresa?</h4>
                              <p className="text-gray-500 mt-2">Selecione a área que melhor representa seu negócio.</p>
                            </header>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {['Saúde', 'Finanças', 'Jurídico', 'Tecnologia/SaaS', 'Indústria', 'Serviços/Mentoria', 'Outro'].map((opt, i) => (
                                <OptionCard key={opt} index={i} field="segmento" value={opt} label={opt} />
                              ))}
                            </div>
                          </div>
                        )}

                        {currentStep === 2 && (
                          <div className="space-y-6">
                            <header>
                              <p className="text-[10px] font-eyebrow font-black text-[#D9B26E] uppercase tracking-[0.2em] mb-2">ETAPA 3 DE 6 · PERFIL</p>
                              <h4 className="text-2xl md:text-3xl font-display font-black text-gray-900 leading-tight">Qual é o seu papel hoje na empresa?</h4>
                              <p className="text-gray-500 mt-2">Personalize seu diagnóstico de acordo com sua função.</p>
                            </header>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {['Sócio / Empresário', 'Gerente / Líder', 'Colaborador', 'Freelancer'].map((opt, i) => (
                                <OptionCard key={opt} index={i} field="perfil" value={opt} label={opt} />
                              ))}
                            </div>
                          </div>
                        )}

                        {currentStep === 3 && (
                          <div className="space-y-6">
                            <header>
                              <p className="text-[10px] font-eyebrow font-black text-[#D9B26E] uppercase tracking-[0.2em] mb-2">ETAPA 4 DE 6 · RECEITA</p>
                              <h4 className="text-2xl md:text-3xl font-display font-black text-gray-900 leading-tight">Qual a receita média mensal da empresa?</h4>
                              <p className="text-gray-500 mt-2">Essa informação nos ajuda a direcionar a melhor estratégia para sua escala.</p>
                            </header>
                            <div className="space-y-3">
                              {[
                                'Abaixo de R$ 30 mil', 
                                'Entre R$ 30 mil e R$ 50 mil', 
                                'Entre R$ 50 mil e R$ 100 mil', 
                                'Entre R$ 100 mil e R$ 300 mil', 
                                'Entre R$ 300 mil e R$ 500 mil', 
                                'Entre R$ 500 mil e R$ 1 milhão', 
                                'Acima de R$ 1 milhão'
                              ].map((opt, i) => (
                                <OptionCard key={opt} index={i} field="revenue" value={opt} label={opt} />
                              ))}
                            </div>
                          </div>
                        )}

                        {currentStep === 4 && (
                          <div className="space-y-6">
                            <header>
                              <p className="text-[10px] font-eyebrow font-black text-[#D9B26E] uppercase tracking-[0.2em] mb-2">ETAPA 5 DE 6 · TIME COMERCIAL</p>
                              <h4 className="text-2xl md:text-3xl font-display font-black text-gray-900 leading-tight">Quantos vendedores você tem no time hoje?</h4>
                              <p className="text-gray-500 mt-2">Isso define o modelo de gestão e playbooks que sua empresa precisa.</p>
                            </header>
                            <div className="space-y-3">
                              {[
                                'Apenas eu (sócio-vendedor)',
                                '1 vendedor',
                                '2 a 3 vendedores',
                                '4 a 6 vendedores',
                                '6 a 10 vendedores',
                                '11 a 20 vendedores',
                                'Acima de 20 vendedores'
                              ].map((opt, i) => (
                                <OptionCard key={opt} index={i} field="vendedores" value={opt} label={opt} />
                              ))}
                            </div>
                          </div>
                        )}

                        {currentStep === 5 && (
                          <div className="space-y-6">
                            <header>
                              <p className="text-[10px] font-eyebrow font-black text-[#D9B26E] uppercase tracking-[0.2em] mb-2">ETAPA 6 DE 6 · CONTATO</p>
                              <h4 className="text-2xl md:text-3xl font-display font-black text-gray-900 leading-tight">Quase lá! Onde enviamos seu diagnóstico?</h4>
                            </header>
                            
                            <div className="bg-gray-50 border-l-4 border-[#0C0C0C] p-5 rounded-r-lg">
                              <p className="text-sm font-bold text-gray-900 mb-1">Próximo passo:</p>
                              <p className="text-sm text-gray-600">Um estrategista da Valeur Consultoria entrará em contato em até <span className="font-bold text-gray-900">4h úteis</span> para validar seus dados.</p>
                            </div>

                            <div className="space-y-5">
                              <div className="group">
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 group-focus-within:text-[#D9B26E]">NOME COMPLETO <span className="text-[#D9B26E]">*</span></label>
                                <input 
                                  required name="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)}
                                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D9B26E] outline-none transition-all placeholder:text-gray-300 font-bold"
                                  placeholder="Seu nome"
                                />
                              </div>
                              <div className="group">
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 group-focus-within:text-[#D9B26E]">E-MAIL CORPORATIVO <span className="text-[#D9B26E]">*</span></label>
                                <input 
                                  required type="email" name="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)}
                                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D9B26E] outline-none transition-all placeholder:text-gray-300 font-bold"
                                  placeholder="seu@email.com"
                                />
                              </div>
                              <div className="group">
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 group-focus-within:text-[#D9B26E]">WHATSAPP <span className="text-[#D9B26E]">*</span></label>
                                <div className="flex gap-2">
                                  <div className="flex items-center gap-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-600">
                                    BR +55
                                  </div>
                                  <input 
                                    required name="phone" value={formData.phone} onChange={(e) => handlePhoneChange(e.target.value)}
                                    className="flex-1 px-5 py-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D9B26E] outline-none transition-all placeholder:text-gray-300 font-bold"
                                    placeholder="(11) 99999-9999"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div>
                          <TrustSignals />
                          
                          <div className="mt-8 flex flex-col items-center gap-4">
                          <motion.button
                              type={currentStep < 5 ? "button" : "submit"}
                              onClick={currentStep < 5 ? nextStep : undefined}
                              disabled={loading}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              className={`w-full py-5 font-black text-xl rounded-xl transition-all uppercase tracking-tight flex items-center justify-center gap-2 group relative overflow-hidden ${
                                currentStep < 5 
                                  ? "bg-gradient-to-b from-[#E11D48] to-[#BE123C] text-white shadow-[0_10px_20px_rgba(225,29,72,0.2)]" 
                                  : "bg-gradient-to-b from-[#22C55E] to-[#16A34A] text-white shadow-[0_10px_20px_rgba(34,197,94,0.2)]"
                              }`}
                              animate={currentStep === 5 && !loading ? { scale: [1, 1.02, 1] } : {}}
                              transition={currentStep === 5 ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : {}}
                            >
                              {/* Hover Shimmer */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                              
                              <span className="relative z-10">
                                {currentStep < 5 ? "Avançar" : (loading ? "Salvando..." : "Quero meu diagnóstico gratuito")}
                              </span>
                              
                              <motion.span 
                                className="text-2xl leading-none font-normal relative z-10"
                                animate={{ x: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                              >
                                →
                              </motion.span>
                            </motion.button>

                            <div className="flex flex-col items-center gap-2">
                              {currentStep > 0 && (
                                <button onClick={prevStep} type="button" className="text-gray-400 text-sm font-bold hover:text-gray-600 transition-colors uppercase tracking-widest flex items-center gap-2">
                                  ← Voltar
                                </button>
                              )}
                              <p className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                                <span className="text-sm">🔒</span> Dados seguros · Criptografia SSL · Sem spam
                              </p>
                            </div>
                          </div>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="relative bg-gradient-to-b from-[#E4E4E7] via-[#D8D8DC] to-[#CDCDD2] border-t border-zinc-300/60 py-16 overflow-hidden">
                {/* Clean subtle micro grid pattern on silver background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
                
                {/* Soft Gold Branding radial light glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(217,178,110,0.06)_0%,transparent_70%)] pointer-events-none filter blur-2xl" />
                
                {/* Fine silver layout line */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-400/50 to-transparent" />
                
                <div className="relative z-10">
                  <SocialProofTicker />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!videoEnded && (
          <button onClick={() => setVideoEnded(true)} className="mt-8 text-gray-400 text-[10px] uppercase font-bold hover:text-red-500 transition-colors">
            Pular vídeo (Apenas para demonstração)
          </button>
        )}
      </main>

      <footer className="py-12 bg-white mt-10">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-400 text-[10px] space-y-3 uppercase tracking-[0.2em] font-black">
          <p>© 2026 VALEUR CONSULTORIA | TODOS OS DIREITOS RESERVADOS</p>
        </div>
      </footer>
    </div>
  );
}
