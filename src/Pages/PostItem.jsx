import React, { useState } from "react";
import { base44 } from "@/api/firebaseClient";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Label } from "@/Components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Checkbox } from "@/Components/ui/checkbox";
import { Upload, Sparkles, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function PostItem() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "lost",
    location: "",
    date_reported: new Date().toISOString().split('T')[0],
    contact_info: "",
    category: "other",
    reward_offered: false
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setAnalyzing(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile(file_url);

      // AI Analysis
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this image and provide a detailed description of the item shown. Include: color, brand (if visible), distinguishing features, condition, and any text/labels visible. Be specific and concise.`,
        file_urls: [file_url]
      });

      // Auto-fill description
      setFormData(prev => ({
        ...prev,
        description: prev.description || analysis
      }));

      toast.success("Image analyzed with AI!");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await base44.auth.me();
      
      await base44.entities.Item.create({
        ...formData,
        image_url: uploadedFile,
        ai_description: analyzing ? null : formData.description
      });

      toast.success("Item posted successfully!");
      navigate(createPageUrl("Browse"));
    } catch (error) {
      toast.error("Failed to post item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Post an Item
          </h1>
          <p className="text-gray-600">
            Upload details and let AI help match it with the community
          </p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Item Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Photo</Label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload image</p>
                      </div>
                    )}
                  </label>
                  {analyzing && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-purple-600 font-medium">AI Analyzing...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="found">Found</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Black iPhone 13 Pro"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of the item..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="resize-none"
                />
                {analyzing && (
                  <p className="text-xs text-purple-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI is generating a description...
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">📱 Electronics</SelectItem>
                    <SelectItem value="personal_items">👝 Personal Items</SelectItem>
                    <SelectItem value="bags">🎒 Bags</SelectItem>
                    <SelectItem value="accessories">👓 Accessories</SelectItem>
                    <SelectItem value="documents">📄 Documents</SelectItem>
                    <SelectItem value="keys">🔑 Keys</SelectItem>
                    <SelectItem value="clothing">👕 Clothing</SelectItem>
                    <SelectItem value="books">📚 Books</SelectItem>
                    <SelectItem value="other">📦 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Library 2nd Floor, Main Campus"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date_reported}
                  onChange={(e) => setFormData({...formData, date_reported: e.target.value})}
                  required
                />
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Info</Label>
                <Input
                  id="contact"
                  placeholder="Email or phone number"
                  value={formData.contact_info}
                  onChange={(e) => setFormData({...formData, contact_info: e.target.value})}
                />
              </div>

              {/* Reward */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reward"
                  checked={formData.reward_offered}
                  onCheckedChange={(checked) => setFormData({...formData, reward_offered: checked})}
                />
                <Label htmlFor="reward" className="cursor-pointer">
                  Reward offered for this item
                </Label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading || analyzing}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Post Item
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}