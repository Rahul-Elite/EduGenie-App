import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import { API_BASE_URL } from '../config';

function Compiler() {
  const [runtimes, setRuntimes] = useState([]);
  const [language, setLanguage] = useState('');
  const [version, setVersion] = useState('');
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const lineNumbersRef = useRef(null);
  const textareaRef = useRef(null);

  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const lineCount = code.split('\n').length;
  const lines = Array.from({ length: Math.max(1, lineCount) }, (_, i) => i + 1);

  
  useEffect(() => {
    const fetchRuntimes = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/compiler/runtimes`);
        const data = await res.json();
        
        
        const commonLanguages = ['python', 'javascript', 'java', 'c++', 'c', 'go', 'rust', 'ruby', 'php', 'typescript'];
        
        const filteredRuntimes = data
          .filter(r => commonLanguages.includes(r.language) || r.language === 'cpp')
          .sort((a, b) => a.language.localeCompare(b.language));

        setRuntimes(filteredRuntimes);
        
        
        const defaultLang = filteredRuntimes.find(r => r.language === 'python');
        if (defaultLang) {
          setLanguage(defaultLang.language);
          setVersion(defaultLang.version);
          setCode('print("Hello World!")');
        } else if (filteredRuntimes.length > 0) {
          setLanguage(filteredRuntimes[0].language);
          setVersion(filteredRuntimes[0].version);
        }
      } catch (err) {
        console.error("Failed to fetch runtimes:", err);
        setError('Failed to load programming languages. Please refresh the page.');
      }
    };
    
    fetchRuntimes();
  }, []);

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    const runtime = runtimes.find(r => r.language === selectedLang);
    if (runtime) {
      setLanguage(runtime.language);
      setVersion(runtime.version);
      
    
      if (selectedLang === 'python') setCode('print("Hello World!")');
      else if (selectedLang === 'javascript') setCode('console.log("Hello World!");');
      else if (selectedLang === 'java') setCode('public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello World!");\n  }\n}');
      else if (selectedLang === 'c++' || selectedLang === 'cpp') setCode('#include <iostream>\n\nint main() {\n  std::cout << "Hello World!";\n  return 0;\n}');
      else if (selectedLang === 'c') setCode('#include <stdio.h>\n\nint main() {\n  printf("Hello World!");\n  return 0;\n}');
      else setCode('');
    }
  };

  const handleRun = async () => {
    if (!code.trim()) {
      setError('Please write some code before running.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setOutput(null);

    try {
      const payload = {
        language: language,
        version: version,
        code: code,
        customInput: showCustomInput ? customInput : ""
      };

      const res = await fetch(`${API_BASE_URL}/api/compiler/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (data.message) {
        throw new Error(data.message);
      }

      setOutput(data.run || data.compile); 
    } catch (err) {
      setError('Execution failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white flex flex-col font-sans selection:bg-blue-500/30">
      <Header />

      <main className="flex-grow max-w-6xl mx-auto p-4 sm:p-6 w-full flex flex-col">
        <div className="text-center mb-8 mt-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 drop-shadow-sm">
            Online Compiler
          </h1>
          <p className="text-gray-400 text-lg">Write, compile, and execute your code in seconds.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-4 mb-6 rounded-xl text-red-200 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">✕</button>
          </div>
        )}

        <div className="flex-grow flex flex-col lg:flex-row gap-6 mb-8 min-h-[600px]">
          
          
          <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            
           
            <div className="flex items-center justify-between p-4 bg-slate-900/80 border-b border-white/10">
              <div className="flex items-center gap-4">
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-slate-800 border border-slate-700 text-sm rounded-xl px-4 py-2 outline-none hover:border-slate-500 focus:border-blue-500 transition-colors cursor-pointer capitalize font-medium"
                >
                  {runtimes.length === 0 && <option value="">Loading...</option>}
                  {runtimes.map(r => (
                    <option key={r.language + r.version} value={r.language}>
                      {r.language} ({r.version})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors border ${showCustomInput ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-slate-800 text-gray-300 border-slate-700 hover:bg-slate-700'}`}
                >
                  {showCustomInput ? 'Hide Custom Input' : 'Add Custom Input'}
                </button>
                
                <button
                  onClick={handleRun}
                  disabled={isLoading || runtimes.length === 0}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <span>▶</span> Run Code
                    </>
                  )}
                </button>
              </div>
            </div>

            
            <div className="flex-1 flex bg-[#1e1e1e] overflow-hidden">
              <div 
                ref={lineNumbersRef}
                className="py-4 px-3 bg-[#1e1e1e] border-r border-white/5 text-right font-mono text-[15px] text-gray-500 select-none overflow-hidden leading-relaxed"
                style={{ minWidth: '3.5rem' }}
              >
                {lines.map(line => (
                  <div key={line}>{line}</div>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onScroll={handleScroll}
                wrap="off"
                className="flex-1 p-4 bg-transparent text-gray-300 font-mono text-[15px] outline-none resize-none leading-relaxed whitespace-pre overflow-auto"
                spellCheck="false"
                placeholder="Write your code here..."
              ></textarea>
            </div>

            
            {showCustomInput && (
              <div className="h-40 bg-slate-900 border-t border-white/10 flex flex-col animate-in slide-in-from-bottom-2">
                <div className="bg-slate-800/80 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/5 flex justify-between items-center">
                  <span>Standard Input (stdin)</span>
                  <button onClick={() => setShowCustomInput(false)} className="hover:text-white">✕</button>
                </div>
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="w-full flex-1 p-4 bg-transparent text-gray-300 font-mono text-sm outline-none resize-none"
                  spellCheck="false"
                  placeholder="Enter inputs here..."
                ></textarea>
              </div>
            )}
          </div>

         
          <div className="w-full lg:w-1/3 flex flex-col bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-4 py-3 bg-slate-800/80 border-b border-white/10 flex items-center gap-2 text-sm font-bold text-gray-300 uppercase tracking-wider">
              <span>🖥️</span> Output Terminal
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto font-mono text-[14px]">
              {!output && !isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-3">
                  <span className="text-4xl">⚡</span>
                  <p>Run your code to see output here</p>
                </div>
              )}
              
              {isLoading && (
                <div className="text-blue-400 animate-pulse">Executing code...</div>
              )}
              
              {output && (
                <div className="whitespace-pre-wrap break-all">
                  {output.stderr && (
                    <div className="text-red-400 mb-4 font-bold">
                      {output.stderr}
                    </div>
                  )}
                  {output.stdout && (
                    <div className="text-emerald-300">
                      {output.stdout}
                    </div>
                  )}
                  {!output.stderr && !output.stdout && output.code === 0 && (
                    <div className="text-gray-500 italic">Program executed successfully with no output.</div>
                  )}
                  
                  <div className="mt-6 pt-4 border-t border-slate-700/50 text-xs text-gray-500 flex justify-between">
                    <span>Exit Code: {output.code !== undefined ? output.code : 'N/A'}</span>
                    <span>{output.signal ? `Signal: ${output.signal}` : ''}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Compiler;
