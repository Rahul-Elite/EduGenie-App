import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import Header from './Header';
import Footer from './Footer';
import { API_BASE_URL } from '../config';

function Study() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('English');

  const [activeTab, setActiveTab] = useState('summary');

  const [quizData, setQuizData] = useState(null);
  const [flashcardsData, setFlashcardsData] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

  const [flippedCardIndex, setFlippedCardIndex] = useState(null);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const [historyId, setHistoryId] = useState(null);

  
  useEffect(() => {
    window.speechSynthesis.getVoices();

    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };

    
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    const ext = f.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext)) {
      setError('Invalid file type');
      return;
    }

    setFile(f);
    setError('');
  };

  const clearFile = () => {
    stopSpeaking();
    setFile(null);
    setSummary('');
    setQuizData(null);
    setFlashcardsData(null);
    setHistoryId(null);
    setActiveTab('summary');
  };

  const speakSummary = () => {
    if (!summary) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const voices = window.speechSynthesis.getVoices();

    if (!voices.length) {
      alert("Voices not loaded. Try again.");
      return;
    }

    let selectedVoice;

    if (language === "Hindi") {
      selectedVoice = voices.find(v => v.lang === "hi-IN");
    } else if (language === "English") {
      selectedVoice =
        voices.find(v => v.name.includes("Ravi")) || // 🇮🇳 best
        voices.find(v => v.name.includes("Heera")) ||
        voices.find(v => v.lang === "en-IN");
    } else if (language === "Spanish") {
      selectedVoice = voices.find(v => v.lang.startsWith("es"));
    }

    if (!selectedVoice) {
      selectedVoice = voices[0];
    }

    console.log("Using Voice:", selectedVoice.name, selectedVoice.lang);

    window.speechSynthesis.cancel();

    const chunkSize = 180;
    const chunks = summary.match(new RegExp(`.{1,${chunkSize}}`, "g"));

    let index = 0;
    setIsSpeaking(true);

    const speakNext = () => {
      if (index >= chunks.length) {
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[index]);

      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
      utterance.rate = 0.95;
      utterance.pitch = 1;

      utterance.onend = () => {
        index++;
        speakNext(); 
      };

      utterance.onerror = (e) => {
        console.error("Speech error:", e);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      alert('Copied to clipboard!');
    } catch {
      alert('Failed to copy');
    }
  };

  const generateSummary = async () => {
    if (!file) return;

    setIsGenerating(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', language);

      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSummary(data.summary);
      setActiveTab('summary');

      // 🔄 Auto-Save
      autoSaveData({ summary: data.summary }, file);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateQuiz = async () => {
    if (!file) return;

    setIsGeneratingQuiz(true);
    setActiveTab('quiz');
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', language);

      const res = await fetch(`${API_BASE_URL}/api/quiz`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setQuizData(data.quiz);

      autoSaveData({ quiz: data.quiz });

    } catch (err) {
      setError(err.message);
      setActiveTab('summary');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const generateFlashcards = async () => {
    if (!file) return;

    setIsGeneratingFlashcards(true);
    setActiveTab('flashcards');
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', language);

      const res = await fetch(`${API_BASE_URL}/api/flashcards`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setFlashcardsData(data.flashcards);

      autoSaveData({ flashcards: data.flashcards });

    } catch (err) {
      setError(err.message);
      setActiveTab('summary');
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const autoSaveData = async (newData, fileToUpload = null) => {
    try {
      const formData = new FormData();

      if (historyId) {
        formData.append('historyId', historyId);
      } else if (fileToUpload) {
        formData.append('file', fileToUpload);
      }

      if (newData.summary) formData.append('summary', newData.summary);
      if (newData.quiz) formData.append('quiz', JSON.stringify(newData.quiz));
      if (newData.flashcards) formData.append('flashcards', JSON.stringify(newData.flashcards));

      const res = await fetch(`${API_BASE_URL}/api/save-history`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          dispatch(logout());
          navigate('/login');
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error(data.message || data.error || 'Failed to save history');
      }

      if (!historyId && data.history && data.history._id) {
        setHistoryId(data.history._id);
      }

    } catch (err) {
      console.error("Auto-save failed:", err.message);
      setError("Failed to auto-save history: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white flex flex-col font-sans selection:bg-blue-500/30">
      <Header />

      <main className="flex-grow max-w-6xl mx-auto p-4 sm:p-6 w-full relative">

        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <a href="/history" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg hover:shadow-white/5">
            🕒 View Past History
          </a>
        </div>
        <div className="text-center mb-10 mt-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 drop-shadow-sm">
            AI Study Assistant
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Transform your notes into smart study materials. Upload your document to instantly generate a comprehensive summary, interactive quizzes, and flashcards.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 flex items-center gap-3 p-4 mb-8 rounded-xl text-red-200 animate-in fade-in slide-in-from-top-2">
            <span className="text-xl">⚠️</span>
            <p className="flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">✕</button>
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl mb-10 transition-all duration-300">
          {!file ? (
            <div className="relative border-2 border-dashed border-white/20 hover:border-blue-500/50 rounded-2xl p-10 text-center transition-colors group">
              <input
                type="file"
                onChange={handleFile}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                accept=".pdf,.docx,.txt"
              />
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  📄
                </div>
                <div>
                  <p className="text-xl font-medium text-gray-200">Click to upload or drag and drop</p>
                  <p className="text-gray-500 mt-2 text-sm">Supports PDF, DOCX, and TXT</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between bg-white/5 rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center text-2xl">
                  ✓
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-200 break-all">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Ready for magic</p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-sm rounded-xl px-4 py-2.5 outline-none hover:border-slate-600 focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="English">English (Indian)</option>
                  <option value="Hindi">Hindi (Indian)</option>
                  <option value="Spanish">Spanish</option>
                </select>

                <button
                  onClick={generateSummary}
                  disabled={isGenerating}
                  className="flex-1 sm:flex-none relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  <span className={`flex items-center justify-center gap-2 ${isGenerating ? 'opacity-0' : 'opacity-100'}`}>
                    ✨ Generate Summary
                  </span>
                  {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </button>
                <button
                  onClick={clearFile}
                  className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                  title="Remove file"
                >
                  🗑️
                </button>
              </div>
            </div>
          )}
        </div>

        {summary && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 p-1.5 rounded-2xl flex gap-2">
                {['summary', 'flashcards'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      if (activeTab === 'summary' && tab !== 'summary') stopSpeaking();

                      if (tab === 'flashcards' && !flashcardsData) generateFlashcards();
                      else setActiveTab(tab);
                    }}
                    className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 capitalize flex items-center gap-2
                      ${activeTab === tab
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
                  >
                    {tab === 'summary' && '📝'}
                    {tab === 'flashcards' && '🎴'}
                    {tab}

                    {tab === 'flashcards' && isGeneratingFlashcards && <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden min-h-[400px]">

              {activeTab === 'summary' && (
                <div className="animate-in fade-in duration-500 relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <span className="bg-blue-500/20 text-blue-400 p-2 rounded-lg text-lg">📝</span>
                      Document Summary
                    </h2>

                    <div className="flex gap-3">
                      <button
                        onClick={speakSummary}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isSpeaking ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-700 hover:bg-slate-600 text-gray-200'}`}
                      >
                        {isSpeaking ? (
                          <><span>⏹</span> Stop Listening</>
                        ) : (
                          <><span>🔊</span> Listen</>
                        )}
                      </button>

                      <button
                        onClick={copySummary}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-200 rounded-xl transition-colors"
                        title="Copy to clipboard"
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed text-lg whitespace-pre-wrap font-serif">
                    {summary.split('\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'quiz' && (
                <div className="animate-in fade-in duration-500 relative z-10 flex flex-col gap-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3 mb-4">
                    <span className="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg text-lg">❓</span>
                    Knowledge Quiz
                  </h2>

                  {isGeneratingQuiz ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                      <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
                      <p>Generating smart questions...</p>
                    </div>
                  ) : (
                    quizData?.map((q, i) => (
                      <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-colors">
                        <p className="text-xl font-semibold mb-5 text-gray-100 flex gap-3">
                          <span className="text-emerald-400">Q{i + 1}.</span> {q.question}
                        </p>
                        <div className="grid sm:grid-cols-2 gap-3 mb-6">
                          {q.options.map((opt, j) => (
                            <div key={j} className="bg-slate-900/50 border border-slate-700/30 p-4 rounded-xl text-gray-300">
                              {opt}
                            </div>
                          ))}
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-300 flex items-center gap-3">
                          <span className="text-xl">✅</span>
                          <div>
                            <p className="text-xs uppercase tracking-wider font-bold opacity-70 mb-1">Correct Answer</p>
                            <p className="font-medium">{q.answer}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'flashcards' && (
                <div className="animate-in fade-in duration-500 relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <span className="bg-amber-500/20 text-amber-400 p-2 rounded-lg text-lg">🎴</span>
                      Study Flashcards
                    </h2>
                    <span className="text-sm text-gray-500 bg-slate-800 px-3 py-1 rounded-full">Click to flip</span>
                  </div>

                  {isGeneratingFlashcards ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                      <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
                      <p>Crafting flashcards...</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                      {flashcardsData?.map((card, i) => (
                        <div
                          key={i}
                          onClick={() => setFlippedCardIndex(flippedCardIndex === i ? null : i)}
                          className="relative h-64 w-full perspective-1000 cursor-pointer group"
                          style={{ perspective: "1000px" }}
                        >
                          <div
                            className={`w-full h-full transition-transform duration-700 preserve-3d relative rounded-2xl shadow-xl ${flippedCardIndex === i ? '[transform:rotateY(180deg)]' : ''
                              }`}
                            style={{ transformStyle: "preserve-3d" }}
                          >
                            <div
                              className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col justify-center items-center text-center backface-hidden group-hover:border-amber-500/50 transition-colors"
                              style={{ backfaceVisibility: "hidden" }}
                            >
                              <div className="absolute top-4 right-4 text-xs font-bold text-slate-500 bg-slate-900/50 px-2 py-1 rounded-md">Q</div>
                              <p className="text-lg font-medium text-gray-200">{card.front}</p>
                            </div>

                            <div
                              className="absolute inset-0 w-full h-full bg-gradient-to-br from-amber-600 to-orange-700 text-white rounded-2xl p-6 flex flex-col justify-center items-center text-center backface-hidden"
                              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                            >
                              <div className="absolute top-4 right-4 text-xs font-bold text-amber-200 bg-black/20 px-2 py-1 rounded-md">A</div>
                              <p className="text-lg font-medium drop-shadow-sm">{card.back}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default Study;