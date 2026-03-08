const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Multer Setup for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Vercel serverless functions have a read-only filesystem except for /tmp
    const uploadDir = '/tmp/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// ==== API Routes ====

// 1. Dashboard Metrics
app.get('/api/dashboard', (req, res) => {
  res.json({
    activeApplications: 142,
    activeTrend: { value: 12, positive: true, text: 'vs last week' },
    processingTimeSaved: '4,200',
    timeTrend: { value: 0, positive: true, text: 'Automated ETL' },
    highRiskAlerts: 9,
    alertTrend: { value: 0, positive: false, text: 'Requires manual review' }
  });
});

// 2. Recent Applications List
app.get('/api/recent-applications', (req, res) => {
  res.json([
    {
      id: 1,
      entityName: 'Aditya Auto Components',
      requestedLimit: '50 Cr',
      sector: 'Manufacturing',
      status: 'Processing',
      confidence: null,
      alert: null
    },
    {
      id: 2,
      entityName: 'Kisan Agro Tech',
      requestedLimit: '15 Cr',
      sector: 'Agriculture',
      status: 'Manual Review',
      confidence: 65,
      alert: 'Discrepancy in GSTR-3B'
    },
    {
      id: 3,
      entityName: 'Navin Tech Solutions Pvt Ltd',
      requestedLimit: '5 Cr',
      sector: 'IT Services',
      status: 'CAM Ready',
      confidence: 92,
      alert: null
    }
  ]);
});

// 3. File Upload Handler
app.post('/api/upload', upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  // Simulate processing time
  setTimeout(() => {
    res.json({
      success: true,
      message: 'File uploaded and processed successfully.',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      },
      extractionData: {
        accuracy: 98.4,
        fraudCheck: 'Passed',
        rbiDefaulterList: 'Clear'
      }
    });
  }, 1500); // 1.5s simulated delay
});

// 3.5. Save Notes Handler
app.post('/api/notes', (req, res) => {
  const { note } = req.body;
  
  if (!note) {
    return res.status(400).json({ success: false, error: 'Note content is required.' });
  }

  // Simulate saving note to a database
  setTimeout(() => {
    res.json({ success: true, message: 'Note saved successfully to CAM.' });
  }, 500);
});

// 4. CAM Output Data
app.get('/api/cam/:id', (req, res) => {
  // Mock response for CAM output
  res.json({
    id: req.params.id,
    decision: 'REJECT',
    confidenceScore: 88,
    suggestedLimit: '₹ 0 Cr',
    requestedLimit: '₹ 50 Cr',
    riskPremium: 'N/A',
    explanation: 'Despite strong cash flows observed in GSTR-2A/3B reconciliation and healthy Bank Statement turnover, an active NCLT Section 9 insolvency petition was found on the e-Courts portal. Furthermore, the recent resignation of an independent director (via MCA filings) raises corporate governance flags. Under current RBI framework guidelines for corporate exposure, this represents outside-tolerance risk.',
    fiveCs: [
      { name: 'Character', score: 42, status: 'danger', description: 'High risk due to active NCLT litigation and director resignations.' },
      { name: 'Capacity', score: 85, status: 'success', description: 'Strong historical cash flow. DSCR at 1.8x, above sector average.' },
      { name: 'Capital', score: 60, status: 'warning', description: 'Moderate equity buffer. Debt-to-Equity stands at 2.1.' },
      { name: 'Collateral', score: 90, status: 'success', description: 'Prime industrial real estate offered. LTV calculated at 55%.' },
      { name: 'Conditions', score: 75, status: 'neutral', description: 'Positive sector tailwinds (PLI scheme), though macro supply chain issues persist.' }
    ]
  });
});

// Fallback route to serve index.html for SPA behavior (optional but good practice)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server or Export for Vercel
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
