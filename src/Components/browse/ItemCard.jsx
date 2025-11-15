import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { MapPin, Calendar, Award, Sparkles } from "lucide-react";
import { format } from "date-fns";

const categoryIcons = {
  electronics: "📱",
  personal_items: "👝",
  bags: "🎒",
  accessories: "👓",
  documents: "📄",
  keys: "🔑",
  clothing: "👕",
  books: "📚",
  other: "📦"
};

export default function ItemCard({ item, index }) {
  const isLost = item.type === "lost";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, type: "spring" }}
      whileHover={{ y: -12, scale: 1.02 }}
      className="group"
    >
      <Link to={`${createPageUrl("ItemDetail")}?id=${item.id}`}>
        <Card className="overflow-hidden h-full bg-white/80 backdrop-blur-sm border-2 border-cyan-200 hover:border-cyan-400 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/30 relative">
          {/* Glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-teal-500/0 to-cyan-500/0 group-hover:from-cyan-500/10 group-hover:via-teal-500/10 group-hover:to-cyan-500/10 transition-all duration-500" />
          
          {/* Image */}
          <div className="relative h-48 bg-gradient-to-br from-cyan-100 to-teal-100 overflow-hidden">
            {item.image_url ? (
              <motion.img
                whileHover={{ scale: 1.15 }}
                transition={{ duration: 0.6 }}
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-full h-full flex items-center justify-center text-6xl"
              >
                {categoryIcons[item.category] || "📦"}
              </motion.div>
            )}
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Type Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 + 0.2, type: "spring", stiffness: 200 }}
            >
              <Badge
                className={`absolute top-3 right-3 ${
                  isLost
                    ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
                    : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                } text-white border-0 shadow-lg`}
              >
                {isLost ? "Lost" : "Found"}
              </Badge>
            </motion.div>

            {/* Reward Badge */}
            {item.reward_offered && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.05 + 0.3, type: "spring" }}
              >
                <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 gap-1 shadow-lg">
                  <Award className="w-3 h-3" />
                  Reward
                </Badge>
              </motion.div>
            )}

            {/* Sparkle effect */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-3 right-3"
            >
              <Sparkles className="w-5 h-5 text-white drop-shadow-lg" />
            </motion.div>
          </div>

          <CardContent className="p-5 relative">
            {/* Title */}
            <motion.h3
              className="font-bold text-lg mb-2 line-clamp-1 bg-gradient-to-r from-cyan-700 to-teal-700 bg-clip-text text-transparent group-hover:from-cyan-600 group-hover:to-teal-600 transition-all"
            >
              {item.title}
            </motion.h3>

            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
              {item.description}
            </p>

            {/* Meta Info */}
            <div className="space-y-2">
              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center gap-2 text-xs text-gray-500"
              >
                <MapPin className="w-4 h-4 text-cyan-500" />
                <span className="line-clamp-1">{item.location}</span>
              </motion.div>
              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center gap-2 text-xs text-gray-500"
              >
                <Calendar className="w-4 h-4 text-teal-500" />
                <span>
                  {item.date_reported
                    ? format(new Date(item.date_reported), "MMM d, yyyy")
                    : "Date not specified"}
                </span>
              </motion.div>
            </div>

            {/* Category Badge */}
            <div className="mt-4">
              <Badge variant="outline" className="text-xs border-cyan-300 text-cyan-700 bg-cyan-50">
                {categoryIcons[item.category]} {item.category?.replace(/_/g, " ")}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}