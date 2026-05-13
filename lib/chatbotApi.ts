import { api, getAuthHeaders } from "./api";

let API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Proxy localhost requests through Next.js on the client to avoid CORS issues
if (typeof window !== "undefined" && API_URL.includes("localhost")) {
  API_URL = "";
}

export interface ChatSession {
  id: string;
  surface: 'customer' | 'seller';
  ended_at: string | null;
  escalated_ticket_id: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool' | 'system' | 'error';
  content: string;
  tool_name?: string;
  tool_input?: any;
  tool_output?: any;
  created_at: string;
}

export type ChatbotEvent =
  | { type: 'text'; delta: string }
  | { type: 'tool_call'; toolCall: { name: string; args: any; requiresConfirmation?: boolean } }
  | { type: 'tool_result'; toolResult: { name: string; status: string; output?: any; error?: string } }
  | { type: 'final'; final: { assistantMessageId: string; text: string } }
  | { type: 'error'; error: string };

export const chatbotApi = {
  async createSession(surface: 'customer' | 'seller'): Promise<ChatSession> {
    const res = await api.post<{ session: ChatSession }>("/api/chatbot/sessions", { surface });
    return res.session;
  },

  async getSession(id: string): Promise<{ session: ChatSession; messages: ChatMessage[] }> {
    return api.get<{ session: ChatSession; messages: ChatMessage[] }>(`/api/chatbot/sessions/${id}`);
  },

  async escalateSession(id: string): Promise<{ ticket_id: string }> {
    return api.post<{ ticket_id: string }>(`/api/chatbot/sessions/${id}/escalate`);
  },

  async sendFeedback(id: string, helpful: boolean, comment?: string): Promise<void> {
    await api.post(`/api/chatbot/messages/${id}/feedback`, { helpful, comment });
  },

  /**
   * Streams a message to the chatbot backend using SSE
   */
  async streamMessage(
    sessionId: string,
    message: string,
    onEvent: (event: ChatbotEvent) => void,
    onClose: () => void,
    onError: (err: any) => void
  ) {
    const headers = await getAuthHeaders();
    
    // We use fetch instead of EventSource because EventSource doesn't support POST bodies
    try {
      const response = await fetch(`${API_URL}/api/chatbot/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`Failed to stream message: ${response.statusText}`);
      }

      await parseSSE(response, onEvent);
      onClose();
    } catch (err) {
      onError(err);
    }
  },

  /**
   * Confirms a proposed action using SSE to receive the followup
   */
  async confirmAction(
    sessionId: string,
    toolName: string,
    args: any,
    onEvent: (event: ChatbotEvent) => void,
    onClose: () => void,
    onError: (err: any) => void
  ) {
    const headers = await getAuthHeaders();
    try {
      const response = await fetch(`${API_URL}/api/chatbot/sessions/${sessionId}/actions/${toolName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(args),
      });

      if (!response.ok) {
        throw new Error(`Failed to confirm action: ${response.statusText}`);
      }

      await parseSSE(response, onEvent);
      onClose();
    } catch (err) {
      onError(err);
    }
  }
};

/**
 * Helper to parse Server-Sent Events stream from a fetch response
 */
async function parseSSE(response: Response, onEvent: (event: ChatbotEvent) => void) {
  if (!response.body) return;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep the last incomplete line

    let currentEventName = '';

    for (const line of lines) {
      if (line.trim() === '') continue;
      
      // Handle fastify proxy keepalive or plain keepalive
      if (line === ':keepalive') continue;

      if (line.startsWith('event: ')) {
        currentEventName = line.substring(7).trim();
      } else if (line.startsWith('data: ')) {
        const dataStr = line.substring(6).trim();
        try {
          const dataObj = JSON.parse(dataStr);
          if (currentEventName) {
            onEvent({ type: currentEventName as any, ...dataObj });
          }
        } catch (e) {
          console.error("Failed to parse SSE data", dataStr, e);
        }
      }
    }
  }
}
