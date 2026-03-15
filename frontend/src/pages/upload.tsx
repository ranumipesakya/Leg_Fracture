import React, { useEffect, useRef, useState } from "react";
import PatientNavbar from "../components/PatientNavbar";
import { useAuth } from "../auth/AuthContext";
import { createRecord, deleteRecord, listRecords, type RecordItem } from "../api/recordsApi";

interface UploadedFile {
  id: string;
  name: string;
  category: string;
  size: string;
  status: "Uploaded" | "Processing" | "Verified";
  uploadDate: string;
}

const UploadRecords: React.FC = () => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---------------- FORMATTERS ---------------- */

  const formatDate = (value: string | Date) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const formatDateTime = (value: string | Date) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString();
  };
  const formatOnlyDate = (value: string | Date) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };
  const formatOnlyTime = (value: string | Date) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  const recordToRow = (record: RecordItem): UploadedFile => ({
    id: record.id,
    name: record.name,
    category: record.category,
    size: record.size ? `${(record.size / (1024 * 1024)).toFixed(1)} MB` : "-",
    status: record.status,
    uploadDate: formatDate(record.createdAt),
  });

  /* ---------------- X-RAY CHECK ---------------- */

  const isXrayImage = (file: File) => {
    const name = file.name.toLowerCase();
    const ext = name.split(".").pop() ?? "";

    if (ext === "dcm" || ext === "dicom") return true;

    const isImage = ["jpg", "jpeg", "png"].includes(ext);
    return isImage;
  };

  const isImagingCategory = (category: string) => {
    const normalized = category.trim().toLowerCase();
    return normalized === "x-ray" || normalized === "xray" || normalized === "imaging";
  };

  /* ---------------- LOAD RECORDS ---------------- */

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      const res = await listRecords();

      if (!active) return;

      setIsLoading(false);

      if (!res.ok) {
        setUploadError(res.error);
        return;
      }

      setFiles(res.data.records.map(recordToRow));
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const tick = () => setCurrentTime(new Date());
    const id = window.setInterval(tick, 1000 * 30);
    return () => window.clearInterval(id);
  }, []);

  /* ---------------- DRAG EVENTS ---------------- */

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const processFiles = async (selected: File[]) => {
    setUploadError(null);

    for (const file of selected) {

      if (!isXrayImage(file)) {
        setUploadError("This is not a supported image type. Please upload a valid X-ray image.");
        continue;
      }

      const res = await createRecord({
        name: file.name,
        category: "X-Ray",
        status: "Verified",
        size: file.size,
      });

      if (res.ok) {
        setFiles(prev => [recordToRow(res.data.record), ...prev]);
      } else {
        setUploadError(res.error);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    await processFiles(droppedFiles);
  };

  /* ---------------- INPUT UPLOAD ---------------- */

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;

    await processFiles(selected);
    e.target.value = "";
  };

  /* ---------------- DELETE RECORD ---------------- */

  const handleDelete = async (id: string) => {
    const res = await deleteRecord(id);

    if (!res.ok) {
      setUploadError(res.error);
      return;
    }

    setFiles(prev => prev.filter(file => file.id !== id));
  };

  /* ---------------- STORAGE OVERVIEW ---------------- */

  const reportCount = files.filter(file => file.category.toLowerCase() === "report").length;
  const imagingCount = files.filter(file => isImagingCategory(file.category)).length;

  const totalCount = files.length || 1;

  const reportPercent = Math.round((reportCount / totalCount) * 100);
  const imagingPercent = Math.round((imagingCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-[#F0F7FF] dark:bg-slate-950 font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-300">

      <PatientNavbar currentPage="upload" />

      {/* HEADER */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-12 pb-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between gap-4">

          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Medical Records Vault
            </h1>

            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Securely store and manage your clinical documentation and imaging.
            </p>

            {user?.lastLogin && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                Last login: {formatDateTime(user.lastLogin)}
              </p>
            )}
          </div>

          <div className="flex gap-3">

            <button className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
              Suggest Physiotherapy
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#4A90FF] rounded-lg hover:bg-blue-600"
            >
              Upload X-Ray Image
            </button>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept="image/*,.dcm,.dicom"
              onChange={handleFileInput}
            />

          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* STORAGE OVERVIEW */}
        <aside className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">

          <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">
            Storage Overview
          </h3>

          <div className="mb-6">
            <div className="text-[11px] font-bold text-slate-400 uppercase mb-2">Current Time</div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Date: {formatOnlyDate(currentTime)}
            </div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Time: {formatOnlyTime(currentTime)}
            </div>
          </div>

          <div className="mb-4">

            <div className="flex justify-between text-sm dark:text-slate-300">
              <span>Reports</span>
              <span>{reportCount}</span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded">
              <div className="bg-blue-500 h-full" style={{ width: `${reportPercent}%` }} />
            </div>

          </div>

          <div>

            <div className="flex justify-between text-sm dark:text-slate-300">
              <span>Imaging (X-Ray)</span>
              <span>{imagingCount}</span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded">
              <div className="bg-indigo-500 h-full" style={{ width: `${imagingPercent}%` }} />
            </div>

          </div>

        </aside>

        {/* MAIN CONTENT */}
        <div className="lg:col-span-3 space-y-8">

          {/* DRAG DROP BOX */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            }`}
          >

            <div className="mx-auto w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Upload clinical files
            </h3>

            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Drag and drop your X-ray image here
            </p>

          </div>

          {/* RECORD TABLE */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800 overflow-hidden">

            <table className="w-full">

              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 text-left">Record Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date Added</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="dark:text-slate-300">

                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-slate-400">
                      Loading records...
                    </td>
                  </tr>
                ) : files.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-slate-400">
                      No records uploaded yet
                    </td>
                  </tr>
                ) : (
                  files.map(file => (

                    <tr key={file.id} className="border-t dark:border-slate-800">

                      <td className="px-6 py-4">{file.name}</td>
                      <td className="text-center">{file.category}</td>
                      <td className="text-center">{file.uploadDate}</td>

                      <td className="text-center">
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs">
                          {file.status}
                        </span>
                      </td>

                      <td className="text-right px-6">
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </td>

                    </tr>

                  ))
                )}

              </tbody>

            </table>

            {uploadError && (
              <div className="px-6 py-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 border-t dark:border-slate-800">
                {uploadError}
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
};

export default UploadRecords;
