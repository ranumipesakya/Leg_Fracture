import React, { useState } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { 
  Type, 
  Contrast, 
  Eye, 
  Keyboard, 
  X,
  Settings
} from 'lucide-react';

const AccessibilityToolbar: React.FC = () => {
  const { 
    fontSize, 
    setFontSize, 
    highContrast, 
    setHighContrast, 
    colorBlindMode, 
    setColorBlindMode,
    keyboardNavigation,
    setKeyboardNavigation
  } = useAccessibility();

  const [isOpen, setIsOpen] = useState(false);

  const increaseFontSize = () => setFontSize(Math.min(fontSize + 10, 150));
  const decreaseFontSize = () => setFontSize(Math.max(fontSize - 10, 80));
  const resetFontSize = () => setFontSize(100);

  const colorBlindOptions: { label: string; value: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' }[] = [
    { label: 'Normal', value: 'none' },
    { label: 'Protanopia', value: 'protanopia' },
    { label: 'Deuteranopia', value: 'deuteranopia' },
    { label: 'Tritanopia', value: 'tritanopia' },
  ];

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed left-0 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-3 rounded-r-xl shadow-lg hover:bg-blue-700 transition-all z-[9999]"
        aria-label="Open Accessibility Menu"
      >
        <Settings className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed left-0 top-1/4 bottom-1/4 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl z-[9999] overflow-y-auto rounded-r-2xl transition-all animate-in slide-in-from-left duration-300">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          Accessibility
        </h2>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 space-y-8">
        {/* Font Size */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
            <Type className="w-4 h-4" />
            FONT SIZE ({fontSize}%)
          </label>
          <div className="flex items-center gap-2">
            <button 
              onClick={decreaseFontSize}
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-bold"
              aria-label="Decrease font size"
            >
              A-
            </button>
            <button 
              onClick={resetFontSize}
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
              aria-label="Reset font size"
            >
              Reset
            </button>
            <button 
              onClick={increaseFontSize}
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-bold"
              aria-label="Increase font size"
            >
              A+
            </button>
          </div>
        </div>

        {/* High Contrast */}
        <div className="space-y-4">
          <label className="flex items-center justify-between text-sm font-semibold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <Contrast className="w-4 h-4" />
              HIGH CONTRAST
            </span>
            <div 
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${highContrast ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              onClick={() => setHighContrast(!highContrast)}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${highContrast ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
          </label>
        </div>

        {/* Color Blind Mode */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
            <Eye className="w-4 h-4" />
            COLOR BLIND MODE
          </label>
          <div className="grid grid-cols-1 gap-2">
            {colorBlindOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setColorBlindMode(opt.value)}
                className={`text-left px-4 py-2 rounded-lg transition-all border-2 ${
                  colorBlindMode === opt.value 
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                  : 'border-transparent bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Keyboard Friendly */}
        <div className="space-y-4">
          <label className="flex items-center justify-between text-sm font-semibold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              KEYBOARD FOCUS HELP
            </span>
            <div 
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${keyboardNavigation ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              onClick={() => setKeyboardNavigation(!keyboardNavigation)}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${keyboardNavigation ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
          </label>
          <p className="text-xs text-slate-400">Adds visual indicators for keyboard focused elements.</p>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityToolbar;
