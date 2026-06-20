import { api } from "./api";

export interface QaQuestion {
  id: string;
  product_id: string;
  user_id: string;
  body: string;
  status: "pending_review" | "approved" | "rejected" | "hidden";
  created_at: string;
  users?: { full_name: string };
  answers?: QaAnswer[];
}

export interface QaAnswer {
  id: string;
  question_id: string;
  user_id: string;
  body: string;
  is_seller: boolean;
  is_verified_buyer?: boolean;
  status: "pending_review" | "approved" | "rejected" | "hidden";
  helpful_count: number;
  created_at: string;
  users?: { full_name: string };
}

export const qaApi = {
  // Public / Customer
  getQuestions: async (productId: string) => {
    return api.get<{ data: QaQuestion[] }>(`/api/products/${productId}/questions`);
  },

  askQuestion: async (productId: string, question_text: string) => {
    return api.post<QaQuestion>(`/api/products/${productId}/questions`, { body: question_text });
  },

  answerQuestion: async (questionId: string, answer_text: string) => {
    return api.post<QaAnswer>(`/api/products/questions/${questionId}/answers`, { body: answer_text });
  },

  markHelpful: async (answerId: string) => {
    return api.post(`/api/products/answers/${answerId}/helpful`, {});
  },

  // Admin
  adminGetQa: async () => {
    const qData = await api.get<{ data: any[] }>("/api/admin/qa?type=questions");
    const aData = await api.get<{ data: any[] }>("/api/admin/qa?type=answers");
    const combined = [...(qData.data || []), ...(aData.data || [])].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return { data: combined };
  },

  adminModerateQa: async (type: "questions" | "answers", id: string, status: "approved" | "rejected" | "hidden") => {
    return api.patch(`/api/admin/qa/${type}/${id}`, { status });
  },
};
