import React, { useState } from "react";
import { base44 } from "@/api/firebaseClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { Label } from "@/Components/ui/label";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ContactModal({ open, onClose, item, poster }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setSending(true);
    try {
      const user = await base44.auth.me();

      // Create message record
      await base44.entities.Message.create({
        from_user_email: user.email,
        from_user_name: user.full_name,
        to_user_email: poster.email,
        item_id: item.id,
        item_title: item.title,
        content: message
      });

      // Send email notification
      await base44.integrations.Core.SendEmail({
        to: poster.email,
        subject: `Message about "${item.title}"`,
        body: `You received a message about your ${item.type} item "${item.title}":\n\n${message}\n\nFrom: ${user.full_name} (${user.email})`
      });

      toast.success("Message sent successfully!");
      setMessage("");
      onClose();
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact Poster</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Sending to:</p>
            <p className="font-medium">{poster?.full_name}</p>
            <p className="text-sm text-gray-500">{poster?.email}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder="I think I found your item..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}