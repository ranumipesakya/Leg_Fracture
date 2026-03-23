import { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import PatientNavbar from '../components/PatientNavbar';
import {
  Upload as UploadIcon,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Download
} from 'lucide-react';

type PredictionResult = {
  report_id: string;
  generated_at: string;
  is_xray: boolean;
  message: string;
  xray_confidence: number;
  fracture_prediction: string | null;
  fracture_confidence: number | null;
  recommendation: string;
};

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setResult(null);

    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setLoading(true);

      const response = await axios.post('http://localhost:5001/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(response.data);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

 const generatePdfReport = async () => {
  if (!result || !preview) {
    alert('Please analyze an image first.');
    return;
  }

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const isValidXray = result.is_xray === true;
  const hasFracture = result.fracture_prediction === 'Fractured';

  // Colors
  const navy = [10, 25, 47];
  const blue = [37, 99, 235];
  const lightBlue = [239, 246, 255];
  const red = [220, 38, 38];
  const lightRed = [254, 242, 242];
  const green = [22, 163, 74];
  const lightGreen = [240, 253, 244];
  const amber = [217, 119, 6];
  const lightAmber = [255, 251, 235];
  const gray = [107, 114, 128];
  const lightGray = [243, 244, 246];
  const dark = [17, 24, 39];

  // Helpers
  const drawRoundedBox = (
    x: number,
    y: number,
    w: number,
    h: number,
    fillColor: number[],
    radius = 3
  ) => {
    doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
    doc.roundedRect(x, y, w, h, radius, radius, 'F');
  };

  const addLabelValue = (
    label: string,
    value: string,
    x: number,
    y: number,
    labelWidth = 42
  ) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text(label, x, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text(value, x + labelWidth, y);
  };

  // Background
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Top header
  doc.setFillColor(navy[0], navy[1], navy[2]);
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('BoneScan AI', 14, 14);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('AI-Assisted Radiology Screening Report', 14, 21);

  // Report badge right
  doc.setFillColor(blue[0], blue[1], blue[2]);
  doc.roundedRect(pageWidth - 52, 9, 38, 10, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(result.report_id, pageWidth - 45, 15.5);

  // Main white container
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(10, 38, pageWidth - 20, 235, 5, 5, 'F');

  // Section: Patient / Scan Info
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(dark[0], dark[1], dark[2]);
  doc.text('Report Information', 18, 50);

  drawRoundedBox(16, 55, pageWidth - 32, 32, lightGray);

  addLabelValue('Generated At', result.generated_at, 20, 65);
  addLabelValue('Patient/User', 'Guest User', 20, 73);
  addLabelValue('Scan Type', 'X-Ray Image', 20, 81);

  // Status box
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(dark[0], dark[1], dark[2]);
  doc.text('Analysis Summary', 18, 100);

  let statusBg = lightAmber;
  let statusText = amber;
  let verdict = 'Invalid Input';

  if (isValidXray && hasFracture) {
    statusBg = lightRed;
    statusText = red;
    verdict = 'Fracture Detected';
  } else if (isValidXray && !hasFracture) {
    statusBg = lightGreen;
    statusText = green;
    verdict = 'No Fracture Detected';
  }

  drawRoundedBox(16, 105, pageWidth - 32, 22, statusBg);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(statusText[0], statusText[1], statusText[2]);
  doc.text(verdict, 20, 119);

  // Confidence cards
  drawRoundedBox(16, 135, 86, 32, [248, 250, 252]);
  drawRoundedBox(108, 135, 86, 32, [248, 250, 252]);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.text('X-RAY RECOGNITION', 20, 143);

  doc.setFontSize(18);
  doc.setTextColor(dark[0], dark[1], dark[2]);
  doc.text(`${(result.xray_confidence * 100).toFixed(1)}%`, 20, 154);

  doc.setDrawColor(220, 224, 230);
  doc.setLineWidth(1.8);
  doc.line(20, 160, 92, 160);
  doc.setDrawColor(blue[0], blue[1], blue[2]);
  doc.line(20, 160, 20 + 72 * result.xray_confidence, 160);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.text('FRACTURE CONFIDENCE', 112, 143);

  doc.setFontSize(18);
  doc.setTextColor(dark[0], dark[1], dark[2]);
  doc.text(
    `${
      result.fracture_confidence !== null
        ? (result.fracture_confidence * 100).toFixed(1) + '%'
        : '--'
    }`,
    112,
    154
  );

  doc.setDrawColor(220, 224, 230);
  doc.setLineWidth(1.8);
  doc.line(112, 160, 184, 160);

  let confidenceBarColor = gray;
  if (isValidXray && hasFracture) confidenceBarColor = red;
  if (isValidXray && !hasFracture) confidenceBarColor = green;

  const fractureBarValue = result.fracture_confidence ?? 0;
  doc.setDrawColor(confidenceBarColor[0], confidenceBarColor[1], confidenceBarColor[2]);
  doc.line(112, 160, 112 + 72 * fractureBarValue, 160);

  // Recommendation section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(dark[0], dark[1], dark[2]);
  doc.text('Clinical Recommendation', 18, 180);

  drawRoundedBox(16, 185, pageWidth - 32, 28, [249, 250, 251]);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(dark[0], dark[1], dark[2]);
  const recommendationLines = doc.splitTextToSize(result.recommendation, pageWidth - 42);
  doc.text(recommendationLines, 20, 194);

  // Image section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Uploaded Scan Preview', 18, 224);

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = preview;

  img.onload = () => {
    const maxWidth = 80;
    const maxHeight = 55;

    let imgWidth = img.width;
    let imgHeight = img.height;

    const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
    imgWidth *= ratio;
    imgHeight *= ratio;

    drawRoundedBox(16, 229, 90, 62, [245, 247, 250]);
    doc.addImage(
      img,
      'JPEG',
      21,
      233,
      imgWidth,
      imgHeight
    );

    // Right side mini summary
    drawRoundedBox(112, 229, 82, 62, [248, 250, 252]);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text('RESULT', 116, 240);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text(verdict, 116, 247);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text('VALID X-RAY', 116, 257);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text(isValidXray ? 'Yes' : 'No', 116, 264);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text('REPORT ID', 116, 274);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text(result.report_id, 116, 281);

    // Footer
    doc.setFillColor(navy[0], navy[1], navy[2]);
    doc.rect(0, 285, pageWidth, 12, 'F');

    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(
      'Disclaimer: This report is generated by an AI-assisted screening system and is not a final medical diagnosis.',
      14,
      292
    );

    doc.save(`${result.report_id}_BoneScan_Report.pdf`);
  };
};

  const isValidXray = result?.is_xray === true;
  const hasFracture = result?.fracture_prediction === 'Fractured';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-['Plus_Jakarta_Sans',_sans-serif] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <PatientNavbar currentPage="upload" />

      <main className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">AI Diagnostics</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
              Upload radiological scans for instant neural-network analysis.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT PANEL */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-all">
              <label
                className={`
                  group relative flex flex-col items-center justify-center w-full min-h-[320px]
                  border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
                  ${
                    file
                      ? 'border-blue-500 bg-blue-50/30'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                `}
              >
                {preview && (
                  <div className="absolute inset-0 w-full h-full overflow-hidden rounded-2xl">
                    <img
                      src={preview}
                      className="w-full h-full object-cover opacity-40 group-hover:opacity-20 transition-opacity"
                      alt="Preview"
                    />
                  </div>
                )}

                <div className="relative z-10 flex flex-col items-center text-center px-6">
                  <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <UploadIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg">
                    {file ? file.name : 'Select X-Ray Scan'}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
                    PNG, JPG or JPEG supported
                  </p>
                  <span className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all flex items-center shadow-lg shadow-blue-200 dark:shadow-none">
                    {file ? 'Replace Image' : 'Browse Files'}
                  </span>
                </div>

                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                  aria-label="Upload X-ray image"
                />
              </label>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !file}
                  className="w-full h-12 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-md"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Scan'
                  )}
                </button>

                <button
                  onClick={generatePdfReport}
                  disabled={!result}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Download size={18} />
                  Download Report
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
              <ShieldCheck className="text-emerald-600" size={20} />
              <span className="text-xs text-emerald-800 dark:text-emerald-400 font-medium">
                AI-assisted analysis interface
              </span>
            </div>
          </section>

          {/* RIGHT PANEL */}
          <section className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-200 dark:border-slate-800 min-h-[480px] flex flex-col">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-extrabold flex items-center gap-3">
                  <FileText className="text-blue-600" />
                  Analysis Results
                </h2>
                {result && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Ref: {result.report_id}
                  </span>
                )}
              </div>

              {!result && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
                    <CheckCircle size={32} className="opacity-20" />
                  </div>
                  <p className="text-sm font-medium">No scan analyzed yet.</p>
                </div>
              )}

              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-blue-600 font-bold animate-pulse">
                    Running Neural Inference...
                  </p>
                </div>
              )}

              {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div
                    className={`p-6 rounded-2xl border-2 shadow-sm ${
                      !isValidXray
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : hasFracture
                        ? 'bg-red-50 border-red-200 text-red-900'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {!isValidXray ? (
                        <AlertCircle size={24} />
                      ) : hasFracture ? (
                        <AlertCircle size={24} />
                      ) : (
                        <CheckCircle size={24} />
                      )}
                      <h3 className="text-2xl font-black">
                        {!isValidXray
                          ? 'Invalid Input'
                          : hasFracture
                          ? 'Fracture Detected'
                          : 'No Fracture Detected'}
                      </h3>
                    </div>

                    <p className="text-sm font-medium opacity-80 leading-relaxed">
                      {!isValidXray
                        ? 'The uploaded image was not recognized as an X-ray scan. Please upload a valid radiological image.'
                        : hasFracture
                        ? 'Potential fracture detected. Please consult an orthopedic specialist for medical confirmation.'
                        : 'No fracture was detected by the AI screening model in this image. A doctor should still review the scan.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ConfidenceCard
                      label="X-Ray Recognition Confidence"
                      value={result.xray_confidence}
                      status={isValidXray ? 'Valid' : 'Invalid'}
                      variant={isValidXray ? 'blue' : 'amber'}
                    />

                    <ConfidenceCard
                      label="Fracture Prediction Confidence"
                      value={isValidXray ? result.fracture_confidence : null}
                      status={
                        isValidXray
                          ? hasFracture
                            ? 'Positive'
                            : 'Negative'
                          : 'N/A'
                      }
                      variant={
                        isValidXray
                          ? hasFracture
                            ? 'red'
                            : 'emerald'
                          : 'slate'
                      }
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <p className="text-xs uppercase tracking-widest font-black text-slate-400 mb-2">
                      Recommendation
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {result.recommendation}
                    </p>
                  </div>

                  <button
                    onClick={resetAll}
                    className="w-full h-11 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Process Another Scan
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

const ConfidenceCard = ({
  label,
  value,
  status,
  variant = 'blue'
}: {
  label: string;
  value: number | null | undefined;
  status: string;
  variant: 'blue' | 'emerald' | 'red' | 'amber' | 'slate';
}) => {
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : null;

  const colors = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/10',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10',
    red: 'text-red-600 bg-red-50 dark:bg-red-900/10',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/10',
    slate: 'text-slate-400 bg-slate-50 dark:bg-slate-800/50'
  };

  const barColor = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    red: 'bg-red-500',
    amber: 'bg-amber-500',
    slate: 'bg-slate-400'
  };

  return (
    <div className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl transition-all">
      <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3">
        {label}
      </p>

      <div className="flex items-end justify-between">
        <h4 className="text-3xl font-black tracking-tighter">
          {safeValue !== null ? `${(safeValue * 100).toFixed(1)}%` : '--'}
        </h4>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${colors[variant]}`}>
          {status}
        </span>
      </div>

      <div className="mt-3 w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-out ${barColor[variant]}`}
          style={{ width: `${safeValue ? safeValue * 100 : 0}%` }}
        />
      </div>
    </div>
  );
};

export default Upload;