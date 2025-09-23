import { Plug, Database, FileSpreadsheet, Layers, GitMerge, Sparkles, Settings, ArrowRight, Play } from "lucide-react"
import LottieBox from "@/components/LottieBox"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function InnovationPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="min-h-[70vh] flex items-center justify-center px-6 bg-gradient-to-br from-purple-50 to-white relative overflow-hidden">
        <div className="absolute top-16 left-12 w-14 h-14 bg-purple-400 rounded-full border-4 border-black shadow-[8px_8px_0_0_#000] animate-bounce" />
        <div className="absolute bottom-16 right-12 w-10 h-10 bg-yellow-400 rounded-full border-4 border-black shadow-[6px_6px_0_0_#000] animate-pulse" />
        <div className="absolute top-1/2 right-24 w-6 h-6 bg-green-400 rounded-full border-2 border-black shadow-[4px_4px_0_0_#000] animate-ping" />

        <div className="max-w-6xl w-full text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-black text-white rounded-full px-4 py-2 border-4 border-black shadow-[8px_8px_0_0_#000] mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-black">COMING SOON</span>
          </div>
          <div className="bg-white rounded-3xl border-6 border-black shadow-[20px_20px_0_0_#000] p-10 md:p-14 mb-8">
            <h1 className="text-4xl md:text-6xl font-black leading-tight text-black mb-4">Our Innovation</h1>
            <h2 className="text-2xl md:text-4xl font-black text-purple-700 mb-6">Plug & Play Recommendation Engine</h2>
            <p className="text-lg md:text-xl font-bold text-gray-700 max-w-3xl mx-auto">
              Bring <span className="whitespace-nowrap bg-yellow-200 px-2 py-1 rounded border-2 border-black">any dataset</span> — CSV, database, or your own collection —
              and instantly power it with <span className="whitespace-nowrap bg-purple-200 px-2 py-1 rounded border-2 border-black">MeTTa</span>'s pattern-matching logic.
            </p>
            <div className="mt-8 flex items-center justify-center gap-6">
              <Link href="/metta-builder">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white font-black text-lg px-8 py-4 rounded-2xl border-4 border-black shadow-[12px_12px_0_0_#000] hover:shadow-[16px_16px_0_0_#000] transition-all transform hover:scale-105">
                  <Play className="mr-2 w-5 h-5" />
                  Try Now
                </Button>
              </Link>
              <div className="hidden md:block">
                <LottieBox src="/animation/MovieTheatre.json" className="size-28 border-2 shadow-[6px_6px_0_0_#000]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plug & Play Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card title="Plug your data" color="bg-blue-100 border-blue-500" icon={<Plug className="w-8 h-8" />}>
            Bring CSVs, databases or APIs. No heavy setup.
          </Card>
          <Card title="Map and configure" color="bg-green-100 border-green-500" icon={<Settings className="w-8 h-8" />}>
            Pick fields like title, tags, genre. Add custom rules.
          </Card>
          <Card title="Layered matching" color="bg-purple-100 border-purple-500" icon={<Layers className="w-8 h-8" />}>
            Combine actor + genre + country or your own facets.
          </Card>
          <Card title="Recommendation graph" color="bg-yellow-100 border-yellow-500" icon={<GitMerge className="w-8 h-8" />}>
            MeTTa builds an explainable link network for picks.
          </Card>
          <Card title="CSV & DB friendly" color="bg-orange-100 border-orange-500" icon={<FileSpreadsheet className="w-8 h-8" />}>
            Works with CSV, Postgres, Mongo, or JSON exports.
          </Card>
          <Card title="Explainable by design" color="bg-red-100 border-red-500" icon={<Database className="w-8 h-8" />}>
            Every result comes with human-readable reasoning.
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-black text-black text-center mb-12">How Plug & Play works</h3>
          <ol className="grid gap-6 md:grid-cols-2">
            <Step n={1} title="Bring your data" desc="Upload CSV or connect to your DB/API." />
            <Step n={2} title="Map fields" desc="Point MeTTa to title, tags, genres, and entities." />
            <Step n={3} title="Choose layers" desc="Stack facets like Genre + Actor + Country." />
            <Step n={4} title="Get recommendations" desc="Run and review explainable results instantly." />
          </ol>
        </div>
      </section>
    </main>
  )
}

function Card({ title, icon, color, children }: { title: string; icon: React.ReactNode; color: string; children: React.ReactNode }) {
  return (
    <div className={`${color} border-4 rounded-2xl p-6 shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_0_0_#000] transition-all transform hover:scale-105`}>
      <div className="mb-4">{icon}</div>
      <h4 className="text-xl font-black mb-2 text-black">{title}</h4>
      <p className="text-sm font-semibold text-gray-700">{children}</p>
    </div>
  )
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <li className="relative rounded-2xl border-4 bg-white p-6 shadow-[10px_10px_0_0_#000]">
      <div className="absolute -top-3 -left-3 bg-black text-white w-10 h-10 flex items-center justify-center rounded-full border-4 border-black shadow-[6px_6px_0_0_#000] font-black">
        {n}
      </div>
      <div className="flex items-start gap-3">
        <ArrowRight className="mt-1 w-6 h-6 text-purple-700" />
        <div>
          <h5 className="text-lg font-black text-black">{title}</h5>
          <p className="text-sm font-semibold text-gray-700 mt-1">{desc}</p>
        </div>
      </div>
    </li>
  )
}


