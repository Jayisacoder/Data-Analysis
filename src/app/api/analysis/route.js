import { connectToDatabase } from '../../../lib/db';
import AnalysisResult from '../../../lib/models/AnalysisResult';

export async function POST(req) {
  await connectToDatabase();
  const { fileName, analysis } = await req.json();
  const result = await AnalysisResult.create({ fileName, analysis });
  return new Response(JSON.stringify(result), { status: 201 });
}

export async function GET() {
  await connectToDatabase();
  const results = await AnalysisResult.find().sort({ createdAt: -1 }).limit(20);
  return new Response(JSON.stringify(results), { status: 200 });
}
