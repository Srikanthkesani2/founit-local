import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/firebaseClient";
import { Search, Plus, Home, MessageSquare, User, LogOut, Package, Menu, X, Shield, Zap } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import ChatbotWidget from "./Components/shared/ChatbotWidget";

export default function Layout({ children }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadUser();
  }, [location]);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      loadUnreadCount(currentUser);
    } catch (error) {
      console.log("Not authenticated");
    }
  };

  const loadUnreadCount = async (currentUser) => {
    if (!currentUser) return;
    try {
      const messages = await base44.entities.Message.filter({ 
        to_user_email: currentUser.email, 
        read: false 
      });
      setUnreadCount(messages.length);
    } catch (error) {
      console.log("Error loading messages");
    }
  };

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
    } catch (error) {
      window.location.reload();
    }
  };

  const isAdmin = user?.role === "admin";

  const navItems = [
    { name: "Discover", icon: Home, path: createPageUrl("Browse") },
    { name: "Post Item", icon: Plus, path: createPageUrl("PostItem") },
    { name: "My Items", icon: Package, path: createPageUrl("MyItems") },
    { name: "Messages", icon: MessageSquare, path: createPageUrl("Messages"), badge: unreadCount },
    { name: "Profile", icon: User, path: createPageUrl("Profile") },
  ];

  if (isAdmin) {
    navItems.push({ name: "Admin Panel", icon: Shield, path: createPageUrl("AdminPanel") });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50">
      <style>{`
        :root {
          --primary: 168 85% 65%;
          --primary-foreground: 0 0% 100%;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.3); }
          50% { box-shadow: 0 0 30px rgba(168, 85, 247, 0.6); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-purple-200/50 shadow-lg shadow-purple-500/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center shadow-lg glow"
              >
                <Zap className="w-6 h-6 text-white" fill="currentColor" />
              </motion.div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
                  FindIt
                </span>
                {isAdmin && (
                  <Badge className="ml-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 text-xs px-2 py-0">
                    <Shield className="w-2 h-2 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.name} to={item.path}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={`gap-2 relative overflow-hidden ${
                          isActive
                            ? "bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white shadow-lg shadow-purple-500/50"
                            : "hover:bg-purple-50 hover:text-purple-700"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                        {item.badge > 0 && (
                          <Badge variant="destructive" className="ml-1 px-1.5 min-w-[1.25rem] h-5 animate-pulse">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </motion.div>
                  </Link>
                );
              })}
              {user && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="gap-2 hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </motion.div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-purple-200/50 bg-white/95 backdrop-blur-xl"
            >
              <nav className="px-4 py-4 space-y-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start gap-3 ${
                          isActive
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                            : "hover:bg-purple-50"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                        {item.badge > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  );
                })}
                {user && (
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start gap-3 hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      {/* Chatbot Widget */}
      <ChatbotWidget />

      {/* Footer */}
      <footer className="relative z-10 bg-white/70 backdrop-blur-xl border-t border-purple-200/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © 2025 FindIt. Reuniting people with their belongings ✨
            </p>
            <div className="flex gap-4 text-sm">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text font-medium cursor-pointer"
              >
                Built with AI Magic 🪄
              </motion.span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}