import type { Partner, Product } from '../generated/prisma';

interface EvaluationPromptContext {
  objective: {
    title: string;
    question: string;
  };
  partner: Partner;
  product: Product;
}

export const promptService = {
  generateEvaluationPrompt: (context: EvaluationPromptContext): string => {
    let prompt = `You are an AI assistant helping a business intelligence service evaluate market positioning for B2B clients.

BUSINESS CONTEXT:
Our client "${context.partner.name}" is using our evaluation service to understand their market position. They have configured this objective as part of their ongoing market intelligence strategy.

CLIENT INFORMATION:
- Company: ${context.partner.name}${context.partner.industry ? ` (${context.partner.industry})` : ''}
- Product/Service Being Evaluated: ${context.product.name}${context.product.description ? ` - ${context.product.description}` : ''}
- Location: ${context.product.city || context.partner.city || ''}, ${context.product.country || context.partner.country}
${context.product.price ? `- Price Point: ${context.product.price} ${context.product.currency}` : ''}

EVALUATION OBJECTIVE:
Title: ${context.objective.title}
Question: ${context.objective.question}

TASK:
Respond to the evaluation question as if you were providing information to a potential customer inquiring about this topic. Your response should reflect what a real person asking this question would typically receive, helping our client understand:

1. How their product/service would be positioned in your response
2. Whether they would be mentioned or recommended
3. Their likely ranking or visibility in the market
4. Competitive landscape insights
5. Key factors that influence recommendations in this space

RESPONSE FORMAT:
You must respond with a valid JSON object containing the following fields:

{
  "evaluation": "Your comprehensive response answering the evaluation question naturally, as you would for a real customer inquiry. Include rankings, comparisons, and specific recommendations.",
  "mentionFound": true or false - whether the client's company/product was mentioned in your evaluation,
  "ranking": 3 or null - if you ranked them, their position (1st, 2nd, 3rd, etc.), null if not applicable,
  "totalCompetitors": 15 or null - total number of businesses/options you mentioned in your evaluation,
  "recommendationLikelihood": 85 - percentage from 0-100 representing likelihood you would recommend this client,
  "competitiveStrengths": ["Unique design", "Great location", "Excellent service"] - up to 5 key competitive advantages,
  "competitiveWeaknesses": ["Higher prices", "Limited locations"] - up to 3 main areas where they could improve,
  "marketPosition": "premium leader" - description like "market leader", "premium specialist", "emerging challenger", "niche player",
  "keyDifferentiators": ["Balinese architecture", "Holistic approach"] - what makes them unique vs competitors,
  "overallScore": 8.5 - score from 0-10 representing their market strength and recommendation worthiness
}

IMPORTANT: Respond with ONLY the raw JSON object. Do not wrap it in markdown code blocks or add any explanatory text. Start your response directly with { and end with }. No backticks, no additional formatting.`;

    return prompt;
  },

  analyzeResponse: (
    response: string,
    partnerName?: string
  ): {
    mentionFound: boolean;
    score?: number;
    ranking?: number;
    totalCompetitors?: number;
    recommendationLikelihood?: number;
    competitiveStrengths?: string[];
    competitiveWeaknesses?: string[];
    marketPosition?: string;
    keyDifferentiators?: string[];
    evaluation?: string;
  } => {
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanResponse = response.trim();

      // Remove markdown JSON code blocks
      if (
        cleanResponse.startsWith('```json') &&
        cleanResponse.endsWith('```')
      ) {
        cleanResponse = cleanResponse.slice(7, -3).trim();
      } else if (
        cleanResponse.startsWith('```') &&
        cleanResponse.endsWith('```')
      ) {
        cleanResponse = cleanResponse.slice(3, -3).trim();
      }

      // Try to parse as JSON
      const parsed = JSON.parse(cleanResponse);

      return {
        mentionFound: parsed.mentionFound || false,
        score: parsed.overallScore || undefined,
        ranking: parsed.ranking || undefined,
        totalCompetitors: parsed.totalCompetitors || undefined,
        recommendationLikelihood: parsed.recommendationLikelihood || undefined,
        competitiveStrengths: parsed.competitiveStrengths || [],
        competitiveWeaknesses: parsed.competitiveWeaknesses || [],
        marketPosition: parsed.marketPosition || undefined,
        keyDifferentiators: parsed.keyDifferentiators || [],
        evaluation: parsed.evaluation || undefined,
      };
    } catch (error) {
      // Fallback to text parsing for backwards compatibility
      console.warn(
        'Failed to parse JSON response, falling back to text parsing:',
        error
      );

      const mentionFound = partnerName
        ? response.toLowerCase().includes(partnerName.toLowerCase())
        : false;

      let score: number | undefined;
      const scorePattern = /score:\s*(\d+(?:\.\d+)?)\s*\/?\s*10?/i;
      const match = response.match(scorePattern);

      if (match && match[1]) {
        const extractedScore = parseFloat(match[1]);
        if (extractedScore >= 0 && extractedScore <= 10) {
          score = extractedScore;
        }
      }

      return {
        mentionFound,
        score,
        evaluation: response,
      };
    }
  },
};
