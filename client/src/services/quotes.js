import { HttpService } from "./http";

class QuotesHttpService extends HttpService {
  async getRows({ quoteId }) {
    try {
      const params = new URLSearchParams();
      params.append("quoteId", quoteId);

      const response = await this.get(`/quote-comparison?${params}`);
      return response;
    } catch (error) {
      console.error("Error fetching quotes:", error);
    }
  }
}

export const quotesHttpService = new QuotesHttpService("http://localhost:3001");
