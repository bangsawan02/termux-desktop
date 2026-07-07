import { useState, useEffect } from 'react';

interface SetupConfig {
  deName: string;
  installed_browser: string;
  installed_ide: string;
  installed_media_player: string;
  installed_photo_editor: string;
  installed_wine: string;
  ext_wall_answer: boolean;
  chosen_shell_name: string;
  selected_zsh_theme_name: string;
  terminal_utility_setup_answer: boolean;
  fm_tools: boolean;
  gui_mode: string;
  display_number: number;
  de_on_startup: boolean;
  distro_add_answer: boolean;
  selected_distro_type: string;
  selected_distro: string;
  pd_audio_config_answer: boolean;
  pd_useradd_answer: boolean;
  pd_pass_type: string;
}

export default function App() {
  const [config, setConfig] = useState<SetupConfig>({
    deName: 'xfce',
    installed_browser: 'none',
    installed_ide: 'none',
    installed_media_player: 'none',
    installed_photo_editor: 'none',
    installed_wine: 'none',
    ext_wall_answer: false,
    chosen_shell_name: 'bash',
    selected_zsh_theme_name: 'none',
    terminal_utility_setup_answer: false,
    fm_tools: false,
    gui_mode: 'termux_x11',
    display_number: 0,
    de_on_startup: false,
    distro_add_answer: false,
    selected_distro_type: 'proot',
    selected_distro: 'debian',
    pd_audio_config_answer: false,
    pd_useradd_answer: false,
    pd_pass_type: '1'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [log, setLog] = useState('');
  const [commitMessage, setCommitMessage] = useState('update setup configurations');

  const pushChanges = async () => {
    setIsLoading(true);
    setLog('Generating JSON and pushing to GitHub...');
    try {
      const response = await fetch('/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, commitMessage })
      });
      const data = await response.json();
      setLog(data.log || (data.success ? 'Success' : 'Failed'));
    } catch (e: any) {
      setLog(e.message);
    }
    setIsLoading(false);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.checked });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 max-w-lg mx-auto pb-20">
      <header className="mb-6 border-b pb-4">
        <h1 className="text-xl font-medium text-gray-800">Termux Desktop Config</h1>
        <p className="text-sm text-gray-500">Minimalist Android UI</p>
      </header>
      
      <div className="space-y-4">
        {/* Environment Settings */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">Environment</h2>
          
          <label className="block mb-2">
            <span className="text-sm text-gray-600 block mb-1">Desktop Environment</span>
            <select name="deName" value={config.deName} onChange={handleSelectChange} className="w-full bg-gray-50 p-2 rounded-lg text-sm border-none focus:ring-2 focus:ring-blue-500">
              <option value="xfce">XFCE</option>
              <option value="lxqt">LXQT</option>
              <option value="openbox">Openbox</option>
              <option value="i3">i3</option>
            </select>
          </label>

          <label className="block mb-2">
            <span className="text-sm text-gray-600 block mb-1">Display Server</span>
            <select name="gui_mode" value={config.gui_mode} onChange={handleSelectChange} className="w-full bg-gray-50 p-2 rounded-lg text-sm border-none focus:ring-2 focus:ring-blue-500">
              <option value="termux_x11">Termux:X11</option>
              <option value="vnc">VNC</option>
              <option value="both">Both</option>
            </select>
          </label>
        </div>

        {/* Applications */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">Applications</h2>
          
          <label className="block mb-2">
            <span className="text-sm text-gray-600 block mb-1">Browser</span>
            <select name="installed_browser" value={config.installed_browser} onChange={handleSelectChange} className="w-full bg-gray-50 p-2 rounded-lg text-sm border-none focus:ring-2 focus:ring-blue-500">
              <option value="none">None</option>
              <option value="firefox">Firefox</option>
              <option value="chromium">Chromium</option>
              <option value="google-chrome-mobox">Chrome (Mobox)</option>
              <option value="all">All</option>
            </select>
          </label>

          <label className="block mb-2">
            <span className="text-sm text-gray-600 block mb-1">IDE</span>
            <select name="installed_ide" value={config.installed_ide} onChange={handleSelectChange} className="w-full bg-gray-50 p-2 rounded-lg text-sm border-none focus:ring-2 focus:ring-blue-500">
              <option value="none">None</option>
              <option value="code">VS Code</option>
            </select>
          </label>

          <label className="block mb-2">
            <span className="text-sm text-gray-600 block mb-1">Wine/Mobox</span>
            <select name="installed_wine" value={config.installed_wine} onChange={handleSelectChange} className="w-full bg-gray-50 p-2 rounded-lg text-sm border-none focus:ring-2 focus:ring-blue-500">
              <option value="none">None</option>
              <option value="wine_hangover">Wine (Hangover)</option>
              <option value="wine_vanilla">Wine (Vanilla)</option>
            </select>
          </label>
        </div>

        {/* Distro Settings */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
          <h2 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">Distro</h2>
          
          <label className="flex items-center space-x-3">
            <input type="checkbox" name="distro_add_answer" checked={config.distro_add_answer} onChange={handleCheckboxChange} className="w-5 h-5 rounded text-blue-600" />
            <span className="text-sm text-gray-700">Install Distro Container</span>
          </label>

          {config.distro_add_answer && (
            <>
              <label className="block mt-3 mb-2">
                <span className="text-sm text-gray-600 block mb-1">Type</span>
                <select name="selected_distro_type" value={config.selected_distro_type} onChange={handleSelectChange} className="w-full bg-gray-50 p-2 rounded-lg text-sm border-none focus:ring-2 focus:ring-blue-500">
                  <option value="proot">Proot</option>
                  <option value="chroot">Chroot (Root req)</option>
                </select>
              </label>

              <label className="block mt-2">
                <span className="text-sm text-gray-600 block mb-1">Distro</span>
                <select name="selected_distro" value={config.selected_distro} onChange={handleSelectChange} className="w-full bg-gray-50 p-2 rounded-lg text-sm border-none focus:ring-2 focus:ring-blue-500">
                  <option value="debian">Debian</option>
                  <option value="ubuntu">Ubuntu</option>
                  <option value="arch">Arch</option>
                  <option value="alpine">Alpine</option>
                  <option value="fedora">Fedora</option>
                </select>
              </label>
            </>
          )}
        </div>

        {/* Deploy */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mt-6">
          <label className="block mb-3">
            <span className="text-sm text-gray-600 block mb-1">Commit Message</span>
            <input 
              type="text" 
              value={commitMessage} 
              onChange={e => setCommitMessage(e.target.value)} 
              className="w-full bg-gray-50 p-2 rounded-lg text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </label>
          <button 
            onClick={pushChanges} 
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg shadow-sm active:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Processing...' : 'Save & Push'}
          </button>
        </div>

        {log && (
          <div className="bg-gray-900 text-green-400 p-3 rounded-xl text-xs font-mono whitespace-pre-wrap mt-4 h-32 overflow-auto">
            {log}
          </div>
        )}
      </div>
    </div>
  );
}
