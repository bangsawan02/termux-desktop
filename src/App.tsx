/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  Monitor, 
  Cpu, 
  Terminal, 
  Layers, 
  Check, 
  Copy, 
  Info, 
  ExternalLink, 
  Settings, 
  Sparkles, 
  Compass, 
  Smartphone, 
  Download, 
  BookOpen, 
  HelpCircle,
  Code,
  FolderSync,
  RefreshCw
} from 'lucide-react';

interface SetupConfig {
  deName: string;
  installed_browser: 'all' | 'firefox' | 'chromium' | 'google-chrome-mobox' | 'none';
  installed_ide: 'code' | 'none';
  installed_media_player: 'vlc' | 'none';
  installed_photo_editor: 'gimp' | 'none';
  installed_wine: 'wine_hangover' | 'wine_vanilla' | 'none';
  ext_wall_answer: boolean;
  chosen_shell_name: 'zsh' | 'bash' | 'fish';
  selected_zsh_theme_name: 'td_zsh' | 'none';
  terminal_utility_setup_answer: boolean;
  fm_tools: boolean;
  gui_mode: 'termux_x11' | 'vnc' | 'both';
  display_number: number;
  de_on_startup: boolean;
  distro_add_answer: boolean;
  selected_distro_type: 'proot' | 'chroot';
  selected_distro: 'debian' | 'ubuntu' | 'arch' | 'alpine' | 'fedora';
  pd_audio_config_answer: boolean;
  pd_useradd_answer: boolean;
  pd_pass_type: '1' | '2';
}

const DESKTOP_ENVIRONMENTS = [
  { id: 'xfce', name: 'Xfce 4', type: 'DE', desc: 'Balanced, highly customizable, extremely stable and lightweight. Recommended for most users.', ram: '2 GB', storage: '2 GB', popularity: 'Most Popular' },
  { id: 'lxqt', name: 'LXQt', type: 'DE', desc: 'Modern, extremely lightweight desktop environment based on Qt. Uses very low RAM.', ram: '1.5 GB', storage: '1.5 GB', popularity: 'Ultra Light' },
  { id: 'openbox', name: 'Openbox', type: 'WM', desc: 'Minimalist, fast window manager. Consumes almost zero resources, highly responsive.', ram: '1 GB', storage: '1 GB', popularity: 'Minimalist' },
  { id: 'i3', name: 'i3-wm', type: 'WM', desc: 'Tiling window manager. Keyboard-driven, perfect for power-users and smaller screens.', ram: '1 GB', storage: '1 GB', popularity: 'Keyboard-centric' },
  { id: 'mate', name: 'MATE', type: 'DE', desc: 'Traditional, intuitive, and highly stable. Safe and classic layout.', ram: '2 GB', storage: '2 GB', popularity: 'Classic' },
  { id: 'gnome', name: 'GNOME', type: 'DE', desc: 'Modern, beautiful gesture-driven UI. Recommended for high-end devices with lots of RAM.', ram: '4 GB', storage: '3.5 GB', popularity: 'Modern' },
  { id: 'cinnamon', name: 'Cinnamon', type: 'DE', desc: 'Sleek, traditional Windows-style interface with modern layout. Medium resource usage.', ram: '3 GB', storage: '3 GB', popularity: 'Familiar' },
  { id: 'kde', name: 'KDE Plasma', type: 'DE', desc: 'Extremely powerful, gorgeous, and customizable, but heavy on memory.', ram: '4 GB', storage: '4 GB', popularity: 'Feature-rich' },
  { id: 'dwm', name: 'dwm', type: 'WM', desc: 'Dynamic, simple, and clean window manager. Blazing fast.', ram: '1 GB', storage: '1 GB', popularity: 'Brutalist' },
  { id: 'bspwm', name: 'bspwm', type: 'WM', desc: 'Tiling window manager based on binary space partitioning.', ram: '1 GB', storage: '1 GB', popularity: 'Modular' },
  { id: 'awesome', name: 'Awesome', type: 'WM', desc: 'Highly customizable, next-generation framework window manager.', ram: '1.2 GB', storage: '1.2 GB', popularity: 'Hackable' },
  { id: 'fluxbox', name: 'Fluxbox', type: 'WM', desc: 'Lightweight window manager with tabbed windows and custom context menus.', ram: '1 GB', storage: '1 GB', popularity: 'Retro' },
  { id: 'icewm', name: 'IceWM', type: 'WM', desc: 'Super fast, lightweight window manager designed to mimic Windows 95/98 styling.', ram: '1 GB', storage: '1 GB', popularity: 'Retro-Win' },
  { id: 'wmaker', name: 'WindowMaker', type: 'WM', desc: 'Classic, unique NeXTSTEP-inspired window manager with tiny footprints.', ram: '1 GB', storage: '1.1 GB', popularity: 'Unique' },
];

export default function App() {
  const [config, setConfig] = useState<SetupConfig>({
    deName: 'xfce',
    installed_browser: 'all',
    installed_ide: 'code',
    installed_media_player: 'vlc',
    installed_photo_editor: 'gimp',
    installed_wine: 'wine_hangover',
    ext_wall_answer: true,
    chosen_shell_name: 'zsh',
    selected_zsh_theme_name: 'td_zsh',
    terminal_utility_setup_answer: true,
    fm_tools: true,
    gui_mode: 'termux_x11',
    display_number: 0,
    de_on_startup: false,
    distro_add_answer: false,
    selected_distro_type: 'proot',
    selected_distro: 'debian',
    pd_audio_config_answer: true,
    pd_useradd_answer: true,
    pd_pass_type: '1'
  });

  const [activeTab, setActiveTab] = useState<'configure' | 'reference' | 'requirements' | 'git'>('configure');
  const [copiedConf, setCopiedConf] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [copiedGeneral, setCopiedGeneral] = useState<string | null>(null);

  // Git management states
  const [gitStatus, setGitStatus] = useState<{ branch: string; modified: string[]; untracked: string[]; raw: string } | null>(null);
  const [gitLoading, setGitLoading] = useState(false);
  const [gitCommitMessage, setGitCommitMessage] = useState('update setup scripts');
  const [gitLog, setGitLog] = useState('');
  const [gitError, setGitError] = useState('');
  const [gitSuccess, setGitSuccess] = useState('');

  const fetchGitStatus = async () => {
    setGitLoading(true);
    setGitError('');
    setGitSuccess('');
    try {
      const res = await fetch('/api/git/status');
      const data = await res.json();
      if (data.success) {
        setGitStatus(data);
        if (data.raw) setGitLog(data.raw);
      } else {
        setGitError(data.error || 'Failed to fetch git status');
      }
    } catch (err: any) {
      setGitError(err.message || 'Network error fetching status');
    } finally {
      setGitLoading(false);
    }
  };

  const handleGitPush = async () => {
    setGitLoading(true);
    setGitError('');
    setGitSuccess('');
    try {
      const res = await fetch('/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commitMessage: gitCommitMessage,
          files: [] // Empty list to default to adding everything ('.')
        })
      });
      const data = await res.json();
      if (data.success) {
        setGitSuccess('Successfully committed and pushed changes to GitHub origin!');
        setGitLog(data.output);
        // Refresh status
        const statusRes = await fetch('/api/git/status');
        const statusData = await statusRes.json();
        if (statusData.success) {
          setGitStatus(statusData);
        }
      } else {
        setGitError(data.error || 'Failed to push changes');
        if (data.output) setGitLog(data.output);
      }
    } catch (err: any) {
      setGitError(err.message || 'Network error pushing changes');
    } finally {
      setGitLoading(false);
    }
  };

  const handleGitFix = async () => {
    if (!window.confirm('Are you sure you want to fix and repair the local .git directory? This will fetch a fresh copy of the .git tracking folder from GitHub.')) {
      return;
    }
    setGitLoading(true);
    setGitError('');
    setGitSuccess('');
    try {
      const res = await fetch('/api/git/fix', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setGitSuccess('Successfully repaired the git repository! Your local tracking is restored.');
        setGitLog(data.output);
        // Refresh status
        const statusRes = await fetch('/api/git/status');
        const statusData = await statusRes.json();
        if (statusData.success) {
          setGitStatus(statusData);
        }
      } else {
        setGitError(data.error || 'Failed to repair git repository');
        if (data.output) setGitLog(data.output);
      }
    } catch (err: any) {
      setGitError(err.message || 'Network error repairing repository');
    } finally {
      setGitLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'git') {
      fetchGitStatus();
    }
  }, [activeTab]);

  // Generate configuration file content
  const configurationConfContent = useMemo(() => {
    const lines = [
      `installed_browser=${config.installed_browser === 'none' ? 'skip' : config.installed_browser}`,
      `installed_ide=${config.installed_ide === 'none' ? 'skip' : config.installed_ide}`,
      `installed_media_player=${config.installed_media_player === 'none' ? 'skip' : config.installed_media_player}`,
      `installed_photo_editor=${config.installed_photo_editor === 'none' ? 'skip' : config.installed_photo_editor}`,
      `installed_wine=${config.installed_wine === 'none' ? 'skip' : config.installed_wine}`,
      `ext_wall_answer=${config.ext_wall_answer ? 'y' : 'n'}`,
      `chosen_shell_name=${config.chosen_shell_name}`,
      `selected_zsh_theme_name=${config.chosen_shell_name === 'zsh' ? config.selected_zsh_theme_name : 'none'}`,
      `terminal_utility_setup_answer=${config.terminal_utility_setup_answer ? 'y' : 'n'}`,
      `fm_tools=${config.fm_tools ? 'y' : 'n'}`,
      `gui_mode=${config.gui_mode}`,
      `display_number=${config.display_number}`,
      `de_on_startup=${config.de_on_startup ? 'y' : 'n'}`,
      `distro_add_answer=${config.distro_add_answer ? 'y' : 'n'}`
    ];

    if (config.distro_add_answer) {
      lines.push(
        `selected_distro_type=${config.selected_distro_type}`,
        `selected_distro=${config.selected_distro}`,
        `pd_audio_config_answer=${config.pd_audio_config_answer ? 'y' : 'n'}`,
        `pd_useradd_answer=${config.pd_useradd_answer ? 'y' : 'n'}`,
        `pd_pass_type=${config.pd_pass_type}`
      );
    }

    return lines.join('\n');
  }, [config]);

  // One-liner installer command utilizing config saving
  const installCommand = useMemo(() => {
    return `cat << 'EOF' > ~/configuration.conf\n${configurationConfContent}\nEOF\n\nbash <(curl -Lf https://raw.githubusercontent.com/bangsawan02/termux-desktop/main/setup-termux-desktop) --local-config ~/configuration.conf`;
  }, [configurationConfContent]);

  const handleCopyConf = () => {
    navigator.clipboard.writeText(configurationConfContent);
    setCopiedConf(true);
    setTimeout(() => setCopiedConf(false), 2000);
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(installCommand);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  const handleCopyGeneral = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedGeneral(id);
    setTimeout(() => setCopiedGeneral(null), 2000);
  };

  // Preset configuration modes
  const applyPreset = (preset: 'lite' | 'full') => {
    if (preset === 'lite') {
      setConfig(prev => ({
        ...prev,
        installed_browser: 'none',
        installed_ide: 'none',
        installed_media_player: 'none',
        installed_photo_editor: 'none',
        installed_wine: 'none',
        ext_wall_answer: false,
        terminal_utility_setup_answer: false,
        fm_tools: false,
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        installed_browser: 'all',
        installed_ide: 'code',
        installed_media_player: 'vlc',
        installed_photo_editor: 'gimp',
        installed_wine: 'wine_hangover',
        ext_wall_answer: true,
        terminal_utility_setup_answer: true,
        fm_tools: true,
      }));
    }
  };

  // Selected desktop info
  const selectedDeInfo = DESKTOP_ENVIRONMENTS.find(d => d.id === config.deName) || DESKTOP_ENVIRONMENTS[0];

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#2c3e50] font-sans flex flex-col">
      {/* Android Style Header */}
      <header className="bg-[#00796b] text-white px-4 py-4 md:py-6 shadow-md shrink-0 flex flex-col justify-between md:flex-row md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-6 h-6 stroke-[2]" id="header-phone-icon" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight" id="header-title">
              Termux Desktop
            </h1>
          </div>
          <p className="text-xs text-[#b2dfdb] mt-1 font-medium" id="header-subtitle">
            Configure & install a native Linux desktop on Android
          </p>
        </div>

        {/* Android Pill Tabs */}
        <div className="flex bg-[#004d40] p-1 rounded-full self-start md:self-auto" id="tabs-container">
          <button
            onClick={() => setActiveTab('configure')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'configure' 
                ? 'bg-[#00796b] text-white shadow-sm' 
                : 'text-[#80cbc4] hover:text-white'
            }`}
            id="tab-configure"
          >
            Customizer
          </button>
          <button
            onClick={() => setActiveTab('reference')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'reference' 
                ? 'bg-[#00796b] text-white shadow-sm' 
                : 'text-[#80cbc4] hover:text-white'
            }`}
            id="tab-reference"
          >
            Commands Guide
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'requirements' 
                ? 'bg-[#00796b] text-white shadow-sm' 
                : 'text-[#80cbc4] hover:text-white'
            }`}
            id="tab-requirements"
          >
            Requirements
          </button>
          <button
            onClick={() => setActiveTab('git')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'git' 
                ? 'bg-[#00796b] text-white shadow-sm' 
                : 'text-[#80cbc4] hover:text-white'
            }`}
            id="tab-git"
          >
            Git Sync
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {activeTab === 'configure' && (
          <>
            {/* Left Column: Form & Settings */}
            <div className="flex-1 space-y-6 min-w-0" id="config-form-pane">
              {/* Preset Cards */}
              <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="presets-card">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5" id="preset-title">
                    <Sparkles className="w-4 h-4 text-[#00796b]" /> Installation Mode Preset
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Instantly load configuration presets for light or full desktop installations.
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto" id="preset-buttons">
                  <button
                    onClick={() => applyPreset('lite')}
                    className="flex-1 sm:flex-none text-xs font-semibold px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    id="preset-lite-btn"
                  >
                    Lite Install (No Apps)
                  </button>
                  <button
                    onClick={() => applyPreset('full')}
                    className="flex-1 sm:flex-none text-xs font-semibold px-4 py-2 rounded-lg bg-[#00796b]/10 text-[#00796b] hover:bg-[#00796b]/20 transition-colors"
                    id="preset-full-btn"
                  >
                    Full Install (All Apps)
                  </button>
                </div>
              </div>

              {/* 1. Desktop Style Preferences */}
              <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-4" id="de-card">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <div className="p-2 bg-[#00796b]/10 text-[#00796b] rounded-xl">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900" id="de-card-title">Desktop Style</h2>
                    <p className="text-xs text-gray-500">Choose a Desktop Environment or Window Manager</p>
                  </div>
                </div>

                {/* Grid of Styles */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" id="de-options-grid">
                  {DESKTOP_ENVIRONMENTS.map(de => (
                    <button
                      key={de.id}
                      onClick={() => setConfig(prev => ({ ...prev, deName: de.id }))}
                      className={`text-left p-3 rounded-xl border text-xs flex flex-col justify-between transition-all relative ${
                        config.deName === de.id
                          ? 'border-[#00796b] bg-[#00796b]/5 text-[#00796b] ring-1 ring-[#00796b]'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      id={`de-opt-${de.id}`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="font-semibold text-gray-950 block truncate pr-1">{de.name}</span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 shrink-0">
                          {de.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 mt-2 block font-medium">
                        {de.popularity}
                      </span>
                      {config.deName === de.id && (
                        <div className="absolute right-2 bottom-2 bg-[#00796b] text-white p-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Display Specs / Hardware warning */}
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 text-xs text-amber-900" id="de-hardware-info">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">{selectedDeInfo.name} Specifications</p>
                    <p className="text-gray-600 font-medium leading-relaxed">
                      {selectedDeInfo.desc}
                    </p>
                    <div className="flex gap-4 pt-1 font-semibold text-amber-950">
                      <span>RAM Required: {selectedDeInfo.ram}</span>
                      <span>Storage: {selectedDeInfo.storage}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Access Settings */}
              <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-4" id="access-card">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <div className="p-2 bg-[#00796b]/10 text-[#00796b] rounded-xl">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900" id="access-card-title">GUI Access & Server</h2>
                    <p className="text-xs text-gray-500">Configure connection modes and startup behavior</p>
                  </div>
                </div>

                {/* GUI Mode Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 block">GUI Connection Server</label>
                  <div className="grid grid-cols-3 gap-2" id="gui-mode-selector">
                    {[
                      { id: 'termux_x11', label: 'Termux:X11', desc: 'Direct GPU, best performance' },
                      { id: 'vnc', label: 'VNC Server', desc: 'Classic network-based GUI' },
                      { id: 'both', label: 'Both', desc: 'Configure both backends' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, gui_mode: item.id as 'termux_x11' | 'vnc' | 'both' }))}
                        className={`p-3 rounded-xl border text-xs text-left flex flex-col justify-between transition-all ${
                          config.gui_mode === item.id
                            ? 'border-[#00796b] bg-[#00796b]/5 text-[#00796b]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        id={`gui-opt-${item.id}`}
                      >
                        <span className="font-semibold text-gray-900 block">{item.label}</span>
                        <span className="text-[10px] text-gray-500 mt-1 block leading-tight">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Switch Preference Item: Autostart */}
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors" id="row-autostart">
                  <div className="space-y-0.5 pr-4">
                    <label className="text-xs font-semibold text-gray-900 block">Desktop Autostart</label>
                    <span className="text-[11px] text-gray-500 block leading-tight">
                      Automatically start the desktop environment whenever you log in to Termux.
                    </span>
                  </div>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, de_on_startup: !prev.de_on_startup }))}
                    className={`w-11 h-6 shrink-0 rounded-full transition-colors relative ${
                      config.de_on_startup ? 'bg-[#00796b]' : 'bg-gray-300'
                    }`}
                    id="toggle-autostart"
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      config.de_on_startup ? 'left-6' : 'left-1'
                    }`} />
                  </button>
                </div>

                {/* Display Number Input */}
                {config.gui_mode !== 'vnc' && (
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors" id="row-display-number">
                    <div className="space-y-0.5">
                      <label className="text-xs font-semibold text-gray-900 block">Termux:X11 Display Port</label>
                      <span className="text-[11px] text-gray-500 block">Default display port used by X11 client (display :0)</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={config.display_number}
                      onChange={(e) => setConfig(prev => ({ ...prev, display_number: Math.max(0, parseInt(e.target.value) || 0) }))}
                      className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-xs text-center font-bold text-gray-800"
                      id="input-display-number"
                    />
                  </div>
                )}
              </div>

              {/* 3. Terminal & Shell Preferences */}
              <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-4" id="shell-card">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <div className="p-2 bg-[#00796b]/10 text-[#00796b] rounded-xl">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900" id="shell-card-title">Shell & Terminal</h2>
                    <p className="text-xs text-gray-500">Configure command-line shell environments</p>
                  </div>
                </div>

                {/* Shell selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 block">Default Shell</label>
                  <div className="grid grid-cols-3 gap-2" id="shell-selector">
                    {['zsh', 'bash', 'fish'].map(sh => (
                      <button
                        key={sh}
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, chosen_shell_name: sh as 'zsh' | 'bash' | 'fish' }))}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-center ${
                          config.chosen_shell_name === sh
                            ? 'border-[#00796b] bg-[#00796b]/5 text-[#00796b]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        id={`shell-opt-${sh}`}
                      >
                        {sh.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Zsh Theme option (only shown if shell is ZSH) */}
                {config.chosen_shell_name === 'zsh' && (
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors" id="row-zsh-theme">
                    <div className="space-y-0.5">
                      <label className="text-xs font-semibold text-gray-900 block">Install Custom Zsh Theme</label>
                      <span className="text-[11px] text-gray-500 block">Set up our gorgeous, modern terminal style (td_zsh).</span>
                    </div>
                    <button
                      onClick={() => setConfig(prev => ({ ...prev, selected_zsh_theme_name: prev.selected_zsh_theme_name === 'td_zsh' ? 'none' : 'td_zsh' }))}
                      className={`w-11 h-6 shrink-0 rounded-full transition-colors relative ${
                        config.selected_zsh_theme_name === 'td_zsh' ? 'bg-[#00796b]' : 'bg-gray-300'
                      }`}
                      id="toggle-zsh-theme"
                    >
                      <span className={`block w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                        config.selected_zsh_theme_name === 'td_zsh' ? 'left-6' : 'left-1'
                      }`} />
                    </button>
                  </div>
                )}

                {/* Switch Preference Item: Terminal Utilities */}
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors" id="row-terminal-utilities">
                  <div className="space-y-0.5 pr-4">
                    <label className="text-xs font-semibold text-gray-900 block">Terminal Utilities & MOTD</label>
                    <span className="text-[11px] text-gray-500 block leading-tight">
                      Install custom visual message-of-the-day (MOTD), beautiful system status widgets, and terminal metrics.
                    </span>
                  </div>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, terminal_utility_setup_answer: !prev.terminal_utility_setup_answer }))}
                    className={`w-11 h-6 shrink-0 rounded-full transition-colors relative ${
                      config.terminal_utility_setup_answer ? 'bg-[#00796b]' : 'bg-gray-300'
                    }`}
                    id="toggle-terminal-utilities"
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      config.terminal_utility_setup_answer ? 'left-6' : 'left-1'
                    }`} />
                  </button>
                </div>

                {/* Switch Preference Item: FM Tools */}
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors" id="row-fm-tools">
                  <div className="space-y-0.5 pr-4">
                    <label className="text-xs font-semibold text-gray-900 block">File Manager Integration Tools</label>
                    <span className="text-[11px] text-gray-500 block leading-tight">
                      Install native command line and GUI integration tools for browsing system folders.
                    </span>
                  </div>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, fm_tools: !prev.fm_tools }))}
                    className={`w-11 h-6 shrink-0 rounded-full transition-colors relative ${
                      config.fm_tools ? 'bg-[#00796b]' : 'bg-gray-300'
                    }`}
                    id="toggle-fm-tools"
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      config.fm_tools ? 'left-6' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* 4. Preinstalled Software Preferences */}
              <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-4" id="apps-card">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <div className="p-2 bg-[#00796b]/10 text-[#00796b] rounded-xl">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900" id="apps-card-title">Preinstalled Desktop Software</h2>
                    <p className="text-xs text-gray-500">Pick which major GUI software suites to pre-configure</p>
                  </div>
                </div>

                {/* Web Browser row */}
                <div className="p-3 bg-gray-50 rounded-xl space-y-2.5" id="app-row-browser">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-gray-900">Web Browser Suite</span>
                      <span className="text-[10px] text-gray-500 block">Configure web surfing applications</span>
                    </div>
                    <span className="text-[10px] bg-[#00796b]/10 text-[#00796b] px-1.5 py-0.5 rounded font-bold">Heavier package</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5" id="browser-selector">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'firefox', label: 'Firefox' },
                      { id: 'chromium', label: 'Chromium' },
                      { id: 'google-chrome-mobox', label: 'Chrome (Mobox)' },
                      { id: 'none', label: 'Skip' }
                    ].map(b => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, installed_browser: b.id as any }))}
                        className={`py-1.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                          config.installed_browser === b.id
                            ? 'border-[#00796b] bg-[#00796b]/5 text-[#00796b]'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                        id={`browser-opt-${b.id}`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* IDE / VS Code row */}
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors" id="app-row-ide">
                  <div className="space-y-0.5">
                    <label className="text-xs font-semibold text-gray-900 block">Visual Studio Code (VSCodium)</label>
                    <span className="text-[11px] text-gray-500 block">Visual developer environment with full editor.</span>
                  </div>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, installed_ide: prev.installed_ide === 'code' ? 'none' : 'code' }))}
                    className={`w-11 h-6 shrink-0 rounded-full transition-colors relative ${
                      config.installed_ide === 'code' ? 'bg-[#00796b]' : 'bg-gray-300'
                    }`}
                    id="toggle-ide"
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      config.installed_ide === 'code' ? 'left-6' : 'left-1'
                    }`} />
                  </button>
                </div>

                {/* Media Player row */}
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors" id="app-row-media">
                  <div className="space-y-0.5">
                    <label className="text-xs font-semibold text-gray-900 block">VLC Media Player</label>
                    <span className="text-[11px] text-gray-500 block">Flexible, multi-format hardware-accelerated player.</span>
                  </div>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, installed_media_player: prev.installed_media_player === 'vlc' ? 'none' : 'vlc' }))}
                    className={`w-11 h-6 shrink-0 rounded-full transition-colors relative ${
                      config.installed_media_player === 'vlc' ? 'bg-[#00796b]' : 'bg-gray-300'
                    }`}
                    id="toggle-media"
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      config.installed_media_player === 'vlc' ? 'left-6' : 'left-1'
                    }`} />
                  </button>
                </div>

                {/* Photo Editor row */}
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors" id="app-row-photo">
                  <div className="space-y-0.5">
                    <label className="text-xs font-semibold text-gray-900 block">GIMP Photo Editor</label>
                    <span className="text-[11px] text-gray-500 block">Comprehensive image retouching & raster editor.</span>
                  </div>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, installed_photo_editor: prev.installed_photo_editor === 'gimp' ? 'none' : 'gimp' }))}
                    className={`w-11 h-6 shrink-0 rounded-full transition-colors relative ${
                      config.installed_photo_editor === 'gimp' ? 'bg-[#00796b]' : 'bg-gray-300'
                    }`}
                    id="toggle-photo"
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      config.installed_photo_editor === 'gimp' ? 'left-6' : 'left-1'
                    }`} />
                  </button>
                </div>

                {/* Wine Compatibility row */}
                <div className="p-3 bg-gray-50 rounded-xl space-y-2.5" id="app-row-wine">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-gray-900">Wine Windows Compatibility</span>
                      <span className="text-[10px] text-gray-500 block">Run Windows executables (.exe) under Android</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5" id="wine-selector">
                    {[
                      { id: 'wine_hangover', label: 'Hangover (Fast)' },
                      { id: 'wine_vanilla', label: 'Vanilla Wine' },
                      { id: 'none', label: 'Skip' }
                    ].map(w => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, installed_wine: w.id as any }))}
                        className={`py-1.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                          config.installed_wine === w.id
                            ? 'border-[#00796b] bg-[#00796b]/5 text-[#00796b]'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                        id={`wine-opt-${w.id}`}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wallpaper row */}
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors" id="row-wallpaper">
                  <div className="space-y-0.5">
                    <label className="text-xs font-semibold text-gray-900 block">External Desktop Wallpapers Pack</label>
                    <span className="text-[11px] text-gray-500 block">Download and configure premium customized desktop wallpapers.</span>
                  </div>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, ext_wall_answer: !prev.ext_wall_answer }))}
                    className={`w-11 h-6 shrink-0 rounded-full transition-colors relative ${
                      config.ext_wall_answer ? 'bg-[#00796b]' : 'bg-gray-300'
                    }`}
                    id="toggle-wallpaper"
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      config.ext_wall_answer ? 'left-6' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* 5. PRoot Distro Container Preferences */}
              <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-4" id="container-card">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#00796b]/10 text-[#00796b] rounded-xl">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900" id="container-card-title">Linux Distro Container</h2>
                      <p className="text-xs text-gray-500">Run a complete Linux distribution inside Termux</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, distro_add_answer: !prev.distro_add_answer }))}
                    className={`w-11 h-6 shrink-0 rounded-full transition-colors relative ${
                      config.distro_add_answer ? 'bg-[#00796b]' : 'bg-gray-300'
                    }`}
                    id="toggle-distro-add"
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      config.distro_add_answer ? 'left-6' : 'left-1'
                    }`} />
                  </button>
                </div>

                {config.distro_add_answer ? (
                  <div className="space-y-4 pt-1" id="container-settings-subpane">
                    {/* Distro type selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 block">Container Core Backend</label>
                      <div className="grid grid-cols-2 gap-2" id="distro-backend-selector">
                        {[
                          { id: 'proot', label: 'PRoot (User-Space)', desc: 'Works on all devices, no root' },
                          { id: 'chroot', label: 'Chroot (Root Required)', desc: 'Requires full android system root' }
                        ].map(item => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setConfig(prev => ({ ...prev, selected_distro_type: item.id as 'proot' | 'chroot' }))}
                            className={`p-3 rounded-xl border text-xs text-left flex flex-col justify-between transition-all ${
                              config.selected_distro_type === item.id
                                ? 'border-[#00796b] bg-[#00796b]/5 text-[#00796b]'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                            id={`distro-backend-opt-${item.id}`}
                          >
                            <span className="font-semibold text-gray-900 block">{item.label}</span>
                            <span className="text-[10px] text-gray-500 mt-1 block leading-normal">{item.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Target Distribution */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 block">Target Distribution Base</label>
                      <div className="grid grid-cols-5 gap-1.5" id="distro-selector">
                        {['debian', 'ubuntu', 'arch', 'alpine', 'fedora'].map(d => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setConfig(prev => ({ ...prev, selected_distro: d as any }))}
                            className={`py-1.5 rounded-lg border text-xs font-bold text-center capitalize transition-all ${
                              config.selected_distro === d
                                ? 'border-[#00796b] bg-[#00796b]/5 text-[#00796b]'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                            id={`distro-opt-${d}`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* PulseAudio switch */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors" id="row-pd-audio">
                      <div className="space-y-0.5">
                        <label className="text-xs font-semibold text-gray-900 block">Configure PulseAudio Server</label>
                        <span className="text-[11px] text-gray-500 block">Enables high-fidelity native audio output inside container.</span>
                      </div>
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, pd_audio_config_answer: !prev.pd_audio_config_answer }))}
                        className={`w-11 h-6 shrink-0 rounded-full transition-colors relative ${
                          config.pd_audio_config_answer ? 'bg-[#00796b]' : 'bg-gray-300'
                        }`}
                        id="toggle-pd-audio"
                      >
                        <span className={`block w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                          config.pd_audio_config_answer ? 'left-6' : 'left-1'
                        }`} />
                      </button>
                    </div>

                    {/* Auto Create User switch */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors" id="row-pd-user">
                      <div className="space-y-0.5">
                        <label className="text-xs font-semibold text-gray-900 block">Setup Non-Root Sudo User</label>
                        <span className="text-[11px] text-gray-500 block">Auto-creates a secure standard user account.</span>
                      </div>
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, pd_useradd_answer: !prev.pd_useradd_answer }))}
                        className={`w-11 h-6 shrink-0 rounded-full transition-colors relative ${
                          config.pd_useradd_answer ? 'bg-[#00796b]' : 'bg-gray-300'
                        }`}
                        id="toggle-pd-user"
                      >
                        <span className={`block w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                          config.pd_useradd_answer ? 'left-6' : 'left-1'
                        }`} />
                      </button>
                    </div>

                    {/* Sudo Password Type */}
                    {config.pd_useradd_answer && (
                      <div className="p-2.5 bg-gray-50 rounded-xl space-y-2" id="row-pd-pass-type">
                        <label className="text-xs font-semibold text-gray-800 block">User Password Configuration</label>
                        <div className="grid grid-cols-2 gap-2" id="pass-type-selector">
                          {[
                            { id: '1', label: 'Passwordless' },
                            { id: '2', label: 'Use Password Setup' }
                          ].map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setConfig(prev => ({ ...prev, pd_pass_type: p.id as '1' | '2' }))}
                              className={`py-1.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                                config.pd_pass_type === p.id
                                  ? 'border-[#00796b] bg-[#00796b]/5 text-[#00796b]'
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                              id={`pass-opt-${p.id}`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded-xl">
                    Container is currently disabled. Native Termux packages will be used exclusively.
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Code Generator / One Liner */}
            <div className="w-full lg:w-[420px] shrink-0 space-y-6" id="generated-output-pane">
              {/* Generated configuration.conf */}
              <div className="bg-[#1e293b] text-[#f8fafc] rounded-3xl p-5 shadow-lg flex flex-col h-auto" id="conf-output-card">
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#00b0ff]" />
                    <span className="text-xs font-bold font-mono text-slate-200">configuration.conf</span>
                  </div>
                  <button
                    onClick={handleCopyConf}
                    className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    id="copy-conf-btn"
                  >
                    {copiedConf ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-3 bg-slate-900 p-3 rounded-xl border border-slate-800 flex-1">
                  <pre className="text-xs font-mono text-[#38bdf8] whitespace-pre-wrap select-all leading-normal">
                    {configurationConfContent}
                  </pre>
                </div>

                <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
                  * Placing this file at <code className="text-slate-200 font-mono">/data/data/com.termux/files/usr/etc/termux-desktop/configuration.conf</code> skips all installer questions.
                </p>
              </div>

              {/* Complete Setup command */}
              <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-3" id="installation-command-card">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-[#00796b]" /> One-Liner Installation
                  </span>
                  <button
                    onClick={handleCopyCommand}
                    className="flex items-center gap-1 text-xs font-semibold text-[#00796b] hover:underline"
                    id="copy-cmd-btn"
                  >
                    {copiedCommand ? 'Copied Command!' : 'Copy Code'}
                  </button>
                </div>

                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Run this custom generated block inside your Termux terminal to save your selections and trigger the setup automatically:
                </p>

                <div className="p-3 bg-gray-900 rounded-xl text-xs font-mono text-gray-200 overflow-x-auto border border-gray-800">
                  <code className="whitespace-pre select-all">{installCommand}</code>
                </div>
              </div>

              {/* Quick instructions block */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-xs text-emerald-900 space-y-2" id="tutorial-card">
                <h4 className="font-bold flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-emerald-800" /> How to install in Termux:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-emerald-950 font-medium leading-relaxed">
                  <li>Install Termux from <strong>F-Droid</strong> or <strong>GitHub releases</strong>.</li>
                  <li>Copy the one-liner command shown above.</li>
                  <li>Paste and run it inside Termux.</li>
                  <li>Follow the short final prompts and boot the desktop!</li>
                </ol>
              </div>
            </div>
          </>
        )}

        {activeTab === 'reference' && (
          <div className="flex-1 bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-6" id="reference-pane">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#00796b]" /> Command Reference
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                A complete cheat-sheet of operations to control and change your Termux Desktop environment.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100" id="reference-tables-container">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-700 font-bold">
                    <th className="p-3">Command</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { cmd: 'tx11start', desc: 'Starts a Termux:X11 hardware-accelerated graphic session.' },
                    { cmd: 'tx11stop', desc: 'Gracefully stops running Termux:X11 graphic sessions.' },
                    { cmd: 'vncstart', desc: 'Starts VNC server to control the desktop over networking.' },
                    { cmd: 'vncstop', desc: 'Stops running VNC server instances.' },
                    { cmd: 'gui --start', desc: 'Starts the primary GUI desktop environment (auto-detects method).' },
                    { cmd: 'gui --stop', desc: 'Stops running GUI desktop sessions.' },
                    { cmd: 'setup-termux-desktop --change de', desc: 'Switch or change the installed desktop environment.' },
                    { cmd: 'setup-termux-desktop --change style', desc: 'Change custom themes and visuals of your GUI.' },
                    { cmd: 'setup-termux-desktop --change hw', desc: 'Modify hardware acceleration driver preferences.' },
                    { cmd: 'setup-termux-desktop --remove', desc: 'Safely and fully uninstalls the Termux Desktop setup.' }
                  ].map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="p-3 font-mono font-bold text-[#00796b] bg-gray-50/20">{item.cmd}</td>
                      <td className="p-3 text-gray-600 font-medium">{item.desc}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleCopyGeneral(item.cmd, `ref-${idx}`)}
                          className="text-[#00796b] hover:underline font-semibold"
                        >
                          {copiedGeneral === `ref-${idx}` ? 'Copied' : 'Copy'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Troubleshooting info */}
            <div className="p-4 bg-gray-50 rounded-2xl space-y-2" id="troubleshoot-panel">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-gray-500" /> Troubleshooting Tips
              </h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-600 font-medium leading-relaxed">
                <li><strong>Black Screen / No Display:</strong> Ensure you have the latest Termux:X11 app installed on your Android device and that it is running in the background.</li>
                <li><strong>No Audio output:</strong> Ensure the <code className="bg-gray-100 px-1 rounded">pulseaudio</code> service is running in Termux by running <code className="bg-gray-100 px-1 rounded">pulseaudio --start</code>.</li>
                <li><strong>Vulkan Errors:</strong> Turnip GPU drivers are device-specific. If your device displays artifacts, run <code className="bg-gray-100 px-1 rounded">setup-termux-desktop --change hw</code> and switch to CPU drawing.</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'requirements' && (
          <div className="flex-1 bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-6" id="requirements-pane">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#00796b]" /> System & Software Requirements
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Verify that your Android phone/tablet has the correct configurations for a stable experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="requirements-grid">
              <div className="p-4 rounded-2xl border border-gray-100 space-y-2">
                <h3 className="text-sm font-bold text-gray-900">Recommended Hardware Specs</h3>
                <ul className="space-y-2 text-xs text-gray-600 font-medium leading-relaxed">
                  <li className="flex justify-between border-b border-gray-50 pb-1.5">
                    <span>Android Version</span>
                    <strong className="text-gray-950">Android 8.0 or newer</strong>
                  </li>
                  <li className="flex justify-between border-b border-gray-50 pb-1.5">
                    <span>RAM Space</span>
                    <strong className="text-gray-950">3 GB minimum (4 GB+ recommended)</strong>
                  </li>
                  <li className="flex justify-between border-b border-gray-50 pb-1.5">
                    <span>Free Storage</span>
                    <strong className="text-gray-950">3 GB - 4 GB available storage</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Internet Bandwidth</span>
                    <strong className="text-gray-950">1.5 GB - 2 GB for full installer</strong>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl border border-gray-100 space-y-2">
                <h3 className="text-sm font-bold text-gray-900">Required Android Utilities</h3>
                <ul className="space-y-2 text-xs text-gray-600 font-medium leading-relaxed">
                  <li className="flex justify-between border-b border-gray-50 pb-1.5">
                    <span>Termux Terminal (F-Droid/Github)</span>
                    <a href="https://github.com/termux/termux-app/releases" target="_blank" rel="noopener noreferrer" className="text-[#00796b] hover:underline font-bold flex items-center gap-0.5">
                      Download Releases <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li className="flex justify-between border-b border-gray-50 pb-1.5">
                    <span>Termux:X11 Companion</span>
                    <a href="https://github.com/termux/termux-x11/releases" target="_blank" rel="noopener noreferrer" className="text-[#00796b] hover:underline font-bold flex items-center gap-0.5">
                      Download Releases <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li className="flex justify-between">
                    <span>Termux-API Extension</span>
                    <a href="https://github.com/termux/termux-api/releases" target="_blank" rel="noopener noreferrer" className="text-[#00796b] hover:underline font-bold flex items-center gap-0.5">
                      Download Releases <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Warning about Android 12 Phantom Process Killer */}
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-900 space-y-1.5" id="phantom-killer-alert">
              <h4 className="font-bold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-700" /> Android 12+ Users: Phantom Process Killer
              </h4>
              <p className="font-medium leading-relaxed text-gray-700">
                Android 12 and above enforces a strict limit on background child processes (known as Phantom Process Killer). 
                If Termux crashes randomly during installation or usage, you must disable the Phantom Process Killer using ADB.
              </p>
              <div className="p-2.5 bg-[#1e293b] text-slate-200 rounded-lg font-mono text-[11px] mt-1 overflow-x-auto select-all">
                adb shell "/system/bin/device_config put activity_manager max_phantom_processes 2147483647"
              </div>
            </div>
          </div>
        )}

        {activeTab === 'git' && (
          <div className="flex-1 bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-6 animate-fade-in" id="git-sync-pane">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FolderSync className="w-5 h-5 text-[#00796b]" /> Git Push & Synchronization
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Synchronize your customizer settings, setup scripts, and distro modifications with GitHub
                </p>
              </div>
              <button
                onClick={fetchGitStatus}
                disabled={gitLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${gitLoading ? 'animate-spin' : ''}`} />
                Refresh Status
              </button>
            </div>

            {/* Error & Success Messages */}
            {gitError && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-2xl text-xs font-medium space-y-1">
                <p className="font-bold">Error Encountered:</p>
                <p>{gitError}</p>
              </div>
            )}
            {gitSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-xs font-medium">
                {gitSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Repository Status & Commit Controls */}
              <div className="space-y-6">
                {/* Repository Status */}
                <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-bold">Current Branch:</span>
                    <span className="text-xs font-mono font-bold bg-[#00796b]/10 text-[#00796b] px-2 py-0.5 rounded-md">
                      {gitStatus?.branch || 'main'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs text-gray-500 font-bold block">Local Changes:</span>
                    
                    {gitLoading && !gitStatus ? (
                      <div className="text-xs text-gray-400 italic py-2">Loading repository status...</div>
                    ) : (!gitStatus?.modified.length && !gitStatus?.untracked.length) ? (
                      <div className="text-xs text-gray-500 italic py-2 flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600 font-bold" /> Everything is clean & up to date with main
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {gitStatus?.modified.map(file => (
                          <div key={file} className="flex justify-between items-center text-xs p-1.5 bg-yellow-50 border border-yellow-100/50 rounded-lg">
                            <span className="font-mono text-gray-700 truncate max-w-[70%]">{file}</span>
                            <span className="text-[10px] font-bold text-yellow-700 bg-yellow-100/60 px-1.5 py-0.5 rounded">Modified</span>
                          </div>
                        ))}
                        {gitStatus?.untracked.map(file => (
                          <div key={file} className="flex justify-between items-center text-xs p-1.5 bg-emerald-50 border border-emerald-100/50 rounded-lg">
                            <span className="font-mono text-gray-700 truncate max-w-[70%]">{file}</span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">Untracked</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Commit & Push Form */}
                <div className="space-y-3">
                  <label className="text-xs text-gray-700 font-bold block">Commit Message</label>
                  <input
                    type="text"
                    value={gitCommitMessage}
                    onChange={(e) => setGitCommitMessage(e.target.value)}
                    placeholder="e.g. update setup configurations"
                    className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-[#00796b] focus:bg-white rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 outline-hidden transition-all"
                  />
                  <button
                    onClick={handleGitPush}
                    disabled={gitLoading || (!gitStatus?.modified.length && !gitStatus?.untracked.length)}
                    className="w-full bg-[#00796b] hover:bg-[#004d40] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {gitLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Synchronizing...
                      </>
                    ) : (
                      'Commit & Push Changes'
                    )}
                  </button>
                  <p className="text-[10px] text-gray-400 italic text-center">
                    This stages all modified files, commits them, and pushes directly to GitHub main branch.
                  </p>
                </div>
              </div>

              {/* Right Column: Terminal Logs & Auto-Repair */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-2 flex-1 flex flex-col">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-gray-700 font-bold block">Git Console Output</label>
                    <button 
                      onClick={() => setGitLog('')}
                      className="text-[10px] text-gray-400 hover:text-gray-600 font-semibold"
                    >
                      Clear Logs
                    </button>
                  </div>
                  <pre className="flex-1 min-h-[180px] max-h-[240px] lg:max-h-none bg-[#1e293b] text-[#38bdf8] p-3.5 rounded-2xl font-mono text-[11px] overflow-auto whitespace-pre-wrap select-all">
                    {gitLog || '$ Ready. Action logs will be displayed here.'}
                  </pre>
                </div>

                {/* Git Auto-Repair utility */}
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-700" /> Git Repository Health Check
                  </h4>
                  <p className="text-[11px] text-gray-700 leading-relaxed font-medium">
                    If you encounter corrupt index or loose object format errors (e.g. <code>fatal: unknown index entry format</code>), click repair to automatically pull a fresh tracking directory.
                  </p>
                  <button
                    onClick={handleGitFix}
                    disabled={gitLoading}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    Repair & Heal Git Repository
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer bar */}
      <footer className="bg-white border-t border-gray-200 py-4 px-4 text-center text-xs text-gray-500 font-medium shrink-0 flex flex-col sm:flex-row justify-between items-center max-w-7xl w-full mx-auto" id="app-footer">
        <p>© 2026 Termux Desktop Customizer. Licensed under GPL v3.</p>
        <div className="flex gap-4 mt-2 sm:mt-0" id="footer-links">
          <a href="https://github.com/bangsawan02/termux-desktop" target="_blank" rel="noreferrer noopener" className="hover:text-[#00796b] transition-colors flex items-center gap-0.5">
            Original Repository <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>
  );
}
