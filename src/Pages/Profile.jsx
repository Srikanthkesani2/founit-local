import React, { useState } from "react";
import { base44 } from "@/api/firebaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { User, Mail, Save, Package, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: items = [] } = useQuery({
    queryKey: ['userItems', user?.email],
    queryFn: async () => {
      return base44.entities.Item.filter({ created_by: user.email });
    },
    enabled: !!user
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['userMessages', user?.email],
    queryFn: async () => {
      return base44.entities.Message.filter({ to_user_email: user.email });
    },
    enabled: !!user
  });

  const [formData, setFormData] = useState({
    full_name: user?.full_name || ""
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
      toast.success("Profile updated");
      setEditing(false);
    }
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="text-gray-600">Manage your account settings</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-purple-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <Package className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-3xl font-bold mb-1">{items.length}</p>
              <p className="text-sm opacity-90">Items Posted</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <MessageSquare className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-3xl font-bold mb-1">{messages.length}</p>
              <p className="text-sm opacity-90">Messages</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <User className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-3xl font-bold mb-1">{user?.role}</p>
              <p className="text-sm opacity-90">Account Type</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Profile Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Profile Information</CardTitle>
              {!editing && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData({ full_name: user.full_name });
                    setEditing(true);
                  }}
                >
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {editing ? (
                <Input
                  id="name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">{user?.full_name}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="font-medium">{user?.email}</span>
              </div>
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            {editing && (
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}