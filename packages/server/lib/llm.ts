import type { LLMModel } from '@shared/db/types';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface LLMRequest {
  prompt: string;
  model?: LLMModel;
}

interface LLMResponse {
  response: string;
  model: LLMModel;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

function mapToOpenAIModel(model: LLMModel): string {
  const modelMap: Record<LLMModel, string> = {
    GPT_4O: 'gpt-4o',
    GPT_4O_MINI: 'gpt-4o-mini',
    CLAUDE_3_5_SONNET: 'gpt-4o', // Fallback to GPT-4o for now
    GEMINI_PRO: 'gpt-4o', // Fallback to GPT-4o for now
  };

  return modelMap[model] || 'gpt-4o';
}

export const llm = {
  async generateEvaluationResponse({
    prompt,
    model = 'GPT_4O',
  }: LLMRequest): Promise<LLMResponse> {
    try {
      console.info('🤖 Sending prompt to LLM...', {
        model,
        promptLength: prompt.length,
      });

      const openaiModel = mapToOpenAIModel(model);

      const completion = await openai.chat.completions.create({
        model: openaiModel,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || '';
      const usage = completion.usage;

      console.info('✅ LLM response received', {
        model: openaiModel,
        responseLength: response.length,
        tokens: usage,
      });

      return {
        response,
        model,
        promptTokens: usage?.prompt_tokens,
        completionTokens: usage?.completion_tokens,
        totalTokens: usage?.total_tokens,
      };
    } catch (error) {
      console.error('❌ LLM request failed:', error);
      throw new Error(
        `LLM request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
};

export type { LLMRequest, LLMResponse };
