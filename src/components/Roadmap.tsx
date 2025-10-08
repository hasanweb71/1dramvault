import React from 'react';
import { Calendar, CheckCircle, Clock, Target, Rocket, Users, Shield, Zap } from 'lucide-react';

export default function Roadmap() {
  const quarters = [
    {
      id: 'Q1',
      title: 'Q3 2025',
      subtitle: 'Foundation & Launch',
      status: 'completed',
      progress: 100,
      milestones: [
        { task: 'Token Contract Deployment', completed: true, icon: Shield },
        { task: 'Initial Liquidity Pool', completed: true, icon: Zap },
        { task: 'Community Building', completed: true, icon: Users },
        { task: 'Website & Documentation', completed: true, icon: Target }
      ],
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-emerald-50'
    },
    {
      id: 'Q2',
      title: 'Q4 2025',
      subtitle: 'Staking Platform',
      status: 'in-progress',
      progress: 75,
      milestones: [
        { task: 'Staking Smart Contracts', completed: true, icon: Lock },
        { task: 'Referral System', completed: true, icon: Users },
        { task: 'Listing Crypto Research Market Platform', completed: false, icon: Target },
        { task: 'Security Audits', completed: false, icon: Shield }
      ],
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-indigo-50'
    },
    {
      id: 'Q3',
      title: 'Q1 2026',
      subtitle: 'DeFi Integration',
      status: 'upcoming',
      progress: 25,
      milestones: [
        { task: 'DEX Aggregator', completed: false, icon: Zap },
        { task: 'Yield Farming', completed: false, icon: Target },
        { task: 'NFT Marketplace', completed: false, icon: Rocket },
        { task: 'Cross-chain Bridge', completed: false, icon: Shield }
      ],
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-pink-50'
    },
    {
      id: 'Q4',
      title: 'Q2 2026',
      subtitle: 'Ecosystem Expansion',
      status: 'planned',
      progress: 0,
      milestones: [
        { task: 'DAO Governance', completed: false, icon: Users },
        { task: 'Metaverse Integration', completed: false, icon: Rocket },
        { task: 'Enterprise Partnerships', completed: false, icon: Target },
        { task: 'Global Marketing', completed: false, icon: Zap }
      ],
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-yellow-50'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-black" />;
      case 'in-progress':
        return <Clock className="w-6 h-6 text-black" />;
      case 'upcoming':
        return <Target className="w-6 h-6 text-black" />;
      default:
        return <Calendar className="w-6 h-6 text-black" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'upcoming':
        return 'Upcoming';
      default:
        return 'Planned';
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">1DREAM Future</h1>
          <p className="text-xl text-slate-400">Our journey to revolutionize decentralized finance</p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100 mb-12">
          <h2 className="text-2xl font-bold text-black mb-6 text-center">Overall Progress</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {quarters.map((quarter) => (
              <div key={quarter.id} className="text-center">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${quarter.color} flex items-center justify-center mx-auto mb-3`}>
                  {getStatusIcon(quarter.status)}
                </div>
                <h3 className="font-bold text-black mb-1">{quarter.title}</h3>
                <p className="text-sm text-black mb-2">{getStatusText(quarter.status)}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${quarter.color} transition-all duration-500`}
                    style={{ width: `${quarter.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-black mt-1">{quarter.progress}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quarterly Roadmap */}
        <div className="grid lg:grid-cols-2 gap-8">
          {quarters.map((quarter, index) => (
            <div key={quarter.id} className="bg-white backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className={`bg-gradient-to-r ${quarter.bgColor} p-6 border-b border-gray-200`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-black">{quarter.title}</h3>
                    <p className="text-black font-medium">{quarter.subtitle}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${quarter.color} flex items-center justify-center`}>
                    {getStatusIcon(quarter.status)}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-black mb-1">
                    <span>Progress</span>
                    <span>{quarter.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full bg-gradient-to-r ${quarter.color} transition-all duration-500`}
                      style={{ width: `${quarter.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Milestones */}
              <div className="p-6">
                <h4 className="text-lg font-bold text-black mb-4">Key Milestones</h4>
                <div className="space-y-4">
                  {quarter.milestones.map((milestone, milestoneIndex) => {
                    const Icon = milestone.icon;
                    return (
                      <div key={milestoneIndex} className="flex items-center space-x-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          milestone.completed 
                            ? 'bg-green-100 text-black' 
                            : 'bg-gray-200 text-black'
                        }`}>
                          {milestone.completed ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            milestone.completed ? 'text-black' : 'text-black'
                          }`}>
                            {milestone.task}
                          </p>
                        </div>
                        {milestone.completed && (
                          <div className="text-black text-sm font-medium">
                            ✓ Done
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timeline */}
              <div className={`bg-gradient-to-r ${quarter.bgColor} p-4 border-t border-gray-200`}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-black">Timeline</span>
                  <span className="font-medium text-black">
                    {quarter.status === 'completed' ? 'Completed' : 
                     quarter.status === 'in-progress' ? 'In Progress' :
                     quarter.status === 'upcoming' ? 'Starting Soon' : 'Planning Phase'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Future Vision */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="text-center">
            <Rocket className="w-16 h-16 mx-auto mb-6 text-white" />
            <h2 className="text-3xl font-bold mb-4">Beyond 2026</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Our vision extends far beyond 2026. We're building the foundation for a comprehensive DeFi ecosystem 
              that will empower millions of users worldwide to achieve their financial dreams.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <Users className="w-8 h-8 mb-4 mx-auto" />
                <h3 className="text-lg font-bold mb-2">Global Adoption</h3>
                <p className="text-sm opacity-90">Reaching 1M+ active users across all continents</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <Shield className="w-8 h-8 mb-4 mx-auto" />
                <h3 className="text-lg font-bold mb-2">Enterprise Solutions</h3>
                <p className="text-sm opacity-90">Providing DeFi infrastructure for businesses</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <Zap className="w-8 h-8 mb-4 mx-auto" />
                <h3 className="text-lg font-bold mb-2">Innovation Hub</h3>
                <p className="text-sm opacity-90">Leading the next wave of DeFi innovations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}