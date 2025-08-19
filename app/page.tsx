'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SonicCanvas from '@/components/music/SonicCanvas';
import AITeacher from '@/components/learning/AITeacher';
import AICompanion from '@/components/ai/AICompanion';

type View = 'home' | 'sonic-canvas' | 'ai-teacher' | 'search' | 'analytics' | 'settings' | 'ai-companion' | 'goals' | 'journal' | 'health';

const AILifeCompanion: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      // Verify token and get user info
      fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUser(data.user);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('auth-token');
          }
        })
        .catch(() => {
          localStorage.removeItem('auth-token');
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'sonic-canvas':
        return <SonicCanvas />;
      case 'ai-teacher':
        return <AITeacher />;
      case 'ai-companion':
        return <AICompanion />;
      case 'search':
        return <SearchView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      case 'goals':
        return <GoalsView />;
      case 'journal':
        return <JournalView />;
      case 'health':
        return <HealthView />;
      default:
        return <HomePage />;
    }
  };

  const HomePage: React.FC = () => (
    <div className="container mx-auto p-8 bg-gray-950 text-white rounded-xl shadow-2xl min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          AI Life Companion
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Your revolutionary, self-hosted AI companion for life. Experience personalized support, 
          learning, creativity, and growth with complete privacy and zero cost.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <FeatureCard
          title="AI Companion"
          description="Your personal AI companion for conversations, support, and guidance."
          icon="🤖"
          onClick={() => setCurrentView('ai-companion')}
        />
        <FeatureCard
          title="Sonic Canvas"
          description="AI-powered music generation. Create beautiful compositions from text descriptions."
          icon="🎵"
          onClick={() => setCurrentView('sonic-canvas')}
        />
        <FeatureCard
          title="AI Teacher"
          description="Your personal AI learning companion. Ask questions and explore any topic."
          icon="🎓"
          onClick={() => setCurrentView('ai-teacher')}
        />
        <FeatureCard
          title="Goal Tracking"
          description="Set, track, and achieve your personal and professional goals with AI assistance."
          icon="🎯"
          onClick={() => setCurrentView('goals')}
        />
        <FeatureCard
          title="Digital Journal"
          description="Secure, private journaling with AI insights and emotional tracking."
          icon="📝"
          onClick={() => setCurrentView('journal')}
        />
        <FeatureCard
          title="Health & Wellness"
          description="Track your health metrics, mood, and wellness journey with AI guidance."
          icon="❤️"
          onClick={() => setCurrentView('health')}
        />
        <FeatureCard
          title="Smart Search"
          description="Advanced search with AI-powered indexing and intelligent results."
          icon="🔍"
          onClick={() => setCurrentView('search')}
        />
        <FeatureCard
          title="Analytics Dashboard"
          description="Track your usage and get insights into your AI interactions."
          icon="📊"
          onClick={() => setCurrentView('analytics')}
        />
        <FeatureCard
          title="Settings"
          description="Configure your preferences and manage your account."
          icon="⚙️"
          onClick={() => setCurrentView('settings')}
        />
      </div>

      {!isAuthenticated && (
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">Get started by creating an account</p>
          <div className="space-x-4">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Sign Up
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Log In
            </button>
          </div>
        </div>
      )}

      {/* Technical Excellence Section */}
      <div className="mt-16 bg-gray-900 rounded-xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-purple-300">Technical Excellence</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-2">100%</div>
            <div className="text-gray-400">Self-Hosted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">Zero</div>
            <div className="text-gray-400">External APIs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">Local</div>
            <div className="text-gray-400">AI Processing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-2">Complete</div>
            <div className="text-gray-400">Privacy</div>
          </div>
        </div>
      </div>
    </div>
  );

  const FeatureCard: React.FC<{
    title: string;
    description: string;
    icon: string;
    onClick: () => void;
  }> = ({ title, description, icon, onClick }) => (
    <div
      onClick={onClick}
      className="bg-gray-900 rounded-xl p-6 cursor-pointer hover:bg-gray-800 transition-all duration-200 border border-gray-700 hover:border-purple-500"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-purple-300">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );

  const AICompanionView: React.FC = () => (
    <div className="container mx-auto p-8 bg-gray-950 text-white rounded-xl shadow-2xl min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center">AI Companion</h1>
      <p className="text-center text-gray-400 mb-8">Your personal AI companion for conversations and support.</p>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-2xl font-semibold mb-4">Meet Your AI Companion</h2>
            <p className="text-gray-400">Ready to chat, support, and guide you through life's journey.</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Features:</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Personalized conversations and support</li>
              <li>• Memory of your preferences and history</li>
              <li>• Emotional intelligence and empathy</li>
              <li>• Goal setting and tracking assistance</li>
              <li>• Health and wellness guidance</li>
            </ul>
          </div>
          <div className="text-center">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Start Conversation
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const GoalsView: React.FC = () => (
    <div className="container mx-auto p-8 bg-gray-950 text-white rounded-xl shadow-2xl min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center">Goal Tracking</h1>
      <p className="text-center text-gray-400 mb-8">Set, track, and achieve your personal and professional goals.</p>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-semibold mb-4">Goal Management</h2>
            <p className="text-gray-400">Track your progress and get AI-powered insights.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Current Goals</h3>
              <p className="text-gray-400">No goals set yet. Start by creating your first goal!</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Progress Overview</h3>
              <p className="text-gray-400">Track your achievements and milestones.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const JournalView: React.FC = () => (
    <div className="container mx-auto p-8 bg-gray-950 text-white rounded-xl shadow-2xl min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center">Digital Journal</h1>
      <p className="text-center text-gray-400 mb-8">Secure, private journaling with AI insights.</p>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-semibold mb-4">Your Private Journal</h2>
            <p className="text-gray-400">Record your thoughts, experiences, and emotions securely.</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <textarea
              className="w-full h-64 bg-gray-700 text-white border border-gray-600 rounded-lg p-4 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Write your thoughts here..."
            />
            <div className="mt-4 flex justify-between items-center">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Save Entry
              </button>
              <button className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                AI Insights
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const HealthView: React.FC = () => (
    <div className="container mx-auto p-8 bg-gray-950 text-white rounded-xl shadow-2xl min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center">Health & Wellness</h1>
      <p className="text-center text-gray-400 mb-8">Track your health metrics and wellness journey.</p>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">❤️</div>
            <h2 className="text-2xl font-semibold mb-4">Health Dashboard</h2>
            <p className="text-gray-400">Monitor your physical and mental well-being.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl mb-2">😊</div>
              <h3 className="font-semibold mb-2">Mood Tracking</h3>
              <p className="text-gray-400 text-sm">Track your daily mood and emotions</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl mb-2">😴</div>
              <h3 className="font-semibold mb-2">Sleep Quality</h3>
              <p className="text-gray-400 text-sm">Monitor your sleep patterns</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl mb-2">🏃</div>
              <h3 className="font-semibold mb-2">Activity</h3>
              <p className="text-gray-400 text-sm">Track your physical activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SearchView: React.FC = () => (
    <div className="container mx-auto p-8 bg-gray-950 text-white rounded-xl shadow-2xl min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center">Smart Search</h1>
      <p className="text-center text-gray-400 mb-8">Advanced search functionality coming soon...</p>
    </div>
  );

  const AnalyticsView: React.FC = () => (
    <div className="container mx-auto p-8 bg-gray-950 text-white rounded-xl shadow-2xl min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center">Analytics Dashboard</h1>
      <p className="text-center text-gray-400 mb-8">Analytics and insights coming soon...</p>
    </div>
  );

  const SettingsView: React.FC = () => (
    <div className="container mx-auto p-8 bg-gray-950 text-white rounded-xl shadow-2xl min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center">Settings</h1>
      <p className="text-center text-gray-400 mb-8">Settings and configuration coming soon...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-gray-700">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => setCurrentView('home')}
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500"
              >
                AI Life Companion
              </button>
              <div className="hidden md:flex space-x-6">
                <NavButton
                  label="Home"
                  isActive={currentView === 'home'}
                  onClick={() => setCurrentView('home')}
                />
                <NavButton
                  label="AI Companion"
                  isActive={currentView === 'ai-companion'}
                  onClick={() => setCurrentView('ai-companion')}
                />
                <NavButton
                  label="Goals"
                  isActive={currentView === 'goals'}
                  onClick={() => setCurrentView('goals')}
                />
                <NavButton
                  label="Journal"
                  isActive={currentView === 'journal'}
                  onClick={() => setCurrentView('journal')}
                />
                <NavButton
                  label="Health"
                  isActive={currentView === 'health'}
                  onClick={() => setCurrentView('health')}
                />
                <NavButton
                  label="Music"
                  isActive={currentView === 'sonic-canvas'}
                  onClick={() => setCurrentView('sonic-canvas')}
                />
                <NavButton
                  label="Teacher"
                  isActive={currentView === 'ai-teacher'}
                  onClick={() => setCurrentView('ai-teacher')}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-300">Welcome, {user?.username}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <span className="text-gray-400">Not logged in</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{renderView()}</main>
    </div>
  );
};

const NavButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-purple-600 text-white'
        : 'text-gray-300 hover:text-white hover:bg-gray-700'
    }`}
  >
    {label}
  </button>
);

export default AILifeCompanion;


