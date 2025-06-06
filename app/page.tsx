"use client";

import React, { useState, useEffect } from "react";
import { callAI } from "@/app/actions";

interface Program {
  name: string;
  provider: string;
  monthlyPrice: number;
  medication: string;
  description: string;
  support: string;
  insurance: string;
  visits: string;
  affiliateLink?: string;
  featured?: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function TelehealthFinderApp() {
  const [preferences, setPreferences] = useState({
    budgetRange: "",
    insurance: "",
    medication: "",
    visitType: "",
    extraSupport: "",
    delivery: ""
  });
  const [programs, setPrograms] = useState<Program[]>([]);
  const [savedPrograms, setSavedPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showBookPromo, setShowBookPromo] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem("glp-preferences");
      if (savedPrefs) {
        setPreferences({ ...preferences, ...JSON.parse(savedPrefs) });
      }

      const savedProgs = localStorage.getItem("glp-saved-programs");
      if (savedProgs) {
        setSavedPrograms(JSON.parse(savedProgs));
      }

      // Show book promo after a delay if user hasn't seen it
      const hasSeenPromo = localStorage.getItem("glp-book-promo-seen");
      if (!hasSeenPromo) {
        setTimeout(() => setShowBookPromo(true), 15000);
      }
    } catch (error) {
      console.log("Error loading saved data:", error);
    }

    // PWA Install Prompt Handler
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after user interaction
      const hasSeenInstall = localStorage.getItem("glp-install-prompt-seen");
      if (!hasSeenInstall) {
        setTimeout(() => setShowInstallPrompt(true), 10000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const updatePreference = (key: string, value: string) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    try {
      localStorage.setItem("glp-preferences", JSON.stringify(newPreferences));
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  const generatePrograms = async () => {
    if (!preferences || Object.values(preferences).every(val => !val)) {
      alert("Please select at least one preference to find matches.");
      return;
    }
    
    setLoading(true);
    try {
      const generated = await callAI(preferences);
      setPrograms(generated);
      
      const allSaved = [...savedPrograms, ...generated];
      setSavedPrograms(allSaved);
      localStorage.setItem("glp-saved-programs", JSON.stringify(allSaved));
      
    } catch (error) {
      console.error("Error generating programs:", error);
      alert("Error finding programs. Please try again.");
    }
    setLoading(false);
  };

  const handleGetStarted = (program: Program) => {
    // Analytics tracking
    if (typeof window !== 'undefined') {
      if ((window as any).gtag) {
        (window as any).gtag('event', 'affiliate_click', {
          program_name: program.name,
          provider: program.provider,
          monthly_price: program.monthlyPrice,
          has_affiliate_link: !!program.affiliateLink
        });
      }
    }
    
    if (program.affiliateLink) {
      window.open(program.affiliateLink, '_blank');
    } else {
      setShowLeadForm(true);
    }
  };

  const handleBookClick = () => {
    if (typeof window !== 'undefined') {
      if ((window as any).gtag) {
        (window as any).gtag('event', 'book_click', {
          book_title: 'Telehealth GLP-1 Directory'
        });
      }
    }
    window.open('https://a.co/d/dS8bYRz', '_blank');
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      localStorage.setItem("glp-install-prompt-seen", "true");
    }
  };

  const closeInstallPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem("glp-install-prompt-seen", "true");
  };

  const closeBookPromo = () => {
    setShowBookPromo(false);
    localStorage.setItem("glp-book-promo-seen", "true");
  };

  const clearHistory = () => {
    setSavedPrograms([]);
    localStorage.removeItem("glp-saved-programs");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Install App Prompt */}
        {showInstallPrompt && deferredPrompt && (
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-100 to-teal-100 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="font-semibold text-blue-800">Install GLP-1 Finder App</p>
                  <p className="text-sm text-blue-700">Get faster access and offline features!</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleInstallApp}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                >
                  Install
                </button>
                <button
                  onClick={closeInstallPrompt}
                  className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-4 text-gray-800">
            GLP-1 Telehealth Program Finder
          </h1>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Find personalized GLP-1 telehealth programs that match your budget, insurance, and lifestyle preferences. 
            Compare top-rated providers and get started today!
          </p>
          
          {/* Book Promotion Banner */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border border-purple-200">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="text-left">
                <p className="text-sm font-semibold text-purple-800">📚 NEW BOOK RELEASE</p>
                <p className="text-purple-700 font-medium">Complete Telehealth GLP-1 Directory</p>
              </div>
              <button
                onClick={handleBookClick}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold text-sm"
              >
                Get on Amazon →
              </button>
            </div>
          </div>
        </div>

        {/* Preference Selection */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <select
            className="p-3 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            value={preferences.budgetRange}
            onChange={(e) => updatePreference("budgetRange", e.target.value)}
          >
            <option value="">Budget Range</option>
            <option value="under $100/month">Under $100/month</option>
            <option value="$100-$250/month">$100–$250/month</option>
            <option value="$250-$500/month">$250–$500/month</option>
            <option value="$500+">Over $500/month</option>
          </select>

          <select
            className="p-3 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            value={preferences.insurance}
            onChange={(e) => updatePreference("insurance", e.target.value)}
          >
            <option value="">Insurance Coverage</option>
            <option value="yes">Accepts Insurance</option>
            <option value="no">Self-Pay Only</option>
          </select>

          <select
            className="p-3 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            value={preferences.medication}
            onChange={(e) => updatePreference("medication", e.target.value)}
          >
            <option value="">Medication Preference</option>
            <option value="semaglutide">Semaglutide</option>
            <option value="tirzepatide">Tirzepatide</option>
            <option value="no preference">No Preference</option>
          </select>

          <select
            className="p-3 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            value={preferences.visitType}
            onChange={(e) => updatePreference("visitType", e.target.value)}
          >
            <option value="">Visit Type</option>
            <option value="virtual visits">Virtual Visits</option>
            <option value="in-person options">In-Person Options</option>
          </select>

          <select
            className="p-3 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            value={preferences.extraSupport}
            onChange={(e) => updatePreference("extraSupport", e.target.value)}
          >
            <option value="">Extra Support</option>
            <option value="coaching included">Coaching Included</option>
            <option value="minimal support needed">Minimal Support Needed</option>
          </select>

          <select
            className="p-3 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            value={preferences.delivery}
            onChange={(e) => updatePreference("delivery", e.target.value)}
          >
            <option value="">Medication Delivery</option>
            <option value="home delivery available">Home Delivery</option>
            <option value="pickup or mail order">Pickup or Mail Order</option>
          </select>
        </div>

        <button
          onClick={generatePrograms}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-[#5eead4] to-[#4ade80] text-white font-bold text-xl transition transform hover:scale-105 disabled:opacity-50 shadow-lg"
        >
          {loading ? "Finding Matches..." : "Find My Perfect Match"}
        </button>

        {programs.length > 0 && (
          <div className="mt-10">
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-700">
              Recommended Programs for You
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl shadow-lg bg-white border-2 transition-all hover:scale-105 hover:shadow-xl relative ${
                    program.featured ? 'border-green-400 ring-2 ring-green-200' : 'border-gray-200'
                  }`}
                >
                  {program.featured && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        RECOMMENDED
                      </span>
                    </div>
                  )}

                  <h4 className="text-lg font-bold text-gray-800 mb-2">
                    {program.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">{program.provider}</p>
                  <p className="text-2xl font-bold text-green-600 mb-2">
                    ${program.monthlyPrice}/mo
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    <span className="font-semibold">Medication:</span> {program.medication}
                  </p>

                  <div className="space-y-3">
                    <button
                      onClick={() => setSelectedProgram(selectedProgram === index ? null : index)}
                      className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                      {selectedProgram === index ? "Hide Details" : "View Details"}
                    </button>
                    
                    <button
                      onClick={() => handleGetStarted(program)}
                      className={`w-full py-3 px-4 rounded-lg font-bold text-white transition transform hover:scale-105 ${
                        program.affiliateLink 
                          ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg' 
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                      }`}
                    >
                      {program.affiliateLink ? '🚀 Start Now - Special Offer' : 'Get More Info'}
                    </button>
                  </div>

                  {selectedProgram === index && (
                    <div className="mt-4 text-sm text-gray-700 border-t pt-4">
                      <p className="mb-3">{program.description}</p>
                      <div className="space-y-2">
                        <p>
                          <span className="font-semibold">Support:</span> {program.support}
                        </p>
                        <p>
                          <span className="font-semibold">Insurance:</span> {program.insurance}
                        </p>
                        <p>
                          <span className="font-semibold">Visit Type:</span> {program.visits}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-center text-blue-800 text-sm">
                💡 <strong>Pro Tip:</strong> Programs marked "RECOMMENDED" are our top-rated partners with proven results and excellent patient satisfaction scores.
              </p>
            </div>
          </div>
        )}

        {/* Book Promotion Modal */}
        {showBookPromo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-4">📚 Want to Learn More?</h3>
                <p className="text-gray-600 mb-4">
                  Get the complete guide to GLP-1 telehealth providers with detailed reviews, 
                  pricing comparisons, and insider tips in our comprehensive directory book.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleBookClick}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 font-semibold"
                  >
                    Get the Book on Amazon
                  </button>
                  <button
                    onClick={closeBookPromo}
                    className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lead Capture Modal for non-affiliate programs */}
        {showLeadForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Get Personalized Information</h3>
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                alert("Thank you! We'll send you more information about this program.");
                setShowLeadForm(false);
              }}>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full p-3 border rounded-lg"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full p-3 border rounded-lg"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full p-3 border rounded-lg"
                  required
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Send Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLeadForm(false)}
                    className="px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {savedPrograms.length > 0 && (
          <div className="mt-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-700">
                Search History ({savedPrograms.length} programs saved)
              </h3>
              <button
                onClick={clearHistory}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Clear History
              </button>
            </div>
            <p className="text-sm text-gray-600 text-center">
              Your search results are automatically saved for easy comparison
            </p>
          </div>
        )}

        {/* Footer with Book Promotion */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center">
            <h4 className="text-lg font-semibold mb-2">Need More Detailed Information?</h4>
            <p className="text-gray-600 mb-4">
              Get our complete Telehealth GLP-1 Directory with 50+ providers, detailed reviews, and comparison charts.
            </p>
            <button
              onClick={handleBookClick}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 font-semibold transition"
            >
              📚 Get the Complete Directory on Amazon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}