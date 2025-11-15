import React, { useState } from "react";
import { base44 } from "@/api/firebaseClient";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Search, Sparkles, Zap, Users, Shield, MessageCircle, ArrowRight, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const navigate = useNavigate();
  const [quickSearch, setQuickSearch] = useState("");
  const [searchHints, setSearchHints] = useState([]);
  const [searching, setSearching] = useState(false);

  const { data: isAuthenticated } = useQuery({
    queryKey: ['isAuthenticated'],
    queryFn: () => base44.auth.isAuthenticated(),
  });

  const handleQuickFind = async () => {
    if (!quickSearch.trim()) return;
    
    setSearching(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `A user lost: "${quickSearch}". Based on this, suggest:
1. Common places where this item might be found on a campus/city (be specific)
2. Tips for finding this item
3. Categories to search under
Respond in a helpful, friendly way.`,
        response_json_schema: {
          type: "object",
          properties: {
            locations: { type: "array", items: { type: "string" } },
            tips: { type: "array", items: { type: "string" } },
            category: { type: "string" }
          }
        }
      });

      setSearchHints(result);
      
      // If authenticated, navigate to browse with hints
      if (isAuthenticated) {
        navigate(createPageUrl("Browse"));
      }
    } catch (error) {
      console.error("Quick find error:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleGetStarted = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    if (authenticated) {
      navigate(createPageUrl("Browse"));
    } else {
      base44.auth.redirectToLogin(createPageUrl("Browse"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 overflow-hidden relative">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-20deg); }
        }
        
        @keyframes bounce-search {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(59, 130, 246, 0.2); }
          50% { box-shadow: 0 0 30px rgba(168, 85, 247, 0.6), 0 0 60px rgba(59, 130, 246, 0.4); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-wave { animation: wave 1s ease-in-out; }
        .animate-bounce-search { animation: bounce-search 2s ease-in-out infinite; }
        .glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
      `}</style>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-cyan-400/30 to-blue-400/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Floating Icons */}
        <motion.div
          className="absolute top-1/4 right-1/4 text-4xl animate-float"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          🔑
        </motion.div>
        <motion.div
          className="absolute bottom-1/3 left-1/4 text-4xl"
          style={{ animationDelay: "2s" }}
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          📱
        </motion.div>
        <motion.div
          className="absolute top-1/2 right-1/3 text-4xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          🎒
        </motion.div>
      </div>

      {/* Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center shadow-lg glow-pulse"
            >
              <Zap className="w-7 h-7 text-white" fill="currentColor" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
                FindIt
              </h1>
              <p className="text-xs text-gray-600">AI-Powered Lost & Found</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white shadow-lg"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-medium mb-6"
              >
                <Sparkles className="w-4 h-4" />
                Smart AI Matching Technology
              </motion.div>
              
              <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
                  Never Lose
                </span>
                <br />
                <span className="text-gray-800">Anything Again!</span>
              </h2>
              
              <p className="text-xl text-gray-600 mb-8">
                The smartest way to find your lost items with AI-powered matching, 
                interactive maps, and instant community alerts. 🚀
              </p>
            </div>

            {/* Quick Find Feature */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-purple-200 shadow-xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-lg">⚡ Quick Find</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Tell us what you lost and get instant AI-powered hints!
              </p>
              
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Black iPhone 13..."
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQuickFind()}
                  className="flex-1 border-purple-300 focus:border-purple-500"
                />
                <Button
                  onClick={handleQuickFind}
                  disabled={searching}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {searching ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
  </Button>
              </div>

              {/* Search Hints */}
              {searchHints.locations && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                >
                  <p className="font-semibold text-sm text-purple-900 mb-2">💡 AI Suggestions:</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-medium text-purple-800">Check these locations:</p>
                      <ul className="list-disc list-inside text-gray-700 ml-2">
                        {searchHints.locations.map((loc, i) => (
                          <li key={i}>{loc}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-purple-800">Tips:</p>
                      <ul className="list-disc list-inside text-gray-700 ml-2">
                        {searchHints.tips?.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-purple-200"
              >
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold">AI Matching</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-cyan-200"
              >
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold">Community</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-orange-200"
              >
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold">Secure</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Mascot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="relative"
          >
            <div className="relative w-full max-w-md mx-auto">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20 rounded-full blur-3xl" />
              
              {/* Mascot Container */}
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-purple-200 shadow-2xl">
                <motion.div
                  className="text-center"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Cute Detective Character */}
                  <div className="relative inline-block mb-6">
                    <motion.div
                      className="text-9xl"
                      animate={{ rotate: [-5, 5, -5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      🕵️
                    </motion.div>
                    
                    {/* Magnifying glass */}
                    <motion.div
                      className="absolute -right-4 bottom-4 text-6xl animate-bounce-search"
                      animate={{ rotate: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🔍
                    </motion.div>
                    
                    {/* Sparkles */}
                    <motion.div
                      className="absolute -left-2 top-0 text-3xl"
                      animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 180, 360],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ✨
                    </motion.div>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Meet Findy!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Your AI-powered detective buddy who never gives up on finding your stuff! 🎯
                    </p>
                    
                    {/* Stats */}
                    <div className="flex justify-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-semibold">98% Found</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-purple-500 fill-purple-500" />
                        <span className="font-semibold">AI Powered</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Speech Bubble */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, type: "spring" }}
                  className="absolute -top-4 -left-4 bg-white rounded-2xl p-3 shadow-lg border-2 border-purple-300"
                >
                  <p className="text-sm font-medium">👋 Hey! Lost something?</p>
                  <div className="absolute bottom-0 left-8 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white transform translate-y-full" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Chatbot Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 flex items-center justify-center shadow-2xl glow-pulse"
        >
          <MessageCircle className="w-8 h-8 text-white" />
        </motion.button>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
        />
      </motion.div>
    </div>
  );
}