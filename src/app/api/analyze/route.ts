import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { getDB } from '@/lib/db';
import { extractTextFromImage } from '@/lib/googleVision';
import { analyzePackaging } from '@/lib/openai';
import { matchIngredients } from '@/lib/ingredientMatcher';
import { calculateIngredientScore } from '@/lib/scoreCalculator';
import { AnalysisResponse } from '@/types/analysis';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Resize image to reduce API costs (max 1280px, quality 0.82)
    const resizedBuffer = await sharp(buffer)
      .resize(1280, 1280, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer();

    // Convert to base64
    const base64Image = `data:image/jpeg;base64,${resizedBuffer.toString('base64')}`;

    // Load DB
    const db = getDB();

    // Run OCR and packaging analysis in parallel
    const [ocrResult, packagingResult] = await Promise.all([
      extractTextFromImage(base64Image),
      analyzePackaging(base64Image),
    ]);

    // 디버깅: OCR 결과 로그
    console.log('=== OCR 결과 ===');
    console.log('전체 텍스트 길이:', ocrResult.text.length);
    console.log('감지된 성분 개수:', ocrResult.detectedIngredients.length);
    console.log('감지된 성분 샘플 (처음 10개):');
    ocrResult.detectedIngredients.slice(0, 10).forEach((item, idx) => {
      console.log(`  [${idx}] ${item}`);
    });

    // Match ingredients from OCR results
    const foundIngredients = matchIngredients(db, ocrResult.detectedIngredients);

    // 디버깅: 매칭 결과 로그
    console.log('=== 매칭 결과 ===');
    console.log(`발견된 성분 ${foundIngredients.length}개:`, foundIngredients.map(i => i.name).join(', '));

    // Find packaging warnings based on packaging type
    const packagingWarnings =
      packagingResult.type !== 'Unknown'
        ? db.packaging.filter(p => p.type === packagingResult.type)
        : [];

    // Calculate score
    const scoreResult = calculateIngredientScore(foundIngredients, packagingWarnings);

    const response: AnalysisResponse = {
      success: true,
      data: {
        overallScore: scoreResult.overallScore,
        riskLevel: scoreResult.riskLevel,
        foundIngredients,
        packagingWarnings,
        ocrText: ocrResult.text,
        packagingType: packagingResult.type !== 'Unknown' ? packagingResult.type : undefined,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Analysis error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}
