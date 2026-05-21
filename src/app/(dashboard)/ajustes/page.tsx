"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Building2, Settings, AlertTriangle, CheckCircle2, Pencil } from "lucide-react";
import { motion } from "framer-motion";

const PREFS_KEY = 'trackpro_preferences';
const PROFILE_KEY = 'trackpro_profile';
const ORG_KEY = 'trackpro_org';

interface Preferences {
  language: string;
  timezone: string;
  units: string;
}

interface Profile {
  name: string;
  email: string;
  role: string;
  initials: string;
}

interface OrgSettings {
  name: string;
  plan: string;
}

const defaultPrefs: Preferences = { language: 'Español', timezone: 'America/Santo_Domingo', units: 'Métrico' };

const defaultProfile: Profile = {
  name: 'Admin GPS Smart',
  email: 'admin@gpssmart.com',
  role: 'Administrador',
  initials: 'AG',
};

const defaultOrg: OrgSettings = {
  name: 'Condominio El Rosal',
  plan: 'Demo',
};

export default function AjustesPage() {
  const router = useRouter();

  const [prefs, setPrefs] = useState<Preferences>(() => {
    if (typeof window === 'undefined') return defaultPrefs;
    try {
      const saved = localStorage.getItem(PREFS_KEY);
      return saved ? { ...defaultPrefs, ...JSON.parse(saved) } : defaultPrefs;
    } catch { return defaultPrefs; }
  });
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState<Profile>(() => {
    if (typeof window === 'undefined') return defaultProfile;
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      return saved ? { ...defaultProfile, ...JSON.parse(saved) } : defaultProfile;
    } catch { return defaultProfile; }
  });
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileFormData, setProfileFormData] = useState(profile);
  const [profileSaved, setProfileSaved] = useState(false);

  const [org, setOrg] = useState<OrgSettings>(() => {
    if (typeof window === 'undefined') return defaultOrg;
    try {
      const saved = localStorage.getItem(ORG_KEY);
      return saved ? { ...defaultOrg, ...JSON.parse(saved) } : defaultOrg;
    } catch { return defaultOrg; }
  });
  const [orgEdit, setOrgEdit] = useState(false);
  const [orgFormData, setOrgFormData] = useState(org);
  const [orgSaved, setOrgSaved] = useState(false);

  const saveProfile = () => {
    const words = profileFormData.name.split(' ').filter(w => w.length > 0);
    let initials = '';
    if (words.length > 0) initials += words[0][0].toUpperCase();
    if (words.length > 1) initials += words[1][0].toUpperCase();
    
    const updated = { ...profileFormData, initials: initials || 'US' };
    setProfile(updated);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    setProfileSaved(true);
    setProfileEdit(false);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const saveOrg = () => {
    setOrg(orgFormData);
    localStorage.setItem(ORG_KEY, JSON.stringify(orgFormData));
    setOrgSaved(true);
    setOrgEdit(false);
    setTimeout(() => setOrgSaved(false), 2000);
  };

  const savePrefs = () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    document.cookie = 'gps_auth=; path=/; max-age=0';
    router.push('/login');
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <h1 className="text-2xl font-semibold mb-8 text-[var(--color-text-primary)]">Ajustes</h1>

      <div className="max-w-2xl flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
          className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <User className="w-5 h-5 text-[var(--color-accent-blue)]" />
              <h2 className="text-lg font-medium text-[var(--color-text-primary)]">Perfil del Usuario</h2>
            </div>
            {!profileEdit && (
              <button onClick={() => { setProfileFormData(profile); setProfileEdit(true); }} className="text-[var(--color-text-secondary)] hover:text-white transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-start gap-4 ml-9">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg shrink-0 mt-1">
              {profile.initials}
            </div>
            <div className="flex flex-col gap-3 w-full">
              {profileEdit ? (
                <>
                  <div>
                    <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block mb-1">Nombre</label>
                    <input type="text" value={profileFormData.name} onChange={e => setProfileFormData({...profileFormData, name: e.target.value})} className="search-input w-full" />
                  </div>
                  <div>
                    <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block mb-1">Email</label>
                    <input type="email" value={profileFormData.email} onChange={e => setProfileFormData({...profileFormData, email: e.target.value})} className="search-input w-full" />
                  </div>
                  <div>
                    <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block mb-1">Rol</label>
                    <div className="text-[var(--color-text-primary)] text-sm px-3 py-2.5 bg-[var(--color-surface-hover)] rounded-xl opacity-50 cursor-not-allowed border border-[var(--color-border-glass)]">{profile.role}</div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={saveProfile} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all">
                      Guardar
                    </button>
                    <button onClick={() => setProfileEdit(false)} className="px-5 py-2.5 text-[var(--color-text-secondary)] hover:text-white text-sm transition-all">
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block">Nombre</label>
                    <div className="text-[var(--color-text-primary)] text-sm">{profile.name}</div>
                  </div>
                  <div>
                    <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block">Email</label>
                    <div className="text-[var(--color-text-primary)] text-sm">{profile.email}</div>
                  </div>
                  <div>
                    <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block">Rol</label>
                    <div className="text-[var(--color-text-primary)] text-sm">{profile.role}</div>
                  </div>
                  {profileSaved && (
                    <div className="flex items-center gap-2 text-green-400 text-sm mt-1">
                      <CheckCircle2 className="w-4 h-4" /> Guardado
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Building2 className="w-5 h-5 text-[var(--color-accent-blue)]" />
              <h2 className="text-lg font-medium text-[var(--color-text-primary)]">Organización</h2>
            </div>
            {!orgEdit && (
              <button onClick={() => { setOrgFormData(org); setOrgEdit(true); }} className="text-[var(--color-text-secondary)] hover:text-white transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex flex-col gap-3 ml-9">
            {orgEdit ? (
              <>
                <div>
                  <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block mb-1">Nombre</label>
                  <input type="text" value={orgFormData.name} onChange={e => setOrgFormData({...orgFormData, name: e.target.value})} className="search-input w-full" />
                </div>
                <div>
                  <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block mb-1">Plan</label>
                  <div className="text-[var(--color-text-primary)] text-sm px-3 py-2.5 bg-[var(--color-surface-hover)] rounded-xl opacity-50 cursor-not-allowed border border-[var(--color-border-glass)]">{org.plan}</div>
                </div>
                <div>
                  <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block mb-1">Vehículos Activos</label>
                  <div className="text-[var(--color-text-primary)] text-sm px-3 py-2.5 bg-[var(--color-surface-hover)] rounded-xl opacity-50 cursor-not-allowed border border-[var(--color-border-glass)]">5</div>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={saveOrg} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all">
                    Guardar
                  </button>
                  <button onClick={() => setOrgEdit(false)} className="px-5 py-2.5 text-[var(--color-text-secondary)] hover:text-white text-sm transition-all">
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block">Nombre</label>
                  <div className="text-[var(--color-text-primary)] text-sm">{org.name}</div>
                </div>
                <div>
                  <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block">Plan</label>
                  <div className="text-[var(--color-text-primary)] text-sm">{org.plan}</div>
                </div>
                <div>
                  <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block">Vehículos Activos</label>
                  <div className="text-[var(--color-text-primary)] text-sm">5</div>
                </div>
                {orgSaved && (
                  <div className="flex items-center gap-2 text-green-400 text-sm mt-1">
                    <CheckCircle2 className="w-4 h-4" /> Guardado
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl p-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <Settings className="w-5 h-5 text-[var(--color-accent-blue)]" />
            <h2 className="text-lg font-medium text-[var(--color-text-primary)]">Preferencias</h2>
          </div>
          <div className="flex flex-col gap-3 ml-9">
            <div>
              <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block mb-1">Idioma</label>
              <select value={prefs.language} onChange={e => setPrefs({...prefs, language: e.target.value})} className="search-input w-full">
                <option>Español</option>
                <option>English</option>
              </select>
            </div>
            <div>
              <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block mb-1">Zona Horaria</label>
              <select value={prefs.timezone} onChange={e => setPrefs({...prefs, timezone: e.target.value})} className="search-input w-full">
                <option value="America/Santo_Domingo">America/Santo_Domingo (UTC-4)</option>
                <option value="America/New_York">America/New_York (UTC-5)</option>
                <option value="America/Bogota">America/Bogota (UTC-5)</option>
              </select>
            </div>
            <div>
              <label className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider block mb-1">Unidades</label>
              <select value={prefs.units} onChange={e => setPrefs({...prefs, units: e.target.value})} className="search-input w-full">
                <option>Métrico</option>
                <option>Imperial</option>
              </select>
            </div>
            <div className="mt-2">
              <button onClick={savePrefs}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2">
                {saved ? <><CheckCircle2 className="w-4 h-4" /> Guardado</> : 'Guardar preferencias'}
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-[var(--color-surface-glass)] border border-[var(--color-border-glass)] rounded-2xl p-6"
        >
          <div className="flex items-center gap-4 mb-4 cursor-default">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-medium text-red-400">Sesión</h2>
          </div>
          <div className="ml-9">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" /> Cerrar Sesión
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
