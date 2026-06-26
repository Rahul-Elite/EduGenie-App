import React from 'react';
import Header from './Header';
import Footer from './Footer';

function AboutUs() {
  const creatorsData = [
    {
      id: 1,
      name: 'Rahul Kushwaha',
      role: 'Developer',
      image: '/images/Creator_1.jpg',
      linkedin: 'https://www.linkedin.com/in/rahul-kushwaha-15381b36',
      github: 'https://github.com/Rahul-Elite'
    },
    {
      id: 2,
      name: 'Salendra Singh Yadav',
      role: 'Developer',
      image: '/images/creator_2.jpeg',
      linkedin: '#',
      github: '#'
    },
    {
      id: 3,
      name: 'Sharwan Kumar',
      role: 'Developer',
      image: '/images/creator_3.jpeg',
      linkedin: 'https://www.linkedin.com/in/sharwan-kumar-091548343',
      github: 'https://github.com/sharwan1470'
    },
    {
      id: 4,
      name: 'Vansh Sharma',
      role: 'Developer',
      image: '/images/creator_4.jpeg',
      linkedin: 'https://www.linkedin.com/in/vanshsharmahp',
      github: 'https://github.com/Vansh786786'
    }
  ];

  return (
    <div className="bg-[#100f2c] text-white min-h-screen font-sans flex flex-col">
      <Header />

      <main className="flex-grow py-20 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-[1000px] mx-auto relative z-10">

          <div className="text-center mb-20 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">EduGenie</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-[700px] mx-auto leading-relaxed">
              We are on a mission to revolutionize how students interact with knowledge. Our platform harnesses the power of advanced AI to make learning more efficient, accurate, and deeply personalized.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
            <div className="bg-[#1c1a4a]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-10 lg:p-12 shadow-2xl shadow-indigo-900/20 transition-transform duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-500/30">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-100 mb-4">Our Vision</h3>
              <p className="text-slate-400 leading-relaxed text-[1.05rem]">
                We envision a world where every learner has a 24/7 personal tutor that perfectly understands their study materials. By eliminating the friction of traditional studying, we want to empower students to reach their highest academic potential.
              </p>
            </div>

            <div className="bg-[#1c1a4a]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-10 lg:p-12 shadow-2xl shadow-indigo-900/20 transition-transform duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-500/30">
                <span className="text-3xl">🧠</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-100 mb-4">The Technology</h3>
              <p className="text-slate-400 leading-relaxed text-[1.05rem]">
                EduGenie doesn't just pass queries to a generic LLM. We utilize cutting-edge Retrieval-Augmented Generation (RAG) architecture. This means the AI strictly searches your specific uploaded notes to construct contextually flawless, non-hallucinated answers.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/40 to-[#0b0a1f] p-10 md:p-16 rounded-[2.5rem] border border-indigo-500/20 text-center relative overflow-hidden mb-24">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z\' fill=\'%23ffffff\' fill-opacity=\'0.02\' fill-rule=\'evenodd\'/%3E%3C/svg%3E')] opacity-50"></div>

            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-6">Designed Built For Students, By Innovators</h2>
              <p className="text-indigo-200/80 max-w-[600px] mx-auto text-lg mb-10">
                Created with a passion for SDG 4 (Quality Education) and SDG 10 (Reduced Inequalities), ensuring world-class academic support is accessible to everyone.
              </p>

              <div className="inline-flex items-center gap-3 bg-indigo-500/20 text-indigo-300 px-6 py-3 rounded-full border border-indigo-500/30 font-medium tracking-wide">
                <span>Join us on this journey </span> <span className="text-xl leading-none">✨</span>
              </div>
            </div>
          </div>


         
          <div>
            <div className="text-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Meet The Creators</h2>
              <p className="text-slate-400 max-w-[600px] mx-auto text-lg">
                The innovative minds behind EduGenie, dedicated to transforming education through technology.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {creatorsData.map((creator) => (
                <div key={creator.id} className="bg-[#1c1a4a]/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 text-center hover:-translate-y-2 transition-transform duration-300 hover:shadow-2xl hover:shadow-indigo-500/20 group">
                  <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 p-1 mb-6 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={creator.image}
                      alt={creator.name}
                      className="w-full h-full rounded-full object-cover object-top border-4 border-[#100f2c]"
                    />
                  </div>
                  <h4 className="text-xl font-bold text-slate-100 mb-1">{creator.name}</h4>
                  <p className="text-indigo-400 text-sm font-medium mb-4">{creator.role}</p>

                 
                  <div className="flex justify-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                    <a href={creator.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-indigo-500/40 cursor-pointer transition-colors" title="LinkedIn">
                      <svg className="w-4 h-4 fill-current text-slate-300" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                    </a>
                    <a href={creator.github} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-indigo-500/40 cursor-pointer transition-colors" title="GitHub">
                      <svg className="w-4 h-4 fill-current text-slate-300" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AboutUs;
