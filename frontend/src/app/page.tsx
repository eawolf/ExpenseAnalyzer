import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-indigo-500/30">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>
      
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-6 backdrop-blur-md bg-zinc-950/50 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            E
          </div>
          <span className="font-semibold text-lg tracking-tight">ExpenseAnalyzer</span>
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/login" className="text-zinc-400 hover:text-white transition-colors">
            Login
          </Link>
          <Link href="/signup" className="bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors shadow-sm">
            Get Started
          </Link>
        </nav>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-medium border border-indigo-500/20 mb-8 backdrop-blur-sm">
          <span className="flex w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          AI-Powered Financial Insights
        </div>
        
        <h1 className="max-w-4xl text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-6">
          Master your money.<br/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Effortlessly.</span>
        </h1>
        
        <p className="max-w-2xl text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed">
          Track expenses, analyze spending habits with AI, and achieve your financial goals with our secure, privacy-first platform.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link href="/signup" className="flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)] w-full sm:w-auto">
            Start for free
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
          <Link href="#features" className="flex items-center justify-center px-8 py-4 rounded-full font-medium text-white border border-white/10 hover:bg-white/5 transition-all w-full sm:w-auto">
            Learn more
          </Link>
        </div>

        <div className="mt-20 w-full max-w-5xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 shadow-2xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
           <div className="aspect-[16/9] w-full rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center relative overflow-hidden">
             <img src="/dashboard-preview.png" alt="Dashboard Preview" className="w-full h-full object-cover rounded-xl" />
           </div>
        </div>
      </main>
      
      <section id="features" className="py-32 px-8 relative border-t border-white/5 bg-zinc-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Everything you need</h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-lg">Powerful features designed to help you take control of your financial life without the complexity.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "AI Analysis",
                description: "Get smart insights and categorization powered by advanced Gemini AI models.",
                icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              },
              {
                title: "Bank-grade Security",
                description: "Your data is encrypted with Argon2id and secured using modern JWT microservice architecture.",
                icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
              },
              {
                title: "True Privacy",
                description: "We don't sell your data. Your financial information stays yours, always.",
                icon: <path d="M2 12h4l2-9 5 18 2-9h5"/>
              }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <footer className="py-8 text-center text-zinc-500 text-sm border-t border-white/5">
        <p>&copy; {new Date().getFullYear()} ExpenseAnalyzer. All rights reserved.</p>
      </footer>
    </div>
  );
}
