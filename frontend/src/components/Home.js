import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function Home() {
  return (
    <div className="bg-[#100f2c] text-white min-h-screen font-sans">
      <Header />

     
      <section className="pt-24 pb-24 px-[5%] text-center relative bg-[#1c1a4a] bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] border-b border-white/5">
        <div className="max-w-[800px] mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#2d2a6a]/60 text-slate-200 py-[6px] px-6 rounded-full border border-indigo-400/30 text-[13px] font-medium mb-12">
            <span className="text-xl leading-none">🎓</span>
            #1 AI Study Assistant (Highly Recommended)
          </div>

          <h1 className="text-4xl md:text-[4rem] font-bold leading-tight mb-8 tracking-tight">
            <span className="text-white block">AI Academic Assistant</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 block mt-2 pb-2">with RAG</span>
          </h1>

          <p className="text-lg md:text-[1.15rem] text-slate-300 leading-relaxed mb-12 max-w-[650px] mx-auto font-medium">
            Your personal, intelligent study companion. Upload your specific notes and books, and let AI explain topics, generate summaries, and prepare you for exams without hallucinating.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/study" className="bg-indigo-500 text-white py-3.5 px-8 rounded-full no-underline font-bold inline-flex items-center justify-center gap-2 text-[15px] transition-transform duration-200 hover:scale-105 hover:bg-indigo-600 shadow-lg shadow-indigo-500/25">Get Started Free <span className="text-lg leading-none">&rarr;</span></Link>
            <a href="#features" className="bg-transparent text-white py-3.5 px-8 rounded-full no-underline font-bold border-[1.5px] border-slate-500/50 transition-colors duration-300 text-[15px] hover:bg-white/5 hover:border-slate-400">See How It Works</a>
          </div>
        </div>
      </section>

     
      <section id="features" className="py-24 px-[5%] bg-slate-900 border-t border-white/5">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-50 mb-4 inline-flex items-center gap-3">
              <span className="text-3xl">💡</span> What It Does
            </h2>
            <p className="text-slate-400 text-lg">Everything a student needs in one unified platform.</p>
          </div>

          <div className="bg-white/5 p-8 md:p-12 rounded-2xl border border-white/10 shadow-xl">
            <h3 className="text-2xl font-semibold text-slate-200 mb-8 border-b border-white/10 pb-4">Students can:</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 list-none p-0 text-[1.1rem] text-slate-300">
              <li className="flex items-start gap-4">
                <span className="text-indigo-400 text-xl mt-0.5">•</span>
                <span>Upload notes <strong>(PDF, DOCX, TXT)</strong></span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-indigo-400 text-xl mt-0.5">•</span>
                <span>Ask questions from those notes</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-indigo-400 text-xl mt-0.5">•</span>
                <span>Get summaries instantly</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-indigo-400 text-xl mt-0.5">•</span>
                <span>Generate quizzes and test knowledge</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-indigo-400 text-xl mt-0.5">•</span>
                <span>Get explanations in simple language</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-indigo-400 text-xl mt-0.5">•</span>
                <span>Create interactive flashcards</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-indigo-400 text-xl mt-0.5">•</span>
                <span>Prepare comprehensively for exams</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      
      <section id="tech" className="py-24 px-[5%] border-t border-white/5 relative overflow-hidden">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-[900px] mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-50 mb-10 flex items-center gap-3">
              <span className="text-2xl">🔥</span> Tech Stack
            </h2>
            <ul className="list-none p-0 text-slate-300 leading-relaxed text-[1.05rem]">
              <li className="mb-5 pb-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center gap-2">
                <strong className="text-indigo-400 min-w-[120px]">Frontend:</strong>
                <span>React / HTML-CSS-JS</span>
              </li>
              <li className="mb-5 pb-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center gap-2">
                <strong className="text-indigo-400 min-w-[120px]">Backend:</strong>
                <span>Node.js / Python (FastAPI)</span>
              </li>
              <li className="mb-5 pb-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center gap-2">
                <strong className="text-indigo-400 min-w-[120px]">LLM API:</strong>
                <span>OpenAI or Gemini</span>
              </li>
              <li className="mb-5 pb-5 border-b border-transparent flex flex-col sm:flex-row sm:items-center gap-2">
                <strong className="text-indigo-400 min-w-[120px]">Database:</strong>
                <span>MongoDB / PostgreSQL</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/40 to-[#100f2c] p-8 md:p-10 rounded-2xl border border-indigo-500/20 shadow-2xl shadow-indigo-900/20">
            <h4 className="text-white font-bold mb-4 text-xl flex items-center gap-3">
              <span className="text-2xl">💡</span> Bonus Feature
            </h4>
            <div className="text-indigo-300 font-semibold text-lg mb-3">
              Use RAG (Retrieval Augmented Generation)
            </div>
            <p className="text-slate-400 leading-relaxed">
              This advanced architecture avoids sending massive amounts of data to the LLM directly. Instead, it securely retrieves only the most relevant snippets from your documents to generate accurate, context-aware answers.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
