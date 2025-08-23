const { GoogleGenerativeAI } = require('@google/generative-ai');
const PDFDocument = require('pdfkit');
const stream = require('stream');
const { Activity } = require('../models/Activity');  // Mongoose model
const { UserFootprintCache } = require('../models/UserFootprintCache'); // Mongoose model

class ReportService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async getUserFootprintData(userId) {
    const [activities, footprint] = await Promise.all([
      Activity.find({ userId }).sort({ createdAt: -1 }),
      UserFootprintCache.findOne({ userId })
    ]);

    return {
      videoHours: activities.reduce(
        (sum, a) =>
          ['youtube', 'netflix'].includes(a.service) ? sum + a.duration / 60 : sum,
        0
      ),
      cloudStorage: activities.reduce(
        (sum, a) => (a.service === 'google_drive' ? sum + a.dataUsed : sum),
        0
      ),
      videoCalls: activities.reduce(
        (sum, a) => (a.service === 'zoom' ? sum + a.duration / 60 : sum),
        0
      ),
      totalCO2e: footprint?.totalCO2e || 0,
      activityCount: footprint?.activityCount || 0
    };
  }

  async generateAIReport(userData) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      const prompt = `Generate a detailed carbon footprint report in markdown format with these metrics:
      - Video Streaming: ${userData.videoHours.toFixed(1)} hours
      - Cloud Storage: ${userData.cloudStorage.toFixed(1)} GB
      - Video Calls: ${userData.videoCalls.toFixed(1)} hours
      - Total CO₂e: ${userData.totalCO2e.toFixed(2)} kg
      
      Include:
      1. Environmental impact analysis
      2. Comparisons to real-world equivalents
      3. Personalized reduction suggestions
      4. Positive reinforcement for good habits`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('AI Report Error:', error);
      throw new Error('Failed to generate AI report');
    }
  }

  generateGreenSuggestions(userData) {
    const suggestions = [];

    if (userData.videoHours > 10) {
      suggestions.push("Try reducing video quality from 4K to HD to save ~70% energy");
    }

    if (userData.cloudStorage > 50) {
      suggestions.push("Clean up unused cloud files - each GB stored emits about 0.2kg CO₂/year");
    }

    if (userData.totalCO2e > 20) {
      suggestions.push("Consider carbon offsetting for your digital activities");
    }

    return suggestions.length > 0 ? suggestions : ["Your digital habits are eco-friendly!"];
  }

  async generatePDFReport(userId) {
    const userData = await this.getUserFootprintData(userId);
    const aiReport = await this.generateAIReport(userData);
    const suggestions = this.generateGreenSuggestions(userData);

    const doc = new PDFDocument({ margin: 50 });
    const bufferStream = new stream.PassThrough();
    doc.pipe(bufferStream);

    // Header
    doc.fontSize(20).text('Digital Carbon Footprint Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // User Data Summary
    doc.fontSize(14).text('Your Digital Activity Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`• Video Streaming: ${userData.videoHours.toFixed(1)} hours`);
    doc.text(`• Cloud Storage: ${userData.cloudStorage.toFixed(1)} GB`);
    doc.text(`• Video Calls: ${userData.videoCalls.toFixed(1)} hours`);
    doc.text(`• Total CO₂ Emissions: ${userData.totalCO2e.toFixed(2)} kg`);
    doc.moveDown(1.5);

    // AI Report
    doc.fontSize(14).text('Environmental Impact Analysis', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(aiReport, { paragraphGap: 5 });
    doc.moveDown(1.5);

    // Suggestions
    doc.fontSize(14).text('Personalized Green Suggestions', { underline: true });
    doc.moveDown(0.5);
    suggestions.forEach(suggestion => {
      doc.fontSize(12).text(`• ${suggestion}`, { paragraphGap: 3 });
    });

    doc.end();
    return bufferStream;
  }
}

const reportService = new ReportService();
module.exports = { ReportService, reportService };
