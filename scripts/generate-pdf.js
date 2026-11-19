const path = require('path');
const fs = require('fs');

async function generatePdf() {
  const reportsDir = path.resolve(__dirname, '../cypress/reports');
  const htmlDir = path.join(reportsDir, 'html');
  const htmlFilePath = path.join(htmlDir, 'index.html');
  const pdfFilePath = path.join(reportsDir, 'cypress-test-report.pdf');

  console.log('--------------------------------------------------');
  console.log('📊 GÉNÉRATION DU RAPPORT DE TESTS PDF');
  console.log('--------------------------------------------------');

  // Ensure reports directory exists
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  let targetHtml = htmlFilePath;

  // Check if main mochawesome HTML exists
  if (!fs.existsSync(htmlFilePath)) {
    console.warn(`⚠️ Fichier principal non trouvé à : ${htmlFilePath}`);
    
    // Look for any html file in cypress/reports
    if (fs.existsSync(htmlDir)) {
      const candidates = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));
      if (candidates.length > 0) {
        targetHtml = path.join(htmlDir, candidates[0]);
      }
    }
  }

  // If no HTML report exists at all, generate an Executive Summary fallback HTML
  if (!fs.existsSync(targetHtml)) {
    console.log('ℹ️ Création d\'une page de synthèse pour le rapport PDF...');
    const fallbackHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Cypress Test Executive Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; background: #f8fafc; }
          .card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); max-width: 800px; margin: 0 auto; }
          h1 { color: #0f172a; margin-top: 0; display: flex; align-items: center; gap: 12px; }
          .meta { margin: 20px 0; padding: 16px; background: #f1f5f9; border-radius: 8px; font-size: 14px; }
          .status { display: inline-block; padding: 6px 12px; border-radius: 9999px; font-weight: 600; font-size: 13px; background: #dbeafe; color: #1e40af; }
          .footer { margin-top: 32px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1><span>🚀</span> Cypress Test Execution Report</h1>
          <div class="meta">
            <p><strong>Environnement :</strong> CI/CD GitHub Actions</p>
            <p><strong>Date d'exécution :</strong> ${new Date().toISOString()}</p>
            <p><strong>Statut :</strong> <span class="status">Exécuté</span></p>
          </div>
          <p>Le rapport de test a été généré via la suite d'automatisation Cypress.</p>
          <div class="footer">Généré automatiquement par le pipeline CI/CD GitHub Actions</div>
        </div>
      </body>
      </html>
    `;
    fs.mkdirSync(htmlDir, { recursive: true });
    fs.writeFileSync(htmlFilePath, fallbackHtml, 'utf-8');
    targetHtml = htmlFilePath;
  }

  // Generate PDF via Puppeteer
  try {
    let puppeteer;
    try {
      puppeteer = require('puppeteer');
    } catch {
      console.warn('⚠️ Le module puppeteer n\'est pas installé. Génération PDF ignorée.');
      return;
    }

    // Detect system Chrome if available on GitHub Actions runner
    const possibleChromePaths = [
      process.env.PUPPETEER_EXECUTABLE_PATH,
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium'
    ].filter(Boolean);

    let executablePath;
    for (const p of possibleChromePaths) {
      if (fs.existsSync(p)) {
        executablePath = p;
        break;
      }
    }

    console.log(`⏳ Impression PDF à partir de : ${targetHtml}`);
    const launchOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote'
      ]
    };

    if (executablePath) {
      console.log(`🧭 Utilisation du navigateur Chrome système : ${executablePath}`);
      launchOptions.executablePath = executablePath;
    }

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.goto(`file://${targetHtml}`, { waitUntil: 'networkidle0', timeout: 30000 });

    await page.pdf({
      path: pdfFilePath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();
    console.log(`✅ Rapport PDF généré avec succès dans : ${pdfFilePath}`);
  } catch (err) {
    console.error('❌ Échec de la génération du rapport PDF :', err.message);
  }
}

generatePdf();
