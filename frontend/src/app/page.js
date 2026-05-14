import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle, Users, BarChart3, Shield } from 'lucide-react'

const features = [
  {
    icon: CheckCircle,
    title: 'Task Management',
    desc: 'Create, assign, and track tasks with priorities and deadlines.'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    desc: 'Add members to projects and manage team access easily.'
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    desc: 'Visualize project progress with charts and dashboards.'
  },
  {
    icon: Shield,
    title: 'Role Based Access',
    desc: 'Admins and members each have their own set of permissions.'
  }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dp-bg via-[#130a28] to-dp-bg">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center">
          <Image src="/ethara.png" alt="Ethara" width={130} height={40} className="h-10 w-auto object-contain" priority />
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-violet-400 hover:text-violet-200 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6">
        <div className="py-24 text-center">
          <div className="inline-block bg-violet-600/20 text-violet-300 border border-violet-500/30 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            Project Management Made Simple
          </div>
          <h1 className="text-5xl font-bold text-violet-50 mb-6 leading-tight">
            Manage projects and<br />
            <span className="text-violet-400">teams effortlessly</span>
          </h1>
          <p className="text-xl text-violet-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            TeamFlow helps you organize projects, assign tasks, track progress,
            and collaborate with your team from one place.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-violet-700 transition-colors shadow-[0_0_20px_rgba(109,40,217,0.4)]"
            >
              Start for free
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="text-violet-300 px-6 py-3 rounded-xl font-medium border border-dp-bstrong hover:bg-dp-raised transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pb-24">
          {features.map(f => {
            const Icon = f.icon
            return (
              <div key={f.title} className="bg-dp-surface rounded-2xl p-6 border border-dp-border hover:border-dp-bstrong transition-all hover:shadow-[0_0_20px_rgba(109,40,217,0.2)]">
                <div className="w-10 h-10 bg-violet-600/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-violet-400" />
                </div>
                <h3 className="font-semibold text-violet-100 mb-2">{f.title}</h3>
                <p className="text-sm text-violet-400 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </main>

      <footer className="border-t border-dp-border py-6 text-center text-sm text-violet-500">
        Built with Next.js, Express, and MongoDB
        <span aria-hidden="true" style={{ display: 'none' }}>
          Full Name: Harsh Kumar Singh | Email: harsh.kumarint17@ethara.ai
        </span>
      </footer>
    </div>
  )
}
