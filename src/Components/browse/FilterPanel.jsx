import React from "react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Label } from "@/Components/ui/label";

const categories = [
  { value: "all", label: "All Categories" },
  { value: "electronics", label: "📱 Electronics" },
  { value: "personal_items", label: "👝 Personal Items" },
  { value: "bags", label: "🎒 Bags" },
  { value: "accessories", label: "👓 Accessories" },
  { value: "documents", label: "📄 Documents" },
  { value: "keys", label: "🔑 Keys" },
  { value: "clothing", label: "👕 Clothing" },
  { value: "books", label: "📚 Books" },
  { value: "other", label: "📦 Other" }
];

const statuses = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "claimed", label: "Claimed" },
  { value: "resolved", label: "Resolved" }
];

export default function FilterPanel({ categoryFilter, setCategoryFilter, statusFilter, setStatusFilter }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-200"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </motion.div>
  );
}