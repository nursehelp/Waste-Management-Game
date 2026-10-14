import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  getAllAuditRecords, 
  addAuditRecord, 
  calculateAnalytics, 
  resetAuditRecords, 
  generateCsvReport,
  initAuditStorage,
  AUDIT_ACCESS_PIN
} from './src/server/auditService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

initAuditStorage();

function requireAuditPin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const pin = req.headers['x-audit-pin'] || req.body?.pin || req.query?.pin;
  if (pin !== AUDIT_ACCESS_PIN) {
    return res.status(401).json({ error: 'Unauthorized: Invalid PIN code.' });
  }
  next();
}

app.get('/api/health', (req, res) => res.json({ status: 'healthy' }));

app.post('/api/audit/verify-pin', (req, res) => {
  const { pin } = req.body;
  if (pin === AUDIT_ACCESS_PIN) return res.json({ success: true });
  return res.status(401).json({ success: false, error: 'Incorrect PIN' });
});

app.get('/api/audit/analytics', requireAuditPin, (req, res) => {
  const analytics = calculateAnalytics(getAllAuditRecords());
  res.json(analytics);
});

app.get('/api/audit/records', requireAuditPin, (req, res) => {
  res.json(getAllAuditRecords());
});

app.post('/api/audit/scores', (req, res) => {
  try {
    const { sessionId, scenario, attemptType, score, totalItems, accuracyPercent, wastedCost, correctCount, incorrectCount, timeSpentSeconds, mistakes } = req.body;
    const newRecord = addAuditRecord({
      sessionId: sessionId || 'anon-session',
      scenario: scenario || 'All',
      attemptType: attemptType || '1st Attempt',
      score: Number(score) || 0,
      totalItems: Number(totalItems) || 10,
      accuracyPercent: Number(accuracyPercent) || 0,
      wastedCost: Number(wastedCost) || 0,
      correctCount: Number(correctCount) || 0,
      incorrectCount: Number(incorrectCount) || 0,
      timeSpentSeconds: Number(timeSpentSeconds) || 0,
      mistakes: Array.isArray(mistakes) ? mistakes : []
    });
    res.json({ success: true, record: newRecord });
  } catch (error) {
    console.error('Failed to save score:', error);
    res.status(500).json({ error: 'Failed to record audit score' });
  }
});

app.post('/api/audit/reset', requireAuditPin, (req, res) => {
  try {
    const records = resetAuditRecords();
    const analytics = calculateAnalytics(records);
    res.json({ success: true, analytics, message: 'All audit data cleared' });
  } catch (error) {
    console.error('Failed to reset audit data:', error);
    res.status(500).json({ error: 'Failed to reset audit data' });
  }
});

app.get('/api/audit/export.csv', requireAuditPin, (req, res) => {
  try {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="waste-audit-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(generateCsvReport(getAllAuditRecords()));
  } catch (error) {
    res.status(500).send('Error generating CSV');
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.resolve(distPath, 'index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`Running on port ${PORT}`));
}

export default app;

if (!process.env.VERCEL) {
  startServer();
}
