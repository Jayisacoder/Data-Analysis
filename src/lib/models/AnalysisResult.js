import mongoose from 'mongoose';

const AnalysisResultSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  analysis: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.AnalysisResult || mongoose.model('AnalysisResult', AnalysisResultSchema);
