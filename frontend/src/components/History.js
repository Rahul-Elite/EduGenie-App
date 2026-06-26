import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import Header from './Header';
import Footer from './Footer';
import { API_BASE_URL } from '../config';

function History() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/history`, {
        credentials: 'include'
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 401) {
          dispatch(logout());
          navigate('/login');
          throw new Error("Your session has expired. Please log in again.");
        }
        throw new Error(data.message || data.error || 'Failed to fetch history');
      }

      setHistories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white flex flex-col font-sans selection:bg-blue-500/30">
      <Header />

      <main className="flex-grow max-w-5xl mx-auto p-4 sm:p-6 w-full">
        <div className="text-center mb-10 mt-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 drop-shadow-sm">
            Your Study History
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Review all your previously generated summaries, quizzes, and flashcards.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-4 mb-8 rounded-xl text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : histories.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <span className="text-5xl">📭</span>
            <h3 className="text-2xl font-bold mt-4 text-gray-200">No History Found</h3>
            <p className="text-gray-400 mt-2">Upload a file in the Study section to get started.</p>
            <a href="/study" className="inline-block mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors">
              Go to Study
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {histories.map((history) => (
              <div key={history._id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all hover:border-blue-500/30">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-100 mb-1 capitalize">
                      {history.fileName ? history.fileName : (history.summary ? history.summary.split(' ').slice(0, 6).join(' ').replace(/[^a-zA-Z0-9 ]/g, '') + (history.summary.split(' ').length > 6 ? '...' : '') : 'Document Study Session')}
                    </h3>
                    <p className="text-emerald-400 font-medium text-sm flex items-center gap-2 mb-2">
                      <span>🕒</span> {formatDate(history.createdAt)}
                    </p>
                    {history.summary && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {history.summary}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {history.summary && <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">Summary Included</span>}
                      {history.quiz?.length > 0 && <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">{history.quiz.length} MCQs</span>}
                      {history.flashcards?.length > 0 && <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">{history.flashcards.length} Flashcards</span>}
                    </div>
                  </div>

                  <div className="flex gap-3 shrink-0">
                    {history.cloudinaryUrls && history.cloudinaryUrls[0] && (
                      <a
                        href={history.cloudinaryUrls[0]}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        📄 View Document
                      </a>
                    )}
                    <button
                      onClick={() => toggleExpand(history._id)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
                    >
                      {expandedId === history._id ? 'Hide Details' : 'Show Details'}
                    </button>
                  </div>
                </div>

                {expandedId === history._id && (
                  <div className="mt-8 pt-6 border-t border-white/10 space-y-8 animate-in fade-in duration-300">
                    
                    {history.summary && (
                      <div>
                        <h3 className="text-xl font-bold mb-4 text-blue-400 flex items-center gap-2"><span>📝</span> Summary</h3>
                        <div className="p-5 bg-slate-900/50 rounded-xl border border-slate-700">
                          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{history.summary}</p>
                        </div>
                      </div>
                    )}

                    {history.quiz?.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold mb-4 text-emerald-400 flex items-center gap-2"><span>❓</span> Quiz</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {history.quiz.map((q, i) => (
                            <div key={i} className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                              <p className="font-medium text-gray-200 mb-2">Q{i + 1}: {q.question}</p>
                              <p className="text-sm text-emerald-400">Answer: {q.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {history.flashcards?.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold mb-4 text-amber-400 flex items-center gap-2"><span>🎴</span> Flashcards</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {history.flashcards.map((f, i) => (
                            <div key={i} className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                              <p className="text-xs text-gray-500 font-bold mb-1">FRONT</p>
                              <p className="font-medium text-gray-200 mb-3">{f.front || f.question}</p>
                              <p className="text-xs text-amber-500/70 font-bold mb-1">BACK</p>
                              <p className="text-sm text-amber-300">{f.back || f.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default History;
