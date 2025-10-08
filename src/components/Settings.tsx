import React from 'react';
import { Bell, Shield, Globe, Moon, Sun, Sliders, Key, Download, Upload } from 'lucide-react';

export default function Settings() {
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [notifications, setNotifications] = React.useState({
    trades: true,
    priceAlerts: true,
    security: true,
    newsletter: false
  });

  const settingsSections = [
    {
      title: 'Appearance',
      icon: isDarkMode ? Moon : Sun,
      items: [
        {
          label: 'Dark Mode',
          description: 'Toggle between light and dark themes',
          type: 'toggle',
          value: isDarkMode,
          onChange: setIsDarkMode
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          label: 'Trade Confirmations',
          description: 'Get notified when trades are executed',
          type: 'toggle',
          value: notifications.trades,
          onChange: (value: boolean) => setNotifications(prev => ({ ...prev, trades: value }))
        },
        {
          label: 'Price Alerts',
          description: 'Receive alerts for price movements',
          type: 'toggle',
          value: notifications.priceAlerts,
          onChange: (value: boolean) => setNotifications(prev => ({ ...prev, priceAlerts: value }))
        },
        {
          label: 'Security Notifications',
          description: 'Important security updates',
          type: 'toggle',
          value: notifications.security,
          onChange: (value: boolean) => setNotifications(prev => ({ ...prev, security: value }))
        },
        {
          label: 'Newsletter',
          description: 'Weekly market updates and insights',
          type: 'toggle',
          value: notifications.newsletter,
          onChange: (value: boolean) => setNotifications(prev => ({ ...prev, newsletter: value }))
        }
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      items: [
        {
          label: 'Two-Factor Authentication',
          description: 'Add an extra layer of security',
          type: 'button',
          buttonText: 'Configure'
        },
        {
          label: 'API Keys',
          description: 'Manage your API access keys',
          type: 'button',
          buttonText: 'Manage'
        },
        {
          label: 'Backup Wallet',
          description: 'Download wallet backup file',
          type: 'button',
          buttonText: 'Download'
        }
      ]
    },
    {
      title: 'Trading',
      icon: Sliders,
      items: [
        {
          label: 'Default Slippage',
          description: 'Set default slippage tolerance',
          type: 'input',
          value: '0.5%'
        },
        {
          label: 'Gas Price',
          description: 'Preferred gas price setting',
          type: 'select',
          options: ['Slow', 'Standard', 'Fast', 'Aggressive']
        }
      ]
    }
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Customize your DreamWave experience</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-400 w-10 h-10 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                </div>

                <div className="space-y-6">
                  {section.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-slate-700/30 last:border-b-0">
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">{item.label}</h3>
                        <p className="text-slate-400 text-sm">{item.description}</p>
                      </div>

                      <div className="ml-6">
                        {item.type === 'toggle' && (
                          <button
                            onClick={() => item.onChange && item.onChange(!item.value)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              item.value ? 'bg-blue-600' : 'bg-slate-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                item.value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        )}

                        {item.type === 'button' && (
                          <button className="bg-slate-700/50 border border-slate-600 text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-700 transition-all duration-200">
                            {item.buttonText}
                          </button>
                        )}

                        {item.type === 'input' && (
                          <input
                            type="text"
                            defaultValue={item.value}
                            className="bg-slate-700/50 border border-slate-600 text-white rounded-lg px-3 py-2 w-24 text-center focus:outline-none focus:border-blue-500"
                          />
                        )}

                        {item.type === 'select' && (
                          <select className="bg-slate-700/50 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
                            {item.options?.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Data Management */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mt-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-pink-400 w-10 h-10 rounded-xl flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Data Management</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <button className="bg-slate-700/30 border border-slate-600 rounded-xl p-6 hover:bg-slate-700/50 transition-all duration-200 text-left">
              <Download className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-white font-semibold mb-2">Export Data</h3>
              <p className="text-slate-400 text-sm">Download your trading history and portfolio data</p>
            </button>

            <button className="bg-slate-700/30 border border-slate-600 rounded-xl p-6 hover:bg-slate-700/50 transition-all duration-200 text-left">
              <Upload className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="text-white font-semibold mb-2">Import Data</h3>
              <p className="text-slate-400 text-sm">Import portfolio data from other platforms</p>
            </button>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-gradient-to-br from-red-900/20 to-rose-900/20 border border-red-700/30 rounded-2xl p-6 mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Danger Zone</h2>
          
          <div className="space-y-4">
            <button className="bg-red-600/20 border border-red-500/30 text-red-400 px-6 py-3 rounded-lg hover:bg-red-600/30 transition-all duration-200 font-medium">
              Reset All Settings
            </button>
            
            <button className="bg-red-600/20 border border-red-500/30 text-red-400 px-6 py-3 rounded-lg hover:bg-red-600/30 transition-all duration-200 font-medium">
              Disconnect All Sessions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}