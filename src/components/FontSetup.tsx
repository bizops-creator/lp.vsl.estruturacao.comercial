import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Download, RefreshCw, Check, AlertCircle } from 'lucide-react';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.readonly');

export const FontSetup = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message?: string }>({ type: 'idle' });
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      setToken(credential?.accessToken || null);
      if (credential?.accessToken) {
        fetchDriveFiles(credential.accessToken);
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Falha na autenticação' });
    }
  };

  const fetchDriveFiles = async (t: string, folderId?: string) => {
    setLoading(true);
    try {
      // List ZIP and Font files
      let q = "(mimeType = 'application/zip' or mimeType = 'font/otf' or mimeType = 'font/ttf' or mimeType = 'application/x-font-ttf' or mimeType = 'application/x-font-otf' or name contains '.ttf' or name contains '.otf' or name contains '.zip')";
      
      if (folderId) {
        q = `('${folderId}' in parents) and ${q}`;
      }

      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&pageSize=50&fields=files(id, name, mimeType)&orderBy=name`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      setFiles(data.files || []);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: `Erro ao buscar arquivos: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (fileId: string, fileName?: string) => {
    if (!token) {
      setStatus({ type: 'error', message: 'Por favor, conecte ao Google Drive primeiro.' });
      return;
    }
    setStatus({ type: 'loading', message: 'Sincronizando...' });
    try {
      const res = await fetch('/api/sync-fonts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, accessToken: token, fileName })
      });
      const result = await res.json();
      if (result.success) {
        setStatus({ type: 'success', message: `Sucesso! Fontes aplicadas: ${result.files.join(', ')}` });
        // Refresh styles
        const styleId = 'custom-fonts-dynamic';
        let styleTag = document.getElementById(styleId);
        if (!styleTag) {
          styleTag = document.createElement('style');
          styleTag.id = styleId;
          document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = `* { transition: font-family 0.3s ease !important; }`;
        
        setTimeout(() => window.location.reload(), 2000);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="bg-bg-secondary p-8 rounded-2xl border border-white/10 space-y-6 mb-32 shadow-2xl relative z-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-display text-white italic tracking-tight">Identidade Valeur: Fontes</h3>
          <p className="text-xs text-text-muted">Conecte seu Google Drive para aplicar Publica Play e Accidental Presidency</p>
        </div>
        {!user ? (
          <button onClick={handleLogin} className="btn-primary text-[10px] py-3 px-6 shrink-0">CONECTAR DRIVE</button>
        ) : (
          <div className="flex items-center gap-4 bg-white/5 p-2 rounded-full pl-4">
            <span className="text-[10px] text-gold-primary font-bold uppercase tracking-tighter">{user.email?.split('@')[0]}</span>
            <button onClick={() => auth.signOut()} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"><RefreshCw size={12} /></button>
          </div>
        )}
      </div>

      {user && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-text-faint uppercase font-black tracking-widest pl-1">ID da Pasta (opcional)</label>
              <div className="flex gap-2">
                <input 
                  id="folder-id"
                  type="text" 
                  placeholder="Ex: 1CHMd3_Al..." 
                  defaultValue="1CHMd3_Al-ICobYydfvZO8SEd_zkzPQ-I"
                  className="bg-bg-primary border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-gold-primary outline-none flex-1 transition-all"
                />
                <button 
                  onClick={() => {
                    const input = document.getElementById('folder-id') as HTMLInputElement;
                    if (token) fetchDriveFiles(token, input.value);
                  }}
                  className="btn-secondary text-[10px] py-3 px-4 font-black"
                >
                  LISTAR PASTA
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] text-text-faint uppercase font-black tracking-widest pl-1 text-right block">Busca Direta por ID</label>
              <div className="flex gap-2">
                <input 
                  id="manual-id"
                  type="text" 
                  placeholder="ID do arquivo único" 
                  className="bg-bg-primary border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-gold-primary outline-none flex-1 transition-all"
                />
                <button 
                  onClick={() => {
                    const input = document.getElementById('manual-id') as HTMLInputElement;
                    if (input.value) handleSync(input.value);
                    else if (token) fetchDriveFiles(token);
                  }}
                  className="btn-primary text-[10px] py-3 px-6 font-black"
                >
                  SYNC
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <RefreshCw className="animate-spin text-gold-primary" size={32} />
              <p className="text-[10px] text-gold-primary font-black uppercase animate-pulse">Acessando Google Drive...</p>
            </div>
          ) : (
            <div className="grid gap-2 max-h-80 overflow-y-auto pr-3 custom-scrollbar">
              {files.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
                  <AlertCircle size={32} className="mx-auto text-text-faint mb-3 opacity-20" />
                  <p className="text-xs text-text-faint max-w-xs mx-auto">Nenhum arquivo encontrado. Verifique o ID da pasta ou se você tem permissão de acesso.</p>
                </div>
              ) : (
                files.map(file => (
                  <button 
                    key={file.id} 
                    onClick={() => handleSync(file.id, file.name)}
                    className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-gold-primary/5 hover:border-gold-primary/30 group transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-gold-primary/10 transition-colors">
                        <Download size={18} className="text-text-faint group-hover:text-gold-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-text-secondary group-hover:text-white transition-colors truncate max-w-[180px] md:max-w-sm">{file.name}</span>
                        <span className="text-[9px] text-text-faint uppercase font-bold tracking-tighter">{file.mimeType.replace('application/', '').replace('font/', '')}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-gold-primary opacity-0 group-hover:opacity-100 uppercase tracking-widest pl-4 shrink-0 transition-opacity">Sincronizar</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {status.type !== 'idle' && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          status.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 
          status.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 
          'bg-gold-primary/10 border border-gold-primary/20 text-gold-primary'
        }`}>
          {status.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <p className="text-xs">{status.message}</p>
        </div>
      )}
      
      <div className="pt-4 border-t border-white/5">
        <p className="text-[10px] text-text-faint italic leading-relaxed">
          Instruções: O sistema procura por arquivos com "publica" ou "accidental" no nome. Eles serão salvos como <strong className="text-white">PublicaPlay.otf</strong> e <strong className="text-white">AccidentalPresidency.ttf</strong> automaticamente.
        </p>
      </div>
    </div>
  );
};
