import { useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import PatientNavbar from '../components/PatientNavbar';
import VoiceFeedback from '../components/VoiceFeedback';
import type { ResultType } from '../components/VoiceFeedback';
import {
  Upload as UploadIcon,
  FileText,
  FileDown,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Activity,
  BarChart3,
  Image as ImageIcon,
  X
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
  gradcam_image?: string | null;
  stage?: string;
};

type PreviewImage = {
  src: string;
  label: string;
};

const Upload = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeImage, setActiveImage] = useState<PreviewImage | null>(null);
  const [patientName, setPatientName] = useState('');

  const mapResultToType = (res: PredictionResult | null): ResultType => {
    if (!res) return 'unknown';
    if (res.is_xray === false) return 'not_xray';
    if (res.is_leg_xray === false) return 'not_leg';
    if (res.fracture_prediction === 'Fractured') return 'fractured';
    if (res.fracture_prediction === 'Not Fractured') return 'not_fractured';
    return 'unknown';
  };

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

    const userToken = localStorage.getItem('userToken');
    if (!userToken) {
      const uploadCount = parseInt(localStorage.getItem('uploadCount') || '0', 10);
      if (uploadCount >= 3) {
        alert('You have reached the free upload limit (3 uploads). Please register or login to continue using BoneScan AI.');
        window.location.hash = '#/auth';
        return;
      }
      localStorage.setItem('uploadCount', (uploadCount + 1).toString());
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setLoading(true);

      const response = await axios.post(`${apiBaseUrl}/api/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(response.data?.prediction ?? response.data);
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
    setActiveImage(null);
    setPatientName('');
  };

  const toPercent = (value: number | null | undefined): number | null => {
    if (value === null || value === undefined || Number.isNaN(value)) return null;
    const bounded = Math.max(0, Math.min(1, value));
    return Math.round(bounded * 100);
  };

  const hasFracture = result?.fracture_prediction === 'Fractured';

  const loadImageData = async (src: string): Promise<{ dataUrl: string; width: number; height: number }> => {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }

    const blob = await response.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read image blob'));
      reader.readAsDataURL(blob);
    });

    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.src = dataUrl;
    });

    return {
      dataUrl,
      width: dimensions.width,
      height: dimensions.height
    };
  };

  const handleGenerateReport = async () => {
    if (!result) return;
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const patient = patientName.trim() || 'N/A';
      const patientNo = result.report_id;
      let temporaryPreview: string | null = null;
      const reportImageSrc = preview ?? (file ? URL.createObjectURL(file) : null);
      if (!preview && reportImageSrc) {
        temporaryPreview = reportImageSrc;
      }
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 12;
      let y = 0;

      const drawHeader = () => {
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageWidth, 34, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('BoneScan AI Detection Report', margin, 15);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`RID: ${result.report_id}`, margin, 22);
        doc.text(`Patient: ${patient}`, margin, 27);
        doc.text(`Patient No: ${patientNo}`, margin, 32);
        doc.text(`Date: ${result.generated_at}`, pageWidth - margin, 22, { align: 'right' });
        y = 48;
        doc.setTextColor(20, 20, 20);
      };

      const ensureSpace = (needed: number) => {
        if (y + needed <= pageHeight - 16) return;
        doc.addPage();
        drawHeader();
      };

      const drawSectionTitle = (title: string) => {
        ensureSpace(10);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(30, 64, 175);
        doc.text(title, margin, y);
        y += 6;
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y, pageWidth - margin, y);
        y += 6;
        doc.setTextColor(20, 20, 20);
      };

      const drawProbRow = (label: string, value: number | null) => {
        ensureSpace(12);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(label, margin, y);
        const barX = margin + 52;
        const barY = y - 4;
        const barW = pageWidth - margin - barX;
        const percent = Math.max(0, Math.min(100, value ?? 0));
        doc.setFillColor(226, 232, 240);
        doc.roundedRect(barX, barY, barW, 4.5, 2, 2, 'F');
        doc.setFillColor(37, 99, 235);
        doc.roundedRect(barX, barY, (barW * percent) / 100, 4.5, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.text(value === null ? '--' : `${percent}%`, pageWidth - margin, y, { align: 'right' });
        y += 8;
      };

      drawHeader();

      drawSectionTitle('Model Probabilities');
      drawProbRow('X-Ray Model', toPercent(result.xray_confidence));
      drawProbRow('Leg X-Ray Model', toPercent(result.leg_confidence));
      drawProbRow('Fracture Model', toPercent(result.fracture_confidence));

      drawSectionTitle('Clinical Summary');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const summaryLines = [
        `Patient Name: ${patient}`,
        `Patient Number: ${patientNo}`,
        `X-Ray Valid: ${result.is_xray ? 'Yes' : 'No'}`,
        `Leg X-Ray: ${result.is_leg_xray === null ? 'Not evaluated' : (result.is_leg_xray ? 'Yes' : 'No')}`,
        `Fracture Prediction: ${result.fracture_prediction ?? 'Not evaluated'}`,
        `Message: ${result.message}`,
      ];
      summaryLines.forEach((line) => {
        ensureSpace(6);
        doc.text(`- ${line}`, margin, y);
        y += 6;
      });

      const recommendationLines = doc.splitTextToSize(`Recommendation: ${result.recommendation}`, pageWidth - margin * 2);
      ensureSpace(recommendationLines.length * 5 + 4);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommendation', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(recommendationLines, margin, y);
      y += recommendationLines.length * 5 + 4;

      const drawImageBlock = async (title: string, src: string | null, borderColor: [number, number, number]) => {
        if (!src) return;
        try {
          const imageInfo = await loadImageData(src);
          const maxW = pageWidth - margin * 2;
          const maxH = 85;
          const ratio = Math.min(maxW / imageInfo.width, maxH / imageInfo.height);
          const drawWidth = imageInfo.width * ratio;
          const drawHeight = imageInfo.height * ratio;
          ensureSpace(drawHeight + 16);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text(title, margin, y);
          y += 4;
          doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
          doc.setLineWidth(1.2);
          doc.roundedRect(margin - 1, y, drawWidth + 2, drawHeight + 2, 2, 2, 'S');
          doc.addImage(imageInfo.dataUrl, 'JPEG', margin, y + 1, drawWidth, drawHeight);
          y += drawHeight + 10;
        } catch {
          // Ignore image failures and continue PDF generation.
        }
      };

      drawSectionTitle('Attached Images');
      await drawImageBlock('Uploaded X-Ray', reportImageSrc, [148, 163, 184]);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      ensureSpace(8);
      doc.text(
        'Note: This AI output is supportive screening guidance and not a final medical diagnosis.',
        margin,
        pageHeight - 10
      );

      const safeName = patient.replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeNumber = patientNo.replace(/[^a-zA-Z0-9_-]/g, '_');
      doc.save(`${result.report_id || 'bonescan-report'}_${safeName}_${safeNumber}.pdf`);

      if (temporaryPreview) {
        URL.revokeObjectURL(temporaryPreview);
      }
    } catch (error) {
      console.error('Report generation failed:', error);
      alert('Report download failed. Please try again.');
    }
  };

  return (
    <div className="font-['Plus_Jakarta_Sans',_sans-serif] bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-500">
      <PatientNavbar currentPage="upload" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-14 lg:py-20">
        <header className="mb-8 md:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-slate-900 dark:text-white leading-none">
            AI Diagnostic <span className="text-blue-600 dark:text-blue-400">Portal</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 lg:gap-12">
          {!result && (
            <section className="lg:col-span-5 space-y-8">
              <div className="bg-white dark:bg-slate-900 rounded-[24px] sm:rounded-[36px] md:rounded-[48px] p-5 sm:p-8 md:p-10 shadow-3xl border border-slate-100 dark:border-slate-800 transition-all flex flex-col">
                <label
                  className={`
                    group relative flex flex-col items-center justify-center w-full min-h-[300px] sm:min-h-[360px] md:min-h-[420px]
                    border-[3px] sm:border-4 border-dashed rounded-[18px] sm:rounded-[30px] md:rounded-[40px] cursor-pointer transition-all duration-500
                    ${file
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

                    <div className="relative z-10 flex flex-col items-center text-center w-full px-4 sm:px-6 md:px-8 overflow-hidden">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-slate-950 rounded-2xl sm:rounded-3xl shadow-2xl flex items-center justify-center mb-6 sm:mb-8 border border-slate-50 dark:border-slate-800 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                      <UploadIcon className="w-8 h-8 sm:w-9 sm:h-9 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white w-full truncate mb-3">
                      {file ? file.name : 'Select Radiograph'}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 sm:mt-3 mb-6 sm:mb-10 font-medium">
                      Supports high-density DICOM exports, <br /> PNG, or JPEG formats.
                    </p>
                    <div className="h-12 sm:h-14 px-7 sm:px-10 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black rounded-xl sm:rounded-2xl transition-all flex items-center shadow-2xl shadow-blue-500/20 uppercase tracking-[0.12em] sm:tracking-[0.2em]">
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

                <div className="mt-6 sm:mt-8 md:mt-10 space-y-4">
                  <button
                    onClick={handleAnalyze}
                    disabled={loading || !file}
                    className="w-full h-14 sm:h-16 bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white text-xs sm:text-sm font-black rounded-2xl sm:rounded-[24px] uppercase tracking-[0.12em] sm:tracking-[0.2em] transition-all flex items-center justify-center gap-3 sm:gap-4 shadow-2xl group"
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
          )}

            <section className={result ? "lg:col-span-12 max-w-4xl mx-auto w-full" : "lg:col-span-7"}>
            <div className="bg-white dark:bg-slate-900 rounded-[24px] sm:rounded-[36px] md:rounded-[48px] p-5 sm:p-8 md:p-10 lg:p-12 shadow-3xl border border-slate-100 dark:border-slate-800 min-h-[560px] sm:min-h-[620px] md:min-h-[680px] flex flex-col group">
              <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between mb-8 sm:mb-10 md:mb-12 pb-6 border-b border-slate-50 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    Analysis Hub
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    Detection Report
                  </h2>
                </div>
                {result && (
                  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Patient Name"
                      className="h-10 w-full sm:w-auto px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                    <div className="px-4 sm:px-5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <span className="text-xs font-black text-blue-600">RID: {result.report_id}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateReport}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider transition-colors"
                    >
                      <FileDown size={14} />
                      Download Report
                    </button>
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
                    <p className="text-2xl font-black text-blue-600 animate-pulse tracking-tight">
                      Neural Interference Processing
                    </p>
                    <p className="text-sm text-slate-400 font-medium">
                      Deconstructing pixel data • Map-Reduce Sequencing...
                    </p>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <VoiceFeedback resultType={mapResultToType(result)} />

                  <div className="p-5 sm:p-6 md:p-8 rounded-[20px] sm:rounded-[24px] md:rounded-[32px] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                      <BarChart3 size={20} className="text-blue-600" />
                      <h4 className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">
                        3-Model Probability Report
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        {
                          key: 'xray',
                          title: 'X-Ray Model',
                          value: toPercent(result.xray_confidence),
                          subtitle: result.is_xray ? 'Valid X-ray' : 'Not X-ray'
                        },
                        {
                          key: 'leg',
                          title: 'Leg X-Ray Model',
                          value: toPercent(result.leg_confidence),
                          subtitle: result.is_leg_xray === null ? 'Not evaluated' : (result.is_leg_xray ? 'Leg X-ray' : 'Not leg X-ray')
                        },
                        {
                          key: 'fracture',
                          title: 'Fracture Model',
                          value: toPercent(result.fracture_confidence),
                          subtitle: result.fracture_prediction ?? 'Not evaluated'
                        }
                      ].map((item) => (
                        <div key={item.key} className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">{item.title}</p>
                          <div className="mt-2 flex items-end justify-between gap-3">
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                              {item.value === null ? '--' : `${item.value}%`}
                            </p>
                            <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{item.subtitle}</p>
                          </div>
                          <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all duration-700"
                              style={{ width: `${item.value ?? 0}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {(preview || result.gradcam_image) && (
                    <div className="p-5 sm:p-6 md:p-8 rounded-[20px] sm:rounded-[24px] md:rounded-[32px] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3 mb-5">
                        <ImageIcon size={20} className="text-blue-600" />
                        <h4 className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">
                          Image Bar
                        </h4>
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {preview && (
                          <button
                            type="button"
                            onClick={() => setActiveImage({ src: preview, label: 'Uploaded X-ray' })}
                            className="shrink-0 w-36 h-24 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-900/10 hover:scale-[1.02] transition-transform"
                          >
                            <img src={preview} alt="Uploaded X-ray thumbnail" className="w-full h-full object-cover" />
                          </button>
                        )}
                        {hasFracture && result.gradcam_image && (
                          <button
                            type="button"
                            onClick={() => setActiveImage({ src: result.gradcam_image as string, label: 'XAI Fracture Border (Bone Region)' })}
                            className="shrink-0 w-36 h-24 rounded-xl border-2 border-red-500 overflow-hidden bg-slate-900/10 hover:scale-[1.02] transition-transform"
                          >
                            <img src={result.gradcam_image} alt="XAI thumbnail" className="w-full h-full object-cover" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center pt-4 sm:pt-6">
                    <button
                      onClick={resetAll}
                      className="group inline-flex items-center gap-3 sm:gap-4 px-7 sm:px-10 py-4 sm:py-5 bg-blue-600 text-white font-black rounded-2xl sm:rounded-3xl uppercase tracking-[0.12em] sm:tracking-widest text-xs sm:text-sm transition-all hover:bg-blue-700 shadow-xl shadow-blue-500/20"
                    >
                      New Analyze
                      <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {activeImage && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="relative w-full max-w-5xl">
            <button
              type="button"
              onClick={() => setActiveImage(null)}
              className="absolute -top-12 right-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Close image preview"
            >
              <X size={20} />
            </button>
            <p className="text-white/80 text-sm font-semibold mb-3">{activeImage.label}</p>
            <img
              src={activeImage.src}
              alt={activeImage.label}
              className="w-full max-h-[80vh] object-contain rounded-2xl border border-white/20"
            />
          </div>
        </div>
      )}
    </div>
  );
};



export default Upload;
