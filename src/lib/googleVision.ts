import { OCRResult } from '@/types/analysis';

export async function extractTextFromImage(imageBase64: string): Promise<OCRResult> {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;

  if (!apiKey) {
    throw new Error('Google Cloud Vision API key is not configured');
  }

  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 1,
                },
              ],
              imageContext: {
                languageHints: ['ko', 'en'],
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Google Vision API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const detections = data.responses[0];

    if (!detections || !detections.textAnnotations || detections.textAnnotations.length === 0) {
      return {
        text: '',
        detectedIngredients: [],
      };
    }

    const fullText = detections.textAnnotations[0].description || '';

    // Extract potential ingredient names
    const lines = fullText.split('\n').map((line: string) => line.trim()).filter((line: string) => line.length > 0);

    // 쉼표로 구분된 성분들을 개별적으로 분리
    const ingredients: string[] = [];
    for (const line of lines) {
      // 쉼표로 분리
      const parts = line.split(/[,，]/).map((p: string) => p.trim()).filter((p: string) => p.length > 0);
      ingredients.push(...parts);
    }

    return {
      text: fullText,
      detectedIngredients: ingredients,
    };
  } catch (error) {
    console.error('Google Vision API error:', error);
    throw error;
  }
}
