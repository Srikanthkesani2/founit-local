import React, { useState } from "react";
import { base44 } from "@/api/firebaseClient";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Search, Filter, Sparkles, RefreshCw, Map, Grid3X3, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ItemCard from "../Components/browse/ItemCard";
import FilterPanel from "../Components/browse/FilterPanel";
import MatchesSection from "../Components/browse/MatchesSection";
import MapView from "../Components/browse/Mapview";

export default function Browse() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState("grid"); // 'grid', 'map', 'matches'

  const { data: items = [], isLoading, refetch } = useQuery({
    queryKey: ['items'],
    queryFn: () => base44.entities.Item.list("-created_date"),
  });

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .animate-blink {
          animation: blink 2s ease-in-out infinite;
        }
      `}</style>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-700 text-sm font-medium mb-4 animate-blink">
          <Sparkles className="w-4 h-4" />
          AI-Powered Smart Matching
        </div>
        <motion.h1
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent"
        >
          Discover Lost Items
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 max-w-2xl mx-auto"
        >
          Browse with interactive maps, AI matching, and real-time updates 🚀
        </motion.p>
      </motion.div>

      {/* View Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 space-y-4"
      >
        {/* View Toggle + Refresh */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Tabs value={view} onValueChange={setView} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-cyan-200">
              <TabsTrigger value="grid" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
                <Grid3X3 className="w-4 h-4" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="map" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
                <Map className="w-4 h-4" />
                Map
              </TabsTrigger>
              <TabsTrigger value="matches" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
                <Sparkles className="w-4 h-4" />
                AI Matches
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="gap-2 border-cyan-300 hover:bg-cyan-50 hover:border-cyan-400 w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </motion.div>
        </div>

        {/* Search and Filters (only for grid view) */}
        {view === "grid" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
                <Input
                  type="text"
                  placeholder="Search items, locations, descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-white/80 backdrop-blur-sm border-cyan-300 focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`gap-2 h-12 border-cyan-300 transition-all ${
                    showFilters 
                      ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-transparent" 
                      : "hover:bg-cyan-50"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              </motion.div>
            </div>

            <Tabs value={typeFilter} onValueChange={setTypeFilter} className="w-full mb-4">
              <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-cyan-200">
                <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
                  All Items
                </TabsTrigger>
                <TabsTrigger value="lost" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-500 data-[state=active]:text-white">
                  Lost
                </TabsTrigger>
                <TabsTrigger value="found" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500 data-[state=active]:text-white">
                  Found
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <AnimatePresence>
              {showFilters && (
                <FilterPanel
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {view === "matches" ? (
          <MatchesSection items={items} isLoading={isLoading} />
        ) : view === "map" ? (
          <MapView items={filteredItems} isLoading={isLoading} />
        ) : (
          <>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="h-80 bg-gradient-to-br from-cyan-100/50 to-teal-100/50 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-16"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center"
                >
                  <Search className="w-12 h-12 text-cyan-500" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No items found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredItems.map((item, index) => (
                  <ItemCard key={item.id} item={item} index={index} />
                ))}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Stats */}
      {!isLoading && filteredItems.length > 0 && view === "grid" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-700 text-sm font-medium">
            <Layers className="w-4 h-4" />
            Showing {filteredItems.length} of {items.length} items
          </div>
        </motion.div>
      )}
    </div>
  );
}