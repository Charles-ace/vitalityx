import { Dashboard } from '@/components/Dashboard'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 overflow-hidden relative selection:bg-neon-blue/30 selection:text-neon-blue">
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-neon-blue/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-neon-green/10 blur-[120px]" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center pt-10 md:pt-20">
        <Dashboard />
      </div>
    </main>
  )
}
