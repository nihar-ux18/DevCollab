import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.username || 'dev_architect_42');
  const [email, setEmail] = useState(user?.email || 'alex.coder@devcollab.io');
  const [fontSize, setFontSize] = useState<number>(14);
  const [tabSize, setTabSize] = useState<string>('4');
  const [wordWrap, setWordWrap] = useState<boolean>(true);

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  const handleClose = () => {
    navigate('/dashboard');
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex">
      {/* SideNavBar */}
      <aside className="flex flex-col h-screen w-panel-sidebar fixed left-0 top-0 z-40 bg-surface-container-low border-r border-outline-variant">
        <div className="p-6">
          <Link to="/dashboard" className="text-headline-md font-headline-md text-primary flex items-center gap-2 hover:opacity-90">
            <span className="material-symbols-outlined">terminal</span>
            DevCollab
          </Link>
          <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70">Pro Workspace</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          <Link className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-variant transition-all duration-150 ease-in-out font-label-sm text-label-sm" to="/dashboard">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </Link>
          <Link className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-variant transition-all duration-150 ease-in-out font-label-sm text-label-sm" to="/history">
            <span className="material-symbols-outlined">history</span>
            History
          </Link>
          <Link className="flex items-center gap-3 px-3 py-2 bg-secondary-container text-on-secondary-container border-l-2 border-primary transition-all duration-150 ease-in-out font-label-sm text-label-sm" to="/settings">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </Link>
        </nav>
        <div className="px-6 py-4">
          <button onClick={logout} className="w-full py-2 bg-error-container/30 text-error font-label-sm text-label-sm rounded-lg hover:bg-error-container/50 transition-colors cursor-pointer border border-error/20 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="ml-[260px] min-h-screen flex flex-col flex-grow">
        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full px-margin-desktop h-panel-toolbar sticky top-0 z-50 bg-surface-container border-b border-outline-variant">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-1.5 pl-10 pr-4 text-body-md font-body-md focus:border-primary outline-none transition-colors text-on-surface" placeholder="Search projects or code..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:bg-surface-variant p-2 rounded-lg transition-colors cursor-pointer border-none bg-transparent">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant ml-2 bg-surface-container-highest">
              <img className="object-cover h-full w-full" alt="User Headshot" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNq3R-Hjm1jDuxIn91YmckjkR_bNbS7DVTVlXeCgfAwBpMU2_oGzRaxSKOjc5gqXdtxfGOrPrq5RwHDFlpC04m_QGfAtlOMa-9318ZEsRNLILe-xFI3AMhn8Y1Zleivxf6CIL20ZeT2XFKPfJ8fgN2tv09yBppzPXPdTHRRHoJeWADr7Po9qpfv5nVI1HHHX06a-axV21OexbJnJITpW5aL3FxLjDcSc56sCvAK5pfA5QEXWbqzNdrNx2Z7PSHonaPBF7Xcw1zV28" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 flex-grow flex justify-center items-start">
          <div className="w-full max-w-4xl bg-surface-container-low rounded-xl border border-outline-variant shadow-2xl overflow-hidden flex flex-col md:flex-row h-[870px]">
            {/* Internal Settings Sidebar */}
            <aside className="w-full md:w-64 bg-surface-container border-r border-outline-variant flex flex-col p-4 gap-2">
              <div className="mb-6 px-2">
                <h2 className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest">Workspace</h2>
              </div>
              <nav className="flex flex-col gap-1">
                <a className="flex items-center gap-3 px-3 py-2 rounded bg-secondary-container text-on-secondary-container border-l-2 border-primary transition-all duration-150" href="#profile">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                  <span className="font-label-sm text-label-sm">Profile</span>
                </a>
                <a className="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant hover:bg-surface-variant transition-all duration-150" href="#preferences">
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                  <span className="font-label-sm text-label-sm">Preferences</span>
                </a>
                <a className="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant hover:bg-surface-variant transition-all duration-150" href="#account">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                  <span className="font-label-sm text-label-sm">Account</span>
                </a>
              </nav>
              <div className="mt-auto pt-4 border-t border-outline-variant space-y-2">
                <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 bg-primary-container text-on-primary-container py-2 rounded font-label-sm text-label-sm hover:opacity-90 transition-opacity border-none cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Save Changes
                </button>
                <button onClick={handleClose} className="w-full text-on-surface-variant hover:text-error py-2 font-label-sm text-label-sm transition-colors text-center border-none bg-transparent cursor-pointer">
                  Close
                </button>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-12">
              {/* Profile Section */}
              <section className="space-y-6" id="profile">
                <div>
                  <h3 className="text-headline-md font-headline-md text-on-surface">Profile Settings</h3>
                  <p className="text-on-surface-variant text-body-md mt-1">Manage your public presence and contact information.</p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-surface-container rounded-lg setting-card">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary-container">
                      <img className="w-full h-full object-cover" alt="Avatar wireframe" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZyoHavNErrdB3Zvz-iNsaRyEiVaxHxcnnv5I343JZUhZuR6eGRYXrMg6-3S0iId__WPTb8oc9prte2cOwC5etBUOv94tCQIqeAWiAcb3xgj8C1SzRBw2Re-CI5io-z76996Vwxyt7NT_UqkDSZWoE42VkvPUA6yw9TtBytKx9gG8tbHW8CjlH2MfRPZNkBvpduTgm6PCtgscgxcYHWBDtsLDC4HsVfUHLPycguks2X8lQRjbln32rgPgUw9IX9PJVrKNd1at4Gac" />
                    </div>
                    <button className="absolute inset-0 bg-surface/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full border-none cursor-pointer">
                      <span className="material-symbols-outlined text-white">photo_camera</span>
                    </button>
                  </div>
                  <div className="flex-1 w-full space-y-4">
                    <div className="space-y-1">
                      <label className="text-label-sm text-on-surface-variant ml-1">Username</label>
                      <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded px-3 py-2 text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" type="text" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-label-sm text-on-surface-variant ml-1">Email Address</label>
                      <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded px-3 py-2 text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" type="email" />
                    </div>
                  </div>
                </div>
              </section>

              {/* Preferences Section */}
              <section className="space-y-6" id="preferences">
                <div>
                  <h3 className="text-headline-md font-headline-md text-on-surface">Editor Preferences</h3>
                  <p className="text-on-surface-variant text-body-md mt-1">Customize your coding environment for maximum productivity.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Theme Toggle */}
                  <div className="p-4 bg-surface-container rounded-lg setting-card flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                      <span className="font-label-sm text-on-surface font-semibold">Editor Theme</span>
                      <span className="material-symbols-outlined text-primary text-[20px]">palette</span>
                    </div>
                    <div className="flex bg-surface-container-lowest p-1 rounded">
                      <button className="flex-1 py-1 rounded bg-surface-variant text-primary font-label-sm border-none cursor-pointer">Dark Contrast</button>
                      <button className="flex-1 py-1 rounded text-on-surface-variant font-label-sm hover:text-on-surface border-none bg-transparent cursor-pointer">Dracula</button>
                    </div>
                  </div>
                  {/* Font Size */}
                  <div className="p-4 bg-surface-container rounded-lg setting-card flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                      <span className="font-label-sm text-on-surface font-semibold">Font Size</span>
                      <span className="text-label-sm text-primary">{fontSize}px</span>
                    </div>
                    <input value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary" max="24" min="10" type="range" />
                    <div className="flex justify-between text-[10px] text-on-surface-variant">
                      <span>Small</span>
                      <span>Large</span>
                    </div>
                  </div>
                  {/* Tab Size */}
                  <div className="p-4 bg-surface-container rounded-lg setting-card flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                      <span className="font-label-sm text-on-surface font-semibold">Tab Size</span>
                      <span className="material-symbols-outlined text-primary text-[20px]">keyboard_tab</span>
                    </div>
                    <select value={tabSize} onChange={(e) => setTabSize(e.target.value)} className="bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 text-label-sm focus:border-primary outline-none text-on-surface cursor-pointer">
                      <option value="2">2 Spaces</option>
                      <option value="4">4 Spaces</option>
                      <option value="8">8 Spaces</option>
                    </select>
                  </div>
                  {/* Word Wrap */}
                  <div className="p-4 bg-surface-container rounded-lg setting-card flex items-center justify-between h-32">
                    <div className="space-y-1">
                      <span className="font-label-sm text-on-surface block font-semibold">Word Wrap</span>
                      <span className="text-[11px] text-on-surface-variant">Wrap long lines of code</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input checked={wordWrap} onChange={(e) => setWordWrap(e.target.checked)} className="sr-only peer" type="checkbox" />
                      <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                    </label>
                  </div>
                </div>
              </section>

              {/* Account Section */}
              <section className="space-y-6 pb-12" id="account">
                <div>
                  <h3 className="text-headline-md font-headline-md text-on-surface">Account Management</h3>
                  <p className="text-on-surface-variant text-body-md mt-1">Security settings and account status.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="flex items-center gap-3 p-4 bg-surface-container rounded-lg setting-card hover:bg-surface-container-high transition-colors group cursor-pointer border-none text-left">
                    <div className="w-10 h-10 rounded bg-surface-container-lowest flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">lock_reset</span>
                    </div>
                    <div>
                      <span className="block font-label-sm text-on-surface">Change Password</span>
                      <span className="text-[11px] text-on-surface-variant">Update security credentials</span>
                    </div>
                  </button>
                  <button onClick={logout} className="flex items-center gap-3 p-4 bg-surface-container rounded-lg setting-card border-error/20 hover:bg-error-container/20 transition-colors group cursor-pointer text-left">
                    <div className="w-10 h-10 rounded bg-error-container/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-error group-hover:scale-110 transition-transform">logout</span>
                    </div>
                    <div>
                      <span className="block font-label-sm text-error">Logout</span>
                      <span className="text-[11px] text-on-surface-variant">Sign out of this session</span>
                    </div>
                  </button>
                </div>
              </section>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-margin-desktop py-4 bg-surface-container border-t border-outline-variant flex justify-between items-center opacity-60 mt-auto">
          <div className="font-label-sm text-[11px] flex gap-4">
            <span>SYSTEM STATUS: <span className="text-secondary font-bold">OPERATIONAL</span></span>
            <span>SERVER: <span className="text-on-surface font-bold">US-EAST-1</span></span>
          </div>
          <div className="font-label-sm text-[11px] flex gap-4 items-center">
            <span className="material-symbols-outlined text-[14px]">verified_user</span>
            <span>SECURED SESSION</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Settings;
