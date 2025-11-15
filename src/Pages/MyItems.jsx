import React, { useState } from "react";
import { base44 } from "@/api/firebaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import { Package, Trash2, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function MyItems() {
  const [filter, setFilter] = useState("all");
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['myItems'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Item.filter({ created_by: user.email }, "-created_date");
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Item.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['myItems']);
      toast.success("Status updated");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Item.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['myItems']);
      toast.success("Item deleted");
      setDeleteId(null);
    }
  });

  const filteredItems = items.filter(item => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          My Items
        </h1>
        <p className="text-gray-600">Manage your posted items</p>
      </motion.div>

      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="lost">Lost</TabsTrigger>
          <TabsTrigger value="found">Found</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-white/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
            <Package className="w-12 h-12 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No items yet</h3>
          <p className="text-gray-500 mb-6">Start by posting a lost or found item</p>
          <Link to={createPageUrl("PostItem")}>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
              Post an Item
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-2 hover:border-purple-300 transition-all">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Image */}
                    <Link to={`${createPageUrl("ItemDetail")}?id=${item.id}`} className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">
                            📦
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Link to={`${createPageUrl("ItemDetail")}?id=${item.id}`}>
                          <h3 className="font-bold line-clamp-1 hover:text-purple-600">
                            {item.title}
                          </h3>
                        </Link>
                        <Badge
                          variant={item.type === "lost" ? "destructive" : "default"}
                          className={`flex-shrink-0 ${item.type === "found" ? "bg-green-500" : ""}`}
                        >
                          {item.type}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <span>📍 {item.location}</span>
                        <span>•</span>
                        <span>{format(new Date(item.created_date), "MMM d")}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {item.status}
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {item.status === "active" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatusMutation.mutate({ id: item.id, status: "resolved" })}
                            className="gap-1 border-green-300 text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Mark Resolved
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatusMutation.mutate({ id: item.id, status: "active" })}
                            className="gap-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            <XCircle className="w-3 h-3" />
                            Reactivate
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}