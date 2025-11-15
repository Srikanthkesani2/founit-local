import React, { useState, useEffect } from "react";
import { base44 } from "@/api/firebaseClient";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Separator } from "@/Components/ui/separator";
import { MapPin, Calendar, User, MessageSquare, Award, ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import AIMatches from "../Components/itemdetail/AIMatches";
import ContactModal from "../Components/itemdetail/ContactModal";

export default function ItemDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('id');

  const [item, setItem] = useState(null);
  const [poster, setPoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const loadItem = async () => {
    try {
      const items = await base44.entities.Item.filter({ id: itemId });
      if (items.length > 0) {
        setItem(items[0]);
        
        // Load poster info
        const users = await base44.entities.User.filter({ email: items[0].created_by });
        if (users.length > 0) {
          setPoster(users[0]);
        }

        // Load AI matches
        findMatches(items[0]);
      }
    } catch (error) {
      toast.error("Failed to load item");
    } finally {
      setLoading(false);
    }
  };

  const findMatches = async (currentItem) => {
    setLoadingMatches(true);
    try {
      // Get opposite type items
      const oppositeType = currentItem.type === "lost" ? "found" : "lost";
      const allItems = await base44.entities.Item.filter({ 
        type: oppositeType,
        status: "active"
      });

      // Use AI to find similar items
      if (currentItem.image_url && allItems.length > 0) {
        const matchPromises = allItems.slice(0, 10).map(async (otherItem) => {
          if (!otherItem.image_url) return null;

          try {
            const result = await base44.integrations.Core.InvokeLLM({
              prompt: `Compare these two items and determine if they could be the same item. Consider: visual appearance, description, location proximity, and timing. Return a JSON with similarity_score (0-100) and reasoning.`,
              file_urls: [currentItem.image_url, otherItem.image_url],
              response_json_schema: {
                type: "object",
                properties: {
                  similarity_score: { type: "number" },
                  reasoning: { type: "string" }
                }
              }
            });

            if (result.similarity_score > 60) {
              return {
                ...otherItem,
                similarity_score: result.similarity_score,
                reasoning: result.reasoning
              };
            }
          } catch (error) {
            return null;
          }
          return null;
        });

        const matchResults = await Promise.all(matchPromises);
        const validMatches = matchResults
          .filter(m => m !== null)
          .sort((a, b) => b.similarity_score - a.similarity_score)
          .slice(0, 5);

        setMatches(validMatches);
      }
    } catch (error) {
      console.error("Error finding matches:", error);
    } finally {
      setLoadingMatches(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Item not found</p>
      </div>
    );
  }

  const isLost = item.type === "lost";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate(createPageUrl("Browse"))}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Browse
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-purple-200">
              <div className="relative h-96 bg-gradient-to-br from-purple-100 to-blue-100">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">
                    📦
                  </div>
                )}
                <Badge
                  className={`absolute top-4 right-4 ${
                    isLost
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  } text-white border-0 text-lg px-4 py-2`}
                >
                  {isLost ? "Lost" : "Found"}
                </Badge>
                {item.reward_offered && (
                  <Badge className="absolute top-4 left-4 bg-amber-500 hover:bg-amber-600 text-white border-0 gap-2 text-lg px-4 py-2">
                    <Award className="w-5 h-5" />
                    Reward Offered
                  </Badge>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl mb-2">{item.title}</CardTitle>
                    <Badge variant="outline" className="text-sm">
                      {item.category?.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{item.description || "No description provided"}</p>
                </div>

                <Separator />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{item.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">
                        {format(new Date(item.date_reported), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Matches */}
          <AIMatches matches={matches} loading={loadingMatches} itemType={item.type} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Poster Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg">Posted By</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">{poster?.full_name || "User"}</p>
                    <p className="text-sm text-gray-500">{poster?.email}</p>
                  </div>
                </div>
                
                {item.contact_info && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Contact</p>
                    <p className="font-medium">{item.contact_info}</p>
                  </div>
                )}

                <Button
                  onClick={() => setShowContactModal(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Contact Poster
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  variant={item.status === "active" ? "default" : "secondary"}
                  className="text-sm"
                >
                  {item.status}
                </Badge>
                <p className="text-sm text-gray-600 mt-3">
                  Posted {format(new Date(item.created_date), "PPP")}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <ContactModal
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
        item={item}
        poster={poster}
      />
    </div>
  );
}