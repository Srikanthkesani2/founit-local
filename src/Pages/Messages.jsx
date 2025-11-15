import React, { useState } from "react";
import { base44 } from "@/api/firebaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { MessageSquare, Inbox, Send } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Messages() {  
  const [tab, setTab] = useState("received");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: receivedMessages = [], isLoading: loadingReceived } = useQuery({
    queryKey: ['receivedMessages', user?.email],
    queryFn: () => base44.entities.Message.filter({ to_user_email: user.email }, "-created_date"),
    enabled: !!user
  });

  const { data: sentMessages = [], isLoading: loadingSent } = useQuery({
    queryKey: ['sentMessages', user?.email],
    queryFn: () => base44.entities.Message.filter({ from_user_email: user.email }, "-created_date"),
    enabled: !!user
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Message.update(id, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['receivedMessages']);
    }
  });

  const messages = tab === "received" ? receivedMessages : sentMessages;
  const isLoading = tab === "received" ? loadingReceived : loadingSent;
  const unreadCount = receivedMessages.filter(m => !m.read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Messages
            </h1>
            <p className="text-gray-600">Your conversations</p>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-red-500">
              {unreadCount} unread
            </Badge>
          )}
        </div>
      </motion.div>

      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="received" className="gap-2">
            <Inbox className="w-4 h-4" />
            Received
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            <Send className="w-4 h-4" />
            Sent
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-white/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
            <MessageSquare className="w-12 h-12 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No messages</h3>
          <p className="text-gray-500">
            {tab === "received" ? "You haven't received any messages yet" : "You haven't sent any messages yet"}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`bg-white/80 backdrop-blur-sm border-2 hover:border-purple-300 transition-all cursor-pointer ${
                  !message.read && tab === "received" ? "border-purple-400 bg-purple-50/50" : ""
                }`}
                onClick={() => {
                  if (!message.read && tab === "received") {
                    markReadMutation.mutate(message.id);
                  }
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">
                          {tab === "received" ? message.from_user_name : `To: ${message.to_user_email}`}
                        </p>
                        {!message.read && tab === "received" && (
                          <Badge className="bg-purple-500">New</Badge>
                        )}
                      </div>
                      <Link to={`${createPageUrl("ItemDetail")}?id=${message.item_id}`}>
                        <p className="text-sm text-purple-600 hover:underline">
                          Re: {message.item_title}
                        </p>
                      </Link>
                    </div>
                    <p className="text-xs text-gray-500 flex-shrink-0">
                      {format(new Date(message.created_date), "MMM d, h:mm a")}
                    </p>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{message.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}