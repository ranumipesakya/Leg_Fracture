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
    const looksLikeXray = name.includes("xray") || name.includes("x-ray");

    return isImage && looksLikeXray;
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
        setUploadError("❌ This is not an X-ray image. Please upload a valid X-ray.");
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
    <div className="min-h-screen bg-[#F0F7FF] font-['Plus_Jakarta_Sans',sans-serif]">

      <PatientNavbar currentPage="upload" />

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 pt-12 pb-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between gap-4">

          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Medical Records Vault
            </h1>

            <p className="text-slate-500 mt-1">
              Securely store and manage your clinical documentation and imaging.
            </p>

            {user?.lastLogin && (
              <p className="text-xs text-slate-400 mt-2">
                Last login: {formatDateTime(user.lastLogin)}
              </p>
            )}
          </div>

          <div className="flex gap-3">

            <button className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
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
              onChange={handleFileInput}
            />

          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* STORAGE OVERVIEW */}
        <aside className="bg-white p-6 rounded-xl border border-slate-200">

          <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">
            Storage Overview
          </h3>

          <div className="mb-4">

            <div className="flex justify-between text-sm">
              <span>Reports</span>
              <span>{reportCount}</span>
            </div>

            <div className="w-full bg-slate-100 h-1.5 rounded">
              <div className="bg-blue-500 h-full" style={{ width: `${reportPercent}%` }} />
            </div>

          </div>

          <div>

            <div className="flex justify-between text-sm">
              <span>Imaging (X-Ray)</span>
              <span>{imagingCount}</span>
            </div>

            <div className="w-full bg-slate-100 h-1.5 rounded">
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
              isDragging ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"
            }`}
          >

            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Upload clinical files
            </h3>

            <p className="text-slate-500 text-sm mt-1">
              Drag and drop your X-ray image here
            </p>

          </div>

          {/* RECORD TABLE */}
          <div className="bg-white rounded-xl border overflow-hidden">

            <table className="w-full">

              <thead className="bg-slate-50 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 text-left">Record Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date Added</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>

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

                    <tr key={file.id} className="border-t">

                      <td className="px-6 py-4">{file.name}</td>
                      <td className="text-center">{file.category}</td>
                      <td className="text-center">{file.uploadDate}</td>

                      <td className="text-center">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
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
              <div className="px-6 py-3 text-sm text-red-600 bg-red-50 border-t">
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