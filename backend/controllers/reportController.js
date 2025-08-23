const reportService = require('../services/reportService');

const ReportController = {
    async getCarbonReport(req, res) {
        try {
            const userId = req.params.userId;

            // Fetch user data from MongoDB (inside service)
            const userData = await reportService.getUserFootprintData(userId);

            // Generate AI-based report & suggestions
            const report = await reportService.generateAIReport(userData);
            const suggestions = reportService.generateGreenSuggestions(userData);

            res.json({
                success: true,
                data: {
                    ...userData,
                    report,
                    suggestions
                }
            });
        } catch (error) {
            console.error('Report Error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate carbon report'
            });
        }
    },

    async downloadPDFReport(req, res) {
        try {
            const userId = req.params.userId;

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=carbon_report_${userId}.pdf`
            );

            // PDF generation handled in service
            const pdfStream = await reportService.generatePDFReport(userId);
            pdfStream.pipe(res);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate PDF report'
            });
        }
    }
};

module.exports = ReportController;
