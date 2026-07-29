import { Link } from 'react-router-dom'
import { PhoneCall, ShieldCheck, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-4xl w-full text-center space-y-8">
        
        <div className="flex justify-center mb-6 animate-in fade-in zoom-in duration-500">
          <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg">
            <PhoneCall size={64} strokeWidth={1.5} />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">NumberDial CRM</span>
        </h1>
        
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The all-in-one lead management system designed for high-performance telecalling teams. Track, dial, and close deals effortlessly.
        </p>

        <div className="grid md:grid-cols-3 gap-6 pt-8 pb-12 max-w-3xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Zap size={24} />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Lightning Fast</h3>
            <p className="text-sm text-slate-500">Optimized for quick data entry and rapid calling without delays.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Secure Data</h3>
            <p className="text-sm text-slate-500">Role-based access ensures telecallers only see their assigned leads.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
              <PhoneCall size={24} />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">One-Click Dial</h3>
            <p className="text-sm text-slate-500">Integrated directly with WhatsApp for instant customer communication.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 text-lg font-semibold rounded-xl text-white bg-slate-900 hover:bg-slate-800 shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
          >
            Access Dashboard
          </Link>
          <a
            href="https://github.com/chandansinghlodhi27-ship-it/NumberDialCRM"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 text-lg font-semibold rounded-xl text-slate-700 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200"
          >
            View Documentation
          </a>
        </div>
        
      </div>
    </div>
  )
}
