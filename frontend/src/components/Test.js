import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { API_BASE_URL } from '../config';

function Test() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [inputType, setInputType] = useState('file'); 
  const [language, setLanguage] = useState('English');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    const ext = f.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(ext)) {
      setError('Invalid file type. Supports PDF, DOCX, TXT.');
      return;
    }

    setFile(f);
    setError('');
  };

  const clearFile = () => {
    setFile(null);
    setText('');
    setQuizData(null);
    setUserAnswers({});
    setIsSubmitted(false);
    setError('');
  };

  const generateTest = async () => {
    if (inputType === 'file' && !file) return;
    if (inputType === 'text' && !text.trim()) return;

    setIsGenerating(true);
    setError('');
    setQuizData(null);
    setUserAnswers({});
    setIsSubmitted(false);

    try {
      const formData = new FormData();
      if (inputType === 'file') {
        formData.append('file', file);
      } else {
        formData.append('text', text);
      }
      formData.append('language', language);

      const res = await fetch(`${API_BASE_URL}/api/quiz`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setQuizData(data.quiz);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptionSelect = (qIndex, option) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [qIndex]: option
    }));
  };

  const submitTest = () => {
    if (!quizData) return;

    let currentScore = 0;
    quizData.forEach((q, i) => {
      if (userAnswers[i] === q.answer) {
        currentScore++;
      }
    });
    setScore(currentScore);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white flex flex-col font-sans selection:bg-blue-500/30">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto p-4 sm:p-6 w-full relative">
        <div className="text-center mb-10 mt-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 drop-shadow-sm">
            Knowledge Test
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Upload your study material and take a smart AI-generated test to check your understanding.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 flex items-center gap-3 p-4 mb-8 rounded-xl text-red-200">
            <span className="text-xl">⚠️</span>
            <p className="flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">✕</button>
          </div>
        )}

        {!quizData && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl mb-10 transition-all duration-300">

            <div className="flex justify-center mb-8">
              <div className="bg-slate-800 p-1 rounded-xl flex gap-1 border border-slate-700">
                <button
                  onClick={() => setInputType('file')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${inputType === 'file' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setInputType('text')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${inputType === 'text' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  Paste Text
                </button>
              </div>
            </div>

            {inputType === 'file' ? (
              !file ? (
                <div className="relative border-2 border-dashed border-white/20 hover:border-blue-500/50 rounded-2xl p-10 text-center transition-colors group cursor-pointer">
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
                      <p className="text-xl font-medium text-gray-200">Click to upload document for Test</p>
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
                      <p className="text-xs text-gray-500 mt-1">Ready to generate test</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-sm rounded-xl px-4 py-2.5 outline-none hover:border-slate-600 focus:border-blue-500 transition-colors cursor-pointer"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Spanish">Spanish</option>
                    </select>

                    <button
                      onClick={generateTest}
                      disabled={isGenerating}
                      className="flex-1 sm:flex-none relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                      <span className={`flex items-center justify-center gap-2 ${isGenerating ? 'opacity-0' : 'opacity-100'}`}>
                        ✨ Generate Test
                      </span>
                      {isGenerating && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                      )}
                    </button>
                    <button
                      onClick={clearFile}
                      disabled={isGenerating}
                      className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors disabled:opacity-50"
                      title="Remove file"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="flex flex-col gap-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-48 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-gray-200 outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed"
                  placeholder="Paste your study material text or related topics name here to generate a smart quiz..."
                />
                <div className="flex justify-end gap-3 items-center mt-2">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-sm rounded-xl px-4 py-2.5 outline-none hover:border-slate-600 focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Spanish">Spanish</option>
                  </select>

                  <button
                    onClick={generateTest}
                    disabled={isGenerating || !text.trim()}
                    className="flex-1 sm:flex-none relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                  >
                    <span className={`flex items-center justify-center gap-2 ${isGenerating ? 'opacity-0' : 'opacity-100'}`}>
                      ✨ Generate Test
                    </span>
                    {isGenerating && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                  </button>
                  <button
                    onClick={clearFile}
                    disabled={isGenerating || !text}
                    className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors disabled:opacity-50"
                    title="Clear text"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-2xl font-bold text-gray-200">Analyzing Document</h3>
            <p className="text-gray-400 mt-2">Crafting your 15-question knowledge test...</p>
          </div>
        )}

        {quizData && !isGenerating && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
              <div>
                <h2 className="text-2xl font-bold text-gray-100">Test Your Knowledge</h2>
                <p className="text-gray-400 mt-1">Based on: {file?.name}</p>
              </div>
              <div className="mt-4 sm:mt-0 flex gap-3">
                <button
                  onClick={clearFile}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-colors"
                >
                  Start Over
                </button>
              </div>
            </div>

            {isSubmitted && (
              <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 p-8 rounded-3xl text-center shadow-2xl">
                <h3 className="text-3xl font-bold text-white mb-2">Test Completed!</h3>
                <p className="text-gray-300 text-lg mb-6">Here is how you performed</p>
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-emerald-500 bg-emerald-500/10 mb-2">
                  <span className="text-4xl font-black text-emerald-400">{score}/{quizData.length}</span>
                </div>
                <p className="text-gray-400 font-medium mt-4">
                  {score === quizData.length ? 'Perfect Score! Incredible work.' :
                    score >= quizData.length * 0.7 ? 'Great job! You know the material well.' :
                      'Keep studying, you will get it next time!'}
                </p>
              </div>
            )}

            <div className="space-y-6">
              {quizData.map((q, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">
                  <h3 className="text-lg font-semibold text-gray-100 mb-6 flex gap-3">
                    <span className="text-blue-400">Q{i + 1}.</span> {q.question}
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {q.options.map((opt, j) => {
                      const isSelected = userAnswers[i] === opt;
                      const isCorrectAnswer = q.answer === opt;

                      let optionClasses = "relative p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ";

                      if (!isSubmitted) {
                        optionClasses += isSelected
                          ? "border-blue-500 bg-blue-500/10 text-white"
                          : "border-slate-700 bg-slate-800/50 text-gray-300 hover:border-slate-500 hover:bg-slate-800";
                      } else {
                        optionClasses += "cursor-default ";
                        if (isCorrectAnswer) {
                          optionClasses += "border-emerald-500 bg-emerald-500/20 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                        } else if (isSelected && !isCorrectAnswer) {
                          optionClasses += "border-red-500 bg-red-500/20 text-red-100";
                        } else {
                          optionClasses += "border-slate-700/50 bg-slate-800/20 text-gray-500 opacity-50";
                        }
                      }

                      return (
                        <div
                          key={j}
                          onClick={() => handleOptionSelect(i, opt)}
                          className={optionClasses}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                            ${!isSubmitted && isSelected ? 'border-blue-500' : ''}
                            ${!isSubmitted && !isSelected ? 'border-gray-500' : ''}
                            ${isSubmitted && isCorrectAnswer ? 'border-emerald-500 bg-emerald-500' : ''}
                            ${isSubmitted && isSelected && !isCorrectAnswer ? 'border-red-500 bg-red-500' : ''}
                            ${isSubmitted && !isSelected && !isCorrectAnswer ? 'border-gray-600' : ''}
                          `}>
                            {isSubmitted && isCorrectAnswer && <span className="text-[10px] text-white">✓</span>}
                            {isSubmitted && isSelected && !isCorrectAnswer && <span className="text-[10px] text-white">✕</span>}
                            {!isSubmitted && isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                          </div>
                          <span className="font-medium">{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {isSubmitted && (
                    <div className={`mt-6 p-4 rounded-xl border flex items-start gap-3
                      ${userAnswers[i] === q.answer ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-red-500/10 border-red-500/30 text-red-200'}
                    `}>
                      <span className="text-xl mt-0.5">
                        {userAnswers[i] === q.answer ? '✅' : '❌'}
                      </span>
                      <div>
                        <p className="font-bold mb-1">
                          {userAnswers[i] === q.answer ? 'Correct' : 'Incorrect'}
                        </p>
                        <p className="text-sm opacity-90">
                          {userAnswers[i] === q.answer
                            ? 'You got this right!'
                            : userAnswers[i] ? `You chose "${userAnswers[i]}". The correct answer is "${q.answer}".` : `You didn't answer this question. The correct answer is "${q.answer}".`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!isSubmitted && (
              <div className="flex justify-center mt-10 mb-10">
                <button
                  onClick={submitTest}
                  disabled={Object.keys(userAnswers).length === 0}
                  className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-lg font-bold rounded-2xl shadow-xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  Submit Test
                </button>
              </div>
            )}

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Test;
