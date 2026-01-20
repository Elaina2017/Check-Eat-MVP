import OpenAI from 'openai';
import { PackagingAnalysisResult } from '@/types/analysis';

export async function analyzePackaging(imageBase64: string): Promise<PackagingAnalysisResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '이 제품의 포장재 타입을 분석해주세요. 캔(Can), 플라스틱(Plastic), 종이(Paper) 중 하나를 선택하고, 확신 정도를 0-1 사이의 숫자로 표현해주세요. JSON 형식으로만 답변해주세요: {"type": "Can|Plastic|Paper", "confidence": 0.95}',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64,
                detail: 'low',
              },
            },
          ],
        },
      ],
      max_tokens: 100,
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';

    try {
      const result = JSON.parse(content);

      if (!result.type || !['Can', 'Plastic', 'Paper'].includes(result.type)) {
        return {
          type: 'Unknown',
          confidence: 0,
        };
      }

      return {
        type: result.type,
        confidence: result.confidence || 0.5,
      };
    } catch (parseError) {
      console.error('Failed to parse GPT-4 response:', content);
      return {
        type: 'Unknown',
        confidence: 0,
      };
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}
