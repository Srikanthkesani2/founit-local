import React, { useState } from "react";
import { base44 } from "@/api/firebaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs";
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
import { Shield, Package, Users, Trash2, CheckCircle, XCircle, TrendingUp, Eye } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminPanel() {
  const [deleteId, setDeleteId] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['allItems'],
    queryFn: () => base44.entities.Item.list("-created_date")
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list()
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id) => base44.entities.Item.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['allItems']);
      toast.success("Item deleted");
      setDeleteId(null);
    }
  });

  const updateItemStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Item.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['allItems']);
      toast.success("Status updated");
    }
  });

  const handleDelete = (id, type) => {
    setDeleteId(id);
    setDeleteType(type);
  };

  const confirmDelete = () => {
    if (deleteId && deleteType === "item") {
      deleteItemMutation.mutate(deleteId);
    }
  };

  // Check if user is admin
  if (user && user.role !== "admin") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Shield className="w-24 h-24 mx-auto mb-6 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </motion.div>
      </div>
    );
  }

  const stats = {
    totalItems: items.length,
    lostItems: items.filter(i => i.type === "lost").length,
    foundItems: items.filter(i => i.type === "found").length,
    activeItems: items.filter(i => i.status === "active").length,
    totalUsers: users.length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-gray-600">Manage items and users</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white border-0">
            <CardContent className="p-6">
              <Package className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-3xl font-bold mb-1">{stats.totalItems}</p>
              <p className="text-sm opacity-90">Total Items</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-red-500 to-rose-500 text-white border-0">
            <CardContent className="p-6">
              <XCircle className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-3xl font-bold mb-1">{stats.lostItems}</p>
              <p className="text-sm opacity-90">Lost Items</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-emerald-500 to-green-500 text-white border-0">
            <CardContent className="p-6">
              <CheckCircle className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-3xl font-bold mb-1">{stats.foundItems}</p>
              <p className="text-sm opacity-90">Found Items</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white border-0">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-3xl font-bold mb-1">{stats.activeItems}</p>
              <p className="text-sm opacity-90">Active</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
            <CardContent className="p-6">
              <Users className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-3xl font-bold mb-1">{stats.totalUsers}</p>
              <p className="text-sm opacity-90">Users</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="items" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/80 backdrop-blur-sm border border-cyan-200">
          <TabsTrigger value="items" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
            Items Management
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
            Users
          </TabsTrigger>
        </TabsList>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-4">
          {itemsLoading ? (
            <div className="text-center py-8">Loading items...</div>
          ) : (
            items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-2 border-cyan-200 hover:border-cyan-400 transition-all">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-cyan-100 to-teal-100 overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-lg">{item.title}</h3>
                            <p className="text-sm text-gray-500">Posted by: {item.created_by}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={item.type === "lost" ? "bg-red-500" : "bg-green-500"}>
                              {item.type}
                            </Badge>
                            <Badge variant="outline">{item.status}</Badge>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <span>📍 {item.location}</span>
                          <span>•</span>
                          <span>{format(new Date(item.created_date), "MMM d, yyyy")}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Link to={`${createPageUrl("ItemDetail")}?id=${item.id}`}>
                            <Button size="sm" variant="outline" className="gap-1">
                              <Eye className="w-3 h-3" />
                              View
                            </Button>
                          </Link>
                          {item.status === "active" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateItemStatusMutation.mutate({ id: item.id, status: "resolved" })}
                              className="gap-1 border-green-300 text-green-700"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Mark Resolved
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateItemStatusMutation.mutate({ id: item.id, status: "active" })}
                              className="gap-1 border-blue-300 text-blue-700"
                            >
                              <XCircle className="w-3 h-3" />
                              Reactivate
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item.id, "item")}
                            className="gap-1 text-red-600 hover:bg-red-50"
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
            ))
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {usersLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {users.map((u, index) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                          {u.full_name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold">{u.full_name}</h3>
                          <p className="text-sm text-gray-500">{u.email}</p>
                        </div>
                        <Badge className={u.role === "admin" ? "bg-orange-500" : "bg-cyan-500"}>
                          {u.role}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteType === "item" ? "Item" : "User"}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}