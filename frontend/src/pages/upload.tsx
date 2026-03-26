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
  Download,
  PlusCircle,
  Activity
} from 'lucide-react';

type PredictionResult = {
  report_id: string;
  generated_at: string;
  is_xray: boolean;
  is_leg_xray: boolean | null;
  message: string;
  xray_confidence: number;
  leg_confidence?: number | null;
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

      const response = await axios.post('http://localhost:5000/api/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(response.data.prediction);
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
    const isLegXray = result.is_leg_xray === true;
    const hasFracture = result.fracture_prediction === 'Fractured';

    const navy = [10, 25, 47];
    const blue = [37, 99, 235];
    const red = [220, 38, 38];
    const lightRed = [254, 242, 242];
    const green = [22, 163, 74];
    const lightGreen = [240, 253, 244];
    const amber = [217, 119, 6];
    const lightAmber = [255, 251, 235];
    const orange = [234, 88, 12];
    const lightOrange = [255, 247, 237];
    const gray = [107, 114, 128];
    const lightGray = [243, 244, 246];
    const dark = [17, 24, 39];

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

    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.setFillColor(navy[0], navy[1], navy[2]);
    doc.rect(0, 0, pageWidth, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('BoneScan AI', 14, 14);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('AI-Assisted Radiology Screening Report', 14, 21);

    doc.setFillColor(blue[0], blue[1], blue[2]);
    doc.roundedRect(pageWidth - 52, 9, 38, 10, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(result.report_id, pageWidth - 45, 15.5);

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(10, 38, pageWidth - 20, 235, 5, 5, 'F');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text('Report Information', 18, 50);

    drawRoundedBox(16, 55, pageWidth - 32, 32, lightGray);

    addLabelValue('Generated At', result.generated_at, 20, 65);
    addLabelValue('Patient/User', 'Guest User', 20, 73);
    addLabelValue('Scan Type', 'X-Ray Image', 20, 81);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text('Analysis Summary', 18, 100);

    let statusBg = lightAmber;
    let statusText = amber;
    let verdict = 'Invalid X-Ray Input';

    if (!isValidXray) {
      statusBg = lightAmber;
      statusText = amber;
      verdict = 'Invalid X-Ray Input';
    } else if (!isLegXray) {
      statusBg = lightOrange;
      statusText = orange;
      verdict = 'Not a Leg X-Ray';
    } else if (hasFracture) {
      statusBg = lightRed;
      statusText = red;
      verdict = 'Fracture Detected';
    } else {
      statusBg = lightGreen;
      statusText = green;
      verdict = 'No Fracture Detected';
    }

    drawRoundedBox(16, 105, pageWidth - 32, 22, statusBg);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(statusText[0], statusText[1], statusText[2]);
    doc.text(verdict, 20, 119);

    drawRoundedBox(16, 135, 56, 32, [248, 250, 252]);
    drawRoundedBox(77, 135, 56, 32, [248, 250, 252]);
    drawRoundedBox(138, 135, 56, 32, [248, 250, 252]);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text('X-RAY CONFIDENCE', 20, 143);

    doc.setFontSize(16);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text(`${(result.xray_confidence * 100).toFixed(1)}%`, 20, 154);

    doc.setDrawColor(220, 224, 230);
    doc.setLineWidth(1.8);
    doc.line(20, 160, 66, 160);
    doc.setDrawColor(blue[0], blue[1], blue[2]);
    doc.line(20, 160, 20 + 46 * result.xray_confidence, 160);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text('LEG CONFIDENCE', 81, 143);

    doc.setFontSize(16);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text(
      `${result.leg_confidence !== null && result.leg_confidence !== undefined
        ? (result.leg_confidence * 100).toFixed(1) + '%'
        : '--'
      }`,
      81,
      154
    );

    doc.setDrawColor(220, 224, 230);
    doc.setLineWidth(1.8);
    doc.line(81, 160, 127, 160);
    doc.setDrawColor(isLegXray ? blue[0] : orange[0], isLegXray ? blue[1] : orange[1], isLegXray ? blue[2] : orange[2]);
    doc.line(81, 160, 81 + 46 * (result.leg_confidence ?? 0), 160);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text('FRACTURE CONFIDENCE', 142, 143);

    doc.setFontSize(16);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text(
      `${result.fracture_confidence !== null
        ? (result.fracture_confidence * 100).toFixed(1) + '%'
        : '--'
      }`,
      142,
      153
    );

    doc.setDrawColor(220, 224, 230);
    doc.setLineWidth(1.8);
    doc.line(142, 160, 188, 160);

    let fractureBarColor = gray;
    if (isValidXray && isLegXray && hasFracture) fractureBarColor = red;
    if (isValidXray && isLegXray && !hasFracture) fractureBarColor = green;

    const fractureBarValue = result.fracture_confidence ?? 0;
    doc.setDrawColor(fractureBarColor[0], fractureBarColor[1], fractureBarColor[2]);
    doc.line(142, 160, 142 + 46 * fractureBarValue, 160);

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
      doc.addImage(img, 'JPEG', 21, 233, imgWidth, imgHeight);

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
      doc.text('LEG X-RAY', 116, 274);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(dark[0], dark[1], dark[2]);
      doc.text(isLegXray ? 'Yes' : 'No', 116, 281);

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
  const isLegXray = result?.is_leg_xray === true;
  const hasFracture = result?.fracture_prediction === 'Fractured';

  return (
    <div className="font-['Plus_Jakarta_Sans',_sans-serif] bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-500">
      <PatientNavbar currentPage="upload" />

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        
        {/* Modern Header */}
        <header className="mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-slate-900 dark:text-white leading-none">
            AI Diagnostic <span className="text-blue-600 dark:text-blue-400">Portal</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Upload Section */}
          <section className="lg:col-span-5 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 shadow-3xl border border-slate-100 dark:border-slate-800 transition-all flex flex-col">
              <label
                className={`
                  group relative flex flex-col items-center justify-center w-full min-h-[420px]
                  border-4 border-dashed rounded-[40px] cursor-pointer transition-all duration-500
                  ${
                    file
                      ? 'border-blue-500 bg-blue-50/20'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/10 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                `}
              >
                {preview && (
                  <div className="absolute inset-0 w-full h-full overflow-hidden rounded-[36px]">
                    <img
                      src={preview}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500"
                      alt="Preview"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                  </div>
                )}

                <div className="relative z-10 flex flex-col items-center text-center w-full px-8 overflow-hidden">
                  <div className="w-20 h-20 bg-white dark:bg-slate-950 rounded-3xl shadow-2xl flex items-center justify-center mb-8 border border-slate-50 dark:border-slate-800 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                    <UploadIcon className="w-9 h-9 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-base tracking-tight text-slate-900 dark:text-white w-full truncate mb-3">
                    {file ? file.name : 'Select Radiograph'}
                  </h3>
                  <p className="text-base text-slate-500 dark:text-slate-400 mt-3 mb-10 font-medium">
                    Supports high-density DICOM exports, <br/> PNG, or JPEG formats.
                  </p>
                  <div className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-2xl transition-all flex items-center shadow-2xl shadow-blue-500/20 uppercase tracking-[0.2em]">
                    {file ? 'Update X-Ray' : 'Upload X-Ray'}
                  </div>
                </div>

                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                  aria-label="Upload X-ray image"
                />
              </label>

              <div className="mt-10 space-y-4">
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !file}
                  className="w-full h-16 bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-black rounded-[24px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-2xl group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      Synthesizing...
                    </>
                  ) : (
                    <>
                    Start Analysis
                    <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
                    </>
                  )}
                </button>

                {result && (
                  <button
                    onClick={generatePdfReport}
                    className="w-full h-16 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white font-black rounded-[24px] uppercase tracking-[0.2em] transition-all hover:bg-slate-50 flex items-center justify-center gap-3"
                  >
                    <Download size={22} className="text-blue-600" />
                    Download Lab Report
                  </button>
                )}
              </div>
            </div>

            <div className="p-8 rounded-[40px] bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/20 flex flex-col gap-4">
               <div className="flex items-center gap-3 text-indigo-900 dark:text-indigo-300">
                  <ShieldCheck size={28} className="text-indigo-600" />
                  <span className="font-black uppercase tracking-[0.3em] text-[10px]">Privacy Protocol</span>
               </div>
               <p className="text-sm text-indigo-700/80 dark:text-indigo-400 font-medium leading-relaxed">
                  Encryption is active. Your scan data is processed through our secure cloud-link and purged immediately after synthesis.
               </p>
            </div>
          </section>

          {/* Results Section */}
          <section className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-900 rounded-[48px] p-12 shadow-3xl border border-slate-100 dark:border-slate-800 min-h-[680px] flex flex-col group">
              <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-50 dark:border-slate-800">
                <div className="space-y-1">
                    <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest leading-none">Analysis Hub</span>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">Detection Report</h2>
                </div>
                {result && (
                  <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-black text-blue-600">RID: {result.report_id}</span>
                  </div>
                )}
              </div>

              {!result && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                  <div className="w-32 h-32 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-950 shadow-2xl relative">
                    <FileText size={48} className="text-slate-200" />
                    <div className="absolute inset-0 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-full animate-[spin_10s_linear_infinite]" />
                  </div>
                  <div className="max-w-sm space-y-3">
                    <p className="text-2xl font-black text-slate-300">Waiting for Input</p>
                    <p className="text-sm font-medium text-slate-400 leading-relaxed">
                        Your clinical report will materialize here once the AI engine finishes scan synthesis.
                    </p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-10">
                  <div className="relative">
                    <div className="w-24 h-24 border-8 border-blue-50 dark:border-blue-900/30 border-t-blue-600 rounded-full animate-spin"></div>
                    <Activity size={32} className="text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div className="text-center space-y-3">
                    <p className="text-2xl font-black text-blue-600 animate-pulse tracking-tight">Neural Interference Processing</p>
                    <p className="text-sm text-slate-400 font-medium">Deconstructing pixel data • Map-Reduce Sequencing...</p>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div
                    className={`p-10 rounded-[40px] border-4 shadow-2xl transition-all ${
                      !isValidXray
                        ? 'bg-amber-500 border-amber-400 text-white'
                        : result.is_leg_xray === false
                        ? 'bg-orange-500 border-orange-400 text-white'
                        : hasFracture
                        ? 'bg-red-500 border-red-400 text-white'
                        : 'bg-emerald-500 border-emerald-400 text-white'
                    }`}
                  >
                    <div className="flex items-start gap-6 mb-4">
                      <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-md">
                        {!isValidXray ? (
                            <AlertCircle size={36} />
                        ) : result.is_leg_xray === false ? (
                            <AlertCircle size={36} />
                        ) : hasFracture ? (
                            <AlertCircle size={36} />
                        ) : (
                            <CheckCircle size={36} />
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-[12px] font-black uppercase tracking-[0.3em] opacity-80">Synthesis Outcome</p>
                        <h3 className="text-4xl font-black tracking-tighter">
                            {!isValidXray
                            ? 'Invalid Scan Data'
                            : result.is_leg_xray === false
                            ? 'Anatomical Mismatch'
                            : hasFracture
                            ? 'Fracture Detected'
                            : 'Stable Diagnostic'}
                        </h3>
                      </div>
                    </div>

                    <p className="text-lg font-medium opacity-90 leading-relaxed mt-6">
                      {!isValidXray
                        ? 'The uploaded matrix was not recognized as a standard radiograph. Please verify input source.'
                        : result.is_leg_xray === false
                        ? 'Valid radiograph detected, however, the anatomical target (Leg) was not found in frame.'
                        : hasFracture
                        ? 'Primary AI analysis indicates a probable fracture. Urgent orthopedic consultation is recommended.'
                        : 'No structural deviations or fractures were identified by the current neural model.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ConfidenceCard
                      label="Synthesis Confidence"
                      value={result.xray_confidence}
                      status={isValidXray ? 'Certified' : 'Low'}
                    />

                    <ConfidenceCard
                      label="Anatomical Precision"
                      value={isValidXray ? result.leg_confidence ?? null : null}
                      status={
                        !isValidXray
                          ? 'N/A'
                          : result.is_leg_xray === true
                          ? 'Leg'
                          : 'Not Leg'
                      }
                    />

                    <ConfidenceCard
                      label="Fracture Analysis"
                      value={isValidXray && isLegXray ? result.fracture_confidence : null}
                      status={
                        isValidXray && isLegXray
                          ? hasFracture
                            ? 'Positive'
                            : 'Negative'
                          : 'Suspended'
                      }
                    />
                  </div>

                  <div className="p-10 rounded-[40px] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <PlusCircle size={20} className="text-blue-600" />
                        <h4 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Expert Recommendation</h4>
                    </div>
                    <p className="text-xl font-medium text-slate-700 dark:text-slate-200 leading-relaxed italic">
                      "{result.recommendation}"
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                        onClick={resetAll}
                        className="group inline-flex items-center gap-4 px-8 py-4 bg-slate-900 dark:bg-slate-700 text-white font-black rounded-2xl uppercase tracking-widest text-xs transition-all hover:bg-black"
                    >
                        New Synthesis
                        <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-700" />
                    </button>
                  </div>
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
}: {
  label: string;
  value: number | null | undefined;
  status: string;
}) => {
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : null;

  return (
    <div className="p-8 bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800 rounded-[32px] shadow-sm">
      <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-6">
        {label}
      </p>

      <div className="flex items-baseline justify-between mb-6">
        <h4 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
          {safeValue !== null ? `${(safeValue * 100).toFixed(0)}%` : '--'}
        </h4>
        <span className="text-[10px] font-black px-3 py-1 bg-blue-600 text-white rounded-md uppercase tracking-widest">
          {status}
        </span>
      </div>

      <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-1000 ease-out"
          style={{ width: `${safeValue ? safeValue * 100 : 0}%` }}
        />
      </div>
    </div>
  );
};

export default Upload;