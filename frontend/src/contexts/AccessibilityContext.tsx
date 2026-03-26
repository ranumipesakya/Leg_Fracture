import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  fontSize: number;
  highContrast: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  keyboardNavigation: boolean;
  setFontSize: (size: number) => void;
  setHighContrast: (active: boolean) => void;
  setColorBlindMode: (mode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia') => void;
  setKeyboardNavigation: (active: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSize] = useState<number>(() => {
    const savedSize = localStorage.getItem('accessibility_font_size');
    return savedSize ? parseInt(savedSize, 10) : 100;
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    const savedContrast = localStorage.getItem('accessibility_high_contrast');
    return savedContrast === 'true';
  });

  const [colorBlindMode, setColorBlindMode] = useState<'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'>(() => {
    const savedMode = localStorage.getItem('accessibility_color_blind_mode');
    return (savedMode as 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia') || 'none';
  });

  const [keyboardNavigation, setKeyboardNavigation] = useState<boolean>(() => {
    const savedKB = localStorage.getItem('accessibility_keyboard_nav');
    return savedKB === 'true';
  });

  useEffect(() => {
    localStorage.setItem('accessibility_font_size', fontSize.toString());
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('accessibility_high_contrast', highContrast.toString());
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('accessibility_color_blind_mode', colorBlindMode);
    document.documentElement.setAttribute('data-color-blind', colorBlindMode);
  }, [colorBlindMode]);

  useEffect(() => {
    localStorage.setItem('accessibility_keyboard_nav', keyboardNavigation.toString());
    if (keyboardNavigation) {
      document.documentElement.classList.add('keyboard-nav');
    } else {
      document.documentElement.classList.remove('keyboard-nav');
    }
  }, [keyboardNavigation]);

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        highContrast,
        colorBlindMode,
        keyboardNavigation,
        setFontSize,
        setHighContrast,
        setColorBlindMode,
        setKeyboardNavigation,
      }}
    >
      {/* SVG Filters for Color Blindness */}
      <svg className="sr-only" aria-hidden="true">
        <defs>
          <filter id="protanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.567, 0.433, 0, 0, 0
                      0.558, 0.442, 0, 0, 0
                      0, 0.242, 0.758, 0, 0
                      0, 0, 0, 1, 0"
            />
          </filter>
          <filter id="deuteranopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.625, 0.375, 0, 0, 0
                      0.7, 0.3, 0, 0, 0
                      0, 0.3, 0.7, 0, 0
                      0, 0, 0, 1, 0"
            />
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.95, 0.05, 0, 0, 0
                      0, 0.433, 0.567, 0, 0
                      0, 0.475, 0.525, 0, 0
                      0, 0, 0, 1, 0"
            />
          </filter>
        </defs>
      </svg>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
