import { api } from "./api";

export interface QaQuestion {
  id: string;
  product_id: string;
  user_id: string;
  question_text: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  users?: { full_name: string };
  answers?: QaAnswer[];
}

export interface QaAnswer {
  id: string;
  question_id: string;
  user_id: string;
  answer_text: string;
  is_seller: boolean;
  status: "pending" | "approved" | "rejected";
  helpful_votes: number;
  created_at: string;
  users?: { full_name: string };
}

export const qaApi = {
  // Public / Customer
  getQuestions: async (productId: string) => {
    return api.get<{ questions: QaQuestion[] }>(`/api/products/${productId}/questions`);
  },

  askQuestion: async (productId: string, question_text: string) => {
    return api.post<{ question: QaQuestion }>(`/api/products/${productId}/questions`, { question_text });
  },

  answerQuestion: async (questionId: string, answer_text: string) => {
    return api.post<{ answer: QaAnswer }>(`/api/products/questions/${questionId}/answers`, { answer_text });
  },

  markHelpful: async (answerId: string) => {
    return api.post(`/api/products/answers/${answerId}/helpful`, {});
  },

  // Admin
  adminGetQa: async () => {
    return api.get<{ items: any[] }>("/api/admin/qa");
  },

  adminModerateQa: async (type: "question" | "answer", id: string, status: "approved" | "rejected" | "hidden") => {
    return api.patch(`/api/admin/qa/${type}/${id}`, { status });
  },
};
