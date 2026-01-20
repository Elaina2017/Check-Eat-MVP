'use client';

import { useState, useRef } from 'react';
import { AnalysisResponse } from '@/types/analysis';

const healthTips = [
  '가공식품보다 자연식품이 더 좋아요.',
  '유기농 인증 제품을 선택하면 더 안전해요.',
  '플라스틱 용기는 전자레인지 사용을 피하세요.',
  '통조림보다 유리병 제품이 더 안전해요.',
  'BPA-Free 마크를 확인하세요.',
];

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [currentTip, setCurrentTip] = useState(healthTips[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // 파일 선택 시 바로 분석 시작
      setTimeout(() => handleAnalyze(file), 100);
    }
  };

  const handleAnalyze = async (file?: File) => {
    const fileToAnalyze = file || selectedFile;
    if (!fileToAnalyze) return;

    setIsAnalyzing(true);
    setResult(null);

    // 랜덤 팁 선택
    setCurrentTip(healthTips[Math.floor(Math.random() * healthTips.length)]);

    try {
      const formData = new FormData();
      formData.append('image', fileToAnalyze);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data: AnalysisResponse = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Analysis failed:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // RED 성분 필터
  const redIngredients = result?.data?.foundIngredients.filter((i) => i.riskLevel === 'RED') || [];
  // YELLOW 성분 필터
  const yellowIngredients = result?.data?.foundIngredients.filter((i) => i.riskLevel === 'YELLOW') || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {!selectedFile && !isAnalyzing && !result && (
          <>
            {/* 초기 화면 */}
            <div className="text-center mb-8">
              <div className="w-32 h-32 mx-auto mb-6 bg-teal-50 rounded-3xl flex items-center justify-center">
                <svg className="w-16 h-16 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-gray-800 mb-3">식품 라벨을 촬영해주세요</h1>
              <p className="text-gray-600 text-sm leading-relaxed">
                원재료명과 영양성분이 잘 보이도록
                <br />
                라벨 전체를 촬영해주세요.
              </p>
            </div>

            {/* 촬영 버튼 */}
            <div className="mb-6">
              <button
                onClick={() => {
                  const input = document.getElementById('camera-upload') as HTMLInputElement;
                  input?.click();
                }}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors shadow-sm font-medium"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                라벨 촬영하기
              </button>

              <button
                onClick={() => {
                  const input = document.getElementById('file-upload') as HTMLInputElement;
                  input?.click();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                갤러리에서 선택도 가능해요
              </button>
            </div>

            {/* 촬영 팁 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">촬영 팁</h3>
                  <ul className="space-y-1.5 text-sm text-gray-600">
                    <li>• 밝은 곳에서 촬영하세요</li>
                    <li>• 글씨가 흐리지지 않게 초점을 맞춰주세요</li>
                    <li>• 반사광을 피해주세요</li>
                  </ul>
                </div>
              </div>
            </div>

            <input
              id="camera-upload"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </>
        )}

        {/* 분석 중 화면 */}
        {isAnalyzing && previewUrl && (
          <div className="text-center">
            <div className="mb-8">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-48 h-48 mx-auto object-cover rounded-3xl shadow-lg"
              />
            </div>

            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4">
                <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">성분 분석 중...</h2>
              <p className="text-gray-600 text-sm">잠시만 기다려주세요</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-sm text-amber-800">💡 {currentTip}</p>
            </div>
          </div>
        )}

        {/* 결과 화면 */}
        {result && result.success && result.data && !isAnalyzing && (
          <div>
            {/* 점수 헤더 */}
            <div
              className={`rounded-t-3xl p-8 text-center text-white mb-8 ${
                result.data.riskLevel === 'DANGER'
                  ? 'bg-red-500'
                  : result.data.riskLevel === 'CAUTION'
                  ? 'bg-orange-400'
                  : 'bg-green-500'
              }`}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                {result.data.riskLevel === 'DANGER' && (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {result.data.riskLevel === 'CAUTION' && (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {result.data.riskLevel === 'SAFE' && (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className="text-sm mb-2 opacity-90">
                {result.data.riskLevel === 'DANGER' && '위험'}
                {result.data.riskLevel === 'CAUTION' && '주의'}
                {result.data.riskLevel === 'SAFE' && '안전'}
              </p>
              <h2 className="text-5xl font-bold mb-3">{result.data.overallScore}점</h2>
              <p className="text-sm opacity-90">
                {result.data.riskLevel === 'DANGER' && '위험한 성분과 포장재가 포함되어 있습니다.'}
                {result.data.riskLevel === 'CAUTION' && '주의가 필요한 성분과 포장재가 포함되어 있습니다.'}
                {result.data.riskLevel === 'SAFE' && '안전한 제품입니다.'}
              </p>
            </div>

            {/* 위험 성분 */}
            {redIngredients.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-lg font-bold text-gray-800">위험 성분</h2>
                  <span className="w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {redIngredients.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {redIngredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="bg-red-50 border border-red-200 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{ingredient.name}</h3>
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">{ingredient.whyDangerous}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 주의 성분 */}
            {yellowIngredients.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-lg font-bold text-gray-800">주의 성분</h2>
                  <span className="w-6 h-6 bg-orange-400 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {yellowIngredients.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {yellowIngredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="bg-orange-50 border border-orange-200 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{ingredient.name}</h3>
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">{ingredient.whyDangerous}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 포장재 경고 */}
            {result.data.packagingWarnings.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-lg font-bold text-gray-800">포장재 경고</h2>
                  <span className="w-6 h-6 bg-orange-400 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {result.data.packagingWarnings.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {result.data.packagingWarnings.map((warning, index) => (
                    <div
                      key={index}
                      className="bg-orange-50 border border-orange-200 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{warning.name}</h3>
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">{warning.whyDangerous}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 안전한 경우 */}
            {redIngredients.length === 0 &&
              yellowIngredients.length === 0 &&
              result.data.packagingWarnings.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">안전한 제품입니다!</h2>
                  <p className="text-gray-600 text-sm">검출된 유해 성분이 없습니다.</p>
                </div>
              )}

            {/* 재촬영 버튼 */}
            <button
              onClick={handleReset}
              className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              다시 촬영하기
            </button>
          </div>
        )}

        {/* 에러 화면 */}
        {result && !result.success && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <h3 className="text-red-800 font-semibold mb-2">분석 오류</h3>
            <p className="text-red-700 text-sm mb-4">{result.error}</p>
            <button
              onClick={handleReset}
              className="w-full py-3 px-6 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
            >
              다시 시도하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
