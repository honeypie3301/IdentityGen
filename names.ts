import { useState, useEffect } from 'react';
import { generateIdentity, Identity, GeneratorOptions } from './utils/generator';
import { Copy, Check, Settings2 } from 'lucide-react';

export default function App() {
  const [options, setOptions] = useState<GeneratorOptions>({
    gender: 'random',
    useNumbers: true,
    multipleFormats: true,
  });

  const [history, setHistory] = useState<Identity[]>([]);
  const [selectedIdentity, setSelectedIdentity] = useState<Identity | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Initialize and Theme syncing
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Initial generation
  useEffect(() => {
    if (history.length === 0) {
      handleGenerate();
    }
  }, []);

  const handleGenerate = () => {
    const newIdentity = generateIdentity(options);
    setHistory((prev) => [newIdentity, ...prev].slice(0, 20)); // Keep last 20
    setSelectedIdentity(newIdentity);
    setCopiedField(null);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const copyAll = (idToCopy: Identity) => {
    const text = `First Name: ${idToCopy.firstName}\nLast Name: ${idToCopy.lastName}\nEmail: ${idToCopy.email}\nGender: ${idToCopy.gender}`;
    copyToClipboard(text, 'all');
  };

  const FieldDisplay = ({ label, value, fieldId }: { label: string; value: string; fieldId: string }) => {
    const isCopied = copiedField === fieldId;
    return (
      <div className="group flex items-center justify-between p-3.5 rounded-lg border border-[#222] bg-[#0a0a0a] hover:bg-[#111] hover:border-[#333] transition-all duration-200">
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-wider text-[#666] font-semibold mb-1">{label}</span>
          <span className="text-sm font-medium text-[#eee]">{value}</span>
        </div>
        <button
          onClick={() => copyToClipboard(value, fieldId)}
          className="p-2.5 rounded-md bg-[#111] border border-transparent group-hover:border-[#333] hover:!bg-[#222] text-[#666] hover:text-white transition-all shadow-sm"
          title={`Copy ${label}`}
        >
          {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 md:p-6 font-sans antialiased text-[#c9d1d9] selection:bg-[#c088ff]/30">
      <div className="max-w-4xl w-full border border-[#222] bg-[#0a0a0a] rounded-xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* Compact Horizontal Hero Section */}
        <div className="p-5 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
          {/* Decorative shapes/glows */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="z-10">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 text-transparent bg-clip-text bg-gradient-to-r from-[#ff4b4b] via-[#ff7676] to-[#ffffff]">
              Identity Generator
            </h1>
            <p className="text-[#888] text-sm max-w-sm leading-relaxed">
              Create offline test identities instantly with random names and generated emails.
            </p>
          </div>
          
          <button 
            onClick={handleGenerate}
            className="z-10 bg-[#c088ff] hover:bg-[#a865ff] text-black px-6 py-2.5 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(192,136,255,0.15)] hover:shadow-[0_0_20px_rgba(192,136,255,0.3)] whitespace-nowrap shrink-0"
          >
            <span className="font-bold text-lg leading-none mt-[-2px]">{">_"}</span> Generate Identity
          </button>
        </div>

        {/* Custom Settings Strip */}
        <div className="border-t border-b border-[#222] bg-[#050505] py-3.5 px-6 md:px-8 flex flex-wrap gap-x-8 gap-y-4 items-center justify-start z-10 relative">
          <div className="flex items-center gap-2 text-[#666] shrink-0">
            <Settings2 className="w-4 h-4" />
            <span className="text-sm font-medium">Settings</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 md:gap-8">
            
            {/* Styled Segmented Control for Gender */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-[#666] uppercase tracking-wider font-semibold">Gender</span>
              <div className="flex bg-[#111] rounded-md p-0.5 border border-[#222]">
                {['random', 'female', 'male'].map(g => (
                  <button
                    key={g}
                    onClick={() => setOptions({...options, gender: g as any})}
                    className={`px-3 py-1.5 text-xs rounded-[4px] capitalize transition-all ${
                      options.gender === g 
                        ? 'bg-[#222] text-white shadow-sm border border-[#333]' 
                        : 'text-[#888] hover:text-[#bbb] border border-transparent'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Checkboxes */}
            <div className="flex items-center gap-5">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={options.useNumbers}
                  onChange={(e) => setOptions({...options, useNumbers: e.target.checked})}
                />
                <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all ${
                  options.useNumbers 
                    ? 'bg-[#c088ff] border-[#c088ff] text-black shadow-[0_0_8px_rgba(192,136,255,0.4)]' 
                    : 'border-[#333] bg-[#111] group-hover:border-[#555]'
                }`}>
                  {options.useNumbers && <Check className="w-3 h-3" strokeWidth={3} />}
                </div>
                <span className="text-sm text-[#888] group-hover:text-[#ccc] transition-colors font-medium">Numbers</span>
              </label>
              
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={options.multipleFormats}
                  onChange={(e) => setOptions({...options, multipleFormats: e.target.checked})}
                />
                <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all ${
                  options.multipleFormats 
                    ? 'bg-[#c088ff] border-[#c088ff] text-black shadow-[0_0_8px_rgba(192,136,255,0.4)]' 
                    : 'border-[#333] bg-[#111] group-hover:border-[#555]'
                }`}>
                  {options.multipleFormats && <Check className="w-3 h-3" strokeWidth={3} />}
                </div>
                <span className="text-sm text-[#888] group-hover:text-[#ccc] transition-colors font-medium">Multiple Formats</span>
              </label>
            </div>

          </div>
        </div>
        
        {/* Main Two Column Area */}
        <div className="flex flex-col-reverse md:flex-row min-h-[350px] relative z-10">
          
          {/* Left Column - History */}
          <div className="w-full md:w-[32%] lg:w-[28%] border-b md:border-b-0 md:border-r border-[#222] flex flex-col bg-[#050505] relative z-20">
            <div className="p-3 border-b border-[#111]">
              <span className="text-[11px] text-[#666] uppercase tracking-wider font-semibold px-1">Recent</span>
            </div>
            <div className="overflow-y-auto p-2 flex flex-col gap-1 custom-scrollbar max-h-[300px] md:max-h-none md:absolute md:inset-0 md:top-[41px]">
              {history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedIdentity(item)}
                  className={`p-3 rounded-md cursor-pointer border transition-all duration-200 ${
                    selectedIdentity?.id === item.id 
                      ? 'bg-[#161616] border-[#333]' 
                      : 'border-transparent hover:bg-[#111] hover:border-[#222]'
                  }`}
                >
                  <h3 className={`text-sm font-medium mb-0.5 ${selectedIdentity?.id === item.id ? 'text-[#eee]' : 'text-[#888]'}`}>
                    {item.firstName} {item.lastName}
                  </h3>
                  <p className="text-[#555] text-[11px] truncate">{item.email}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Column - Data Display */}
          <div className="w-full md:w-[68%] lg:w-[72%] bg-[#0a0a0a] p-6 md:p-8 flex flex-col">
            {selectedIdentity ? (
              <div className="flex flex-col h-full animate-in fade-in duration-300">
                
                <div className="flex justify-between items-start mb-8 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">
                      {selectedIdentity.firstName} {selectedIdentity.lastName}
                    </h2>
                    <p className="text-[#888] text-sm font-medium">{selectedIdentity.email}</p>
                  </div>
                  <button 
                    onClick={() => copyAll(selectedIdentity)} 
                    className="flex shrink-0 items-center gap-2 text-[13px] font-medium bg-[#111] hover:bg-[#222] border border-[#222] px-3.5 py-2 rounded-md text-[#aaa] hover:text-white transition-all shadow-sm"
                  >
                    {copiedField === 'all' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedField === 'all' ? 'Copied All' : 'Copy All'}
                  </button>
                </div>

                <div className="space-y-3">
                  <FieldDisplay label="First Name" value={selectedIdentity.firstName} fieldId="firstName" />
                  <FieldDisplay label="Last Name" value={selectedIdentity.lastName} fieldId="lastName" />
                  <FieldDisplay label="Email Address" value={selectedIdentity.email} fieldId="email" />
                  <FieldDisplay label="Gender" value={selectedIdentity.gender.charAt(0).toUpperCase() + selectedIdentity.gender.slice(1)} fieldId="gender" />
                </div>
                
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-[#444] text-sm">
                No identity generated yet.
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}