import React, { useState, useEffect } from "react";
import { base44 } from "@/api/firebaseClient";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function MatchesSection({ items, isLoading }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && items.length > 0) {
      findMatches();
    }
  }, [items, isLoading]);

  const findMatches = async () => {
    setLoading(true);
    try {
      const lostItems = items.filter(i => i.type === "lost" && i.status === "active" && i.image_url);
      const foundItems = items.filter(i => i.type === "found" && i.status === "active" && i.image_url);

      const matchPromises = [];
      
      // Compare each lost item with found items
      for (const lostItem of lostItems.slice(0, 10)) {
        for (const foundItem of foundItems.slice(0, 10)) {
          matchPromises.push(
            compareItems(lostItem, foundItem)
          );
        }
      }

      const results = await Promise.all(matchPromises);
      const validMatches = results
        .filter(m => m !== null && m.similarity_score > 65)
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, 20);

      setMatches(validMatches);
    } catch (error) {
      console.error("Error finding matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const compareItems = async (lostItem, foundItem) => {
    try {
      // Check if items are from the same category or nearby categories
      const sameCategory = lostItem.category === foundItem.category;
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Compare these two items: a LOST item and a FOUND item. Determine if they could be the same item. 

LOST ITEM:
- Title: ${lostItem.title}
- Description: ${lostItem.description || "No description"}
- Category: ${lostItem.category}
- Location: ${lostItem.location}
- Date: ${lostItem.date_reported}

FOUND ITEM:
- Title: ${foundItem.title}
- Description: ${foundItem.description || "No description"}
- Category: ${foundItem.category}
- Location: ${foundItem.location}
- Date: ${foundItem.date_reported}

Consider: visual similarity from images, descriptions, location proximity, timing, and category match. Return a similarity score (0-100) and brief reasoning.`,
        file_urls: [lostItem.image_url, foundItem.image_url],
        response_json_schema: {
          type: "object",
          properties: {
            similarity_score: { type: "number" },
            reasoning: { type: "string" }
          }
        }
      });

      if (result.similarity_score > 65) {
        return {
          lost_item: lostItem,
          found_item: foundItem,
          similarity_score: result.similarity_score,
          reasoning: result.reasoning
        };
      }
    } catch (error) {
      return null;
    }
    return null;
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16"
      >
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
        <h3 className="text-xl font-semibold mb-2">AI is Finding Matches...</h3>
        <p className="text-gray-600">Analyzing images and descriptions</p>
      </motion.div>
    );
  }

  if (matches.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
          <Sparkles className="w-12 h-12 text-purple-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Matches Found Yet</h3>
        <p className="text-gray-500">AI hasn't detected any strong matches between lost and found items</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6" />
          <h2 className="text-2xl font-bold">AI Detected {matches.length} Potential Matches</h2>
        </div>
        <p className="text-purple-100">
          These lost and found items have high similarity scores based on visual analysis and descriptions
        </p>
      </motion.div>

      {matches.map((match, index) => (
        <motion.div
          key={`${match.lost_item.id}-${match.found_item.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-400 transition-all overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-base px-4 py-1">
                  {match.similarity_score}% Match
                </Badge>
                <span className="text-sm text-gray-500">
                  AI Analysis
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Lost Item */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="destructive">Lost</Badge>
                    <span className="text-xs text-gray-500">
                      {format(new Date(match.lost_item.date_reported), "MMM d, yyyy")}
                    </span>
                  </div>
                  
                  <Link to={`${createPageUrl("ItemDetail")}?id=${match.lost_item.id}`}>
                    <div className="relative h-48 rounded-lg overflow-hidden bg-gradient-to-br from-red-100 to-red-200 group cursor-pointer">
                      <img
                        src={match.lost_item.image_url}
                        alt={match.lost_item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                  </Link>

                  <div>
                    <h3 className="font-bold text-lg mb-1">{match.lost_item.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {match.lost_item.description}
                    </p>
                    <p className="text-xs text-gray-500">📍 {match.lost_item.location}</p>
                  </div>

                  <Link to={`${createPageUrl("ItemDetail")}?id=${match.lost_item.id}`}>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                {/* Found Item */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-500">Found</Badge>
                    <span className="text-xs text-gray-500">
                      {format(new Date(match.found_item.date_reported), "MMM d, yyyy")}
                    </span>
                  </div>
                  
                  <Link to={`${createPageUrl("ItemDetail")}?id=${match.found_item.id}`}>
                    <div className="relative h-48 rounded-lg overflow-hidden bg-gradient-to-br from-green-100 to-green-200 group cursor-pointer">
                      <img
                        src={match.found_item.image_url}
                        alt={match.found_item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                  </Link>

                  <div>
                    <h3 className="font-bold text-lg mb-1">{match.found_item.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {match.found_item.description}
                    </p>
                    <p className="text-xs text-gray-500">📍 {match.found_item.location}</p>
                  </div>

                  <Link to={`${createPageUrl("ItemDetail")}?id=${match.found_item.id}`}>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Reasoning */}
              <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-purple-900 mb-1">AI Analysis:</p>
                    <p className="text-sm text-purple-800">{match.reasoning}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}