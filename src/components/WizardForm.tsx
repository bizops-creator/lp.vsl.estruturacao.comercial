import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const WizardForm = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employees: '',
    segment: '',
    revenue: '',
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'serviceApplications'), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      setStep(6); // Success step
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Ocorreu um erro ao enviar. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / 5) * 100;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden shadow-2xl relative">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 h-1 bg-gold-primary transition-all duration-500 z-20" style={{ width: `${progress}%` }} />
      
      <div className="p-8 md:p-10">
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="font-display text-2xl md:text-3xl text-white leading-tight uppercase">
                  Pronto para escalar com previsibilidade?
                </h3>
                <p className="text-text-secondary text-sm">Preencha os dados abaixo para receber seu diagnóstico exclusivo.</p>
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  Quero meu diagnóstico <ArrowRight size={18} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="font-display text-xl text-white uppercase mb-4 italic">
                  Quantos funcionários na equipe de vendas?
                </h3>
                <div className="grid gap-3">
                  {['1 a 2', '3 a 5', '6 a 10', 'Mais de 10', 'Não temos time de vendas'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { setFormData({ ...formData, employees: opt }); nextStep(); }}
                      className="w-full text-left p-4 bg-white/5 border border-white/10 rounded-lg text-sm text-text-secondary hover:bg-gold-primary hover:text-bg-primary hover:border-gold-primary transition-all font-bold"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="font-display text-xl text-white uppercase italic mb-4">
                  Qual o seu segmento de atuação?
                </h3>
                <div className="grid gap-3">
                  {['Indústria', 'Agência', 'Telecom', 'Contabilidade', 'Serviços B2B', 'Outro'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { setFormData({ ...formData, segment: opt }); nextStep(); }}
                      className="w-full text-left p-4 bg-white/5 border border-white/10 rounded-lg text-sm text-text-secondary hover:bg-gold-primary hover:text-bg-primary hover:border-gold-primary transition-all font-bold"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={prevStep} className="text-xs text-text-muted hover:text-white underline">Voltar</button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="font-display text-xl text-white uppercase italic mb-4">
                  Faturamento mensal médio?
                </h3>
                <div className="grid gap-3">
                  {['Até R$100k', 'R$100k–500k', 'R$500k–1M', 'R$1M–5M', 'R$5M+'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { setFormData({ ...formData, revenue: opt }); nextStep(); }}
                      className="w-full text-left p-4 bg-white/5 border border-white/10 rounded-lg text-sm text-text-secondary hover:bg-gold-primary hover:text-bg-primary hover:border-gold-primary transition-all font-bold"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={prevStep} className="text-xs text-text-muted hover:text-white underline">Voltar</button>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="font-display text-xl text-white uppercase italic mb-4">
                  Último passo: seus dados de contato
                </h3>
                <input
                  type="text"
                  placeholder="Nome Completo"
                  required
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-gold-primary outline-none"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="E-mail Corporativo"
                  required
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-gold-primary outline-none"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
                <input
                  type="tel"
                  placeholder="WhatsApp"
                  required
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-gold-primary outline-none"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-4 disabled:opacity-50"
                >
                  {loading ? 'ENVIANDO...' : 'RECEBER MAIS INFORMAÇÕES'}
                </button>
                <button type="button" onClick={prevStep} className="text-xs text-text-muted hover:text-white underline">Voltar</button>
                <p className="text-[10px] text-text-faint text-center mt-4">
                  Atendemos empresas B2B com 10 a 50 funcionários. Seus dados estão 100% seguros.
                </p>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-16 h-16 bg-gold-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="text-bg-primary" size={32} />
                </div>
                <h3 className="font-display text-3xl text-white uppercase">Diagnóstico Solicitado!</h3>
                <p className="text-text-secondary">
                  Um de nossos especialistas entrará em contato em até 24h via WhatsApp ou E-mail.
                </p>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary w-full"
                >
                  FECHAR
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
};
