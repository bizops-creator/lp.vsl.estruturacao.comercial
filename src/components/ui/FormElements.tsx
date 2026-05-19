import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  light?: boolean;
  className?: string;
}

export const FormInput = ({ label, className = "", light = false, ...props }: InputProps) => (
  <div className="w-full">
    {label && (
      <label className={`block text-[10px] font-black uppercase tracking-[0.4em] mb-4 ml-2 ${light ? 'text-primary/40' : 'text-brand-black/40'}`}>
        {label}
      </label>
    )}
    <input 
      className={`w-full px-8 py-5 rounded-2xl font-bold outline-none transition-all ${
        light 
          ? 'bg-white/5 border border-white/10 text-off-white focus:border-primary placeholder:text-white/10' 
          : 'bg-white border border-gray-200 text-brand-black focus:border-primary'
      } ${className}`}
      {...props} 
    />
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  light?: boolean;
  options: { value: string; label: string }[];
  className?: string;
}

export const FormSelect = ({ label, options, className = "", light = false, ...props }: SelectProps) => (
  <div className="w-full">
    {label && (
      <label className={`block text-[10px] font-black uppercase tracking-[0.4em] mb-4 ml-2 ${light ? 'text-primary/40' : 'text-brand-black/40'}`}>
        {label}
      </label>
    )}
    <select 
      className={`w-full px-8 py-5 rounded-2xl font-bold outline-none cursor-pointer transition-all ${
        light 
          ? 'bg-white/5 border border-white/10 text-off-white focus:border-primary' 
          : 'bg-white border border-gray-200 text-brand-black focus:border-primary'
      } ${className}`}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);
