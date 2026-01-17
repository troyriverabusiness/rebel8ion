import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function WebhookTestButton() {
  const [isLoading, setIsLoading] = useState(false);

  const sendTestWebhook = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/v1/webhook/make", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: "manual_test",
          data: {
            message: "Test webhook triggered from UI",
            timestamp: new Date().toISOString(),
            random_value: Math.random().toString(36).substring(7),
          },
          source: "client_ui",
        }),
      });

      if (response.ok) {
        // The toast will appear automatically via SSE
        console.log("Test webhook sent successfully");
      } else {
        toast.error("Failed to send test webhook");
      }
    } catch (error) {
      toast.error("Error sending webhook", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={sendTestWebhook}
      disabled={isLoading}
      variant="outline"
      size="sm"
    >
      {isLoading ? "Sending..." : "🔔 Test Webhook Toast"}
    </Button>
  );
}
