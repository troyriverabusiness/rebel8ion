// ABOUTME: API utility functions with ngrok header support.
// ABOUTME: Provides fetch wrapper and SSE handler that bypass ngrok's interstitial page.

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Default headers for all API requests.
 * Includes ngrok-skip-browser-warning to bypass ngrok's interstitial page.
 */
const defaultHeaders: HeadersInit = {
  "ngrok-skip-browser-warning": "true",
};

/**
 * Fetch wrapper that automatically adds ngrok bypass header.
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  return fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
}

/**
 * Callback type for SSE message events.
 */
export type SSEMessageCallback = (data: unknown) => void;

/**
 * Callback type for SSE error events.
 */
export type SSEErrorCallback = (error: Error) => void;

/**
 * Options for SSE connection.
 */
export interface SSEOptions {
  onMessage: SSEMessageCallback;
  onError?: SSEErrorCallback;
  onOpen?: () => void;
  reconnectDelay?: number;
}

/**
 * Create a fetch-based SSE connection that supports custom headers.
 * Returns an abort function to close the connection.
 */
export function createSSEConnection(
  endpoint: string,
  options: SSEOptions
): () => void {
  const { onMessage, onError, onOpen, reconnectDelay = 3000 } = options;
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  let abortController = new AbortController();
  let isAborted = false;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  const connect = async () => {
    if (isAborted) return;

    try {
      const response = await fetch(url, {
        headers: {
          ...defaultHeaders,
          "Accept": "text/event-stream",
        },
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`SSE connection failed: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("SSE response has no body");
      }

      onOpen?.();

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (!isAborted) {
        const { done, value } = await reader.read();

        if (done) {
          // Connection closed, attempt reconnect
          if (!isAborted) {
            console.log("SSE connection closed, reconnecting...");
            reconnectTimeout = setTimeout(connect, reconnectDelay);
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            try {
              const data = JSON.parse(dataStr);
              onMessage(data);
            } catch {
              // Not JSON, pass as string
              onMessage(dataStr);
            }
          }
        }
      }
    } catch (error) {
      if (isAborted) return;

      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      console.error("SSE connection error:", error);
      onError?.(error instanceof Error ? error : new Error(String(error)));

      // Attempt reconnect
      if (!isAborted) {
        reconnectTimeout = setTimeout(connect, reconnectDelay);
      }
    }
  };

  // Start connection
  connect();

  // Return abort function
  return () => {
    isAborted = true;
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
    abortController.abort();
  };
}
