import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Sparkles, Loader2, ExternalLink } from "lucide-react";

export default function AIMatches({ matches, loading, itemType }) {
  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Finding Matches...
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Analyzing images with AI...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI-Powered Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-4">
            No similar {itemType === "lost" ? "found" : "lost"} items detected yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Possible Matches Found
          </CardTitle>
          <p className="text-sm text-gray-600">
            AI detected {matches.length} similar {itemType === "lost" ? "found" : "lost"} item{matches.length > 1 ? "s" : ""}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {matches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`${createPageUrl("ItemDetail")}?id=${match.id}`}>
                <Card className="hover:shadow-lg transition-all duration-300 border-purple-200 hover:border-purple-400 bg-white">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex-shrink-0 overflow-hidden">
                        {match.image_url ? (
                          <img
                            src={match.image_url}
                            alt={match.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            📦
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold line-clamp-1">{match.title}</h4>
                          <Badge className="bg-green-500 text-white flex-shrink-0">
                            {match.similarity_score}% Match
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {match.reasoning}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>📍 {match.location}</span>
                          <ExternalLink className="w-3 h-3 ml-auto" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}