export default function handler(req: any, res: any) {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  const isConnected = key.length > 0;
  return res.status(200).json({
    connected: isConnected,
    hasKey: isConnected,
    model: 'gemini-3.6-flash',
    message: isConnected
      ? '하온·리호 전용 AI 스마트 엔진이 항상 연결되어 있습니다.'
      : 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.',
  });
}
