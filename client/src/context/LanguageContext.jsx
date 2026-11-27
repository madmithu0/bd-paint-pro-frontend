import React, { createContext, useState, useEffect, useCallback } from 'react';

export const LanguageContext = createContext(null);

const SUPPORTED_DISTRICTS = [
  'Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh',
  'Cumilla', 'Noakhali', 'Bogura', 'Gazipur', 'Narayanganj', 'Coxs Bazar', 'Jashore', 'Dinajpur',
];

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'bn');
  const [selectedDistrict, setSelectedDistrict] = useState(
    () => localStorage.getItem('selected_district') || 'Dhaka'
  );
  const [dialectVoiceEnabled, setDialectVoiceEnabled] = useState(true);

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
  }, [lang]);

  useEffect(() => {
    if (selectedDistrict) {
      localStorage.setItem('selected_district', selectedDistrict);
    }
  }, [selectedDistrict]);

  const toggleLanguage = useCallback(() => {
    setLang((prev) => (prev === 'bn' ? 'en' : 'bn'));
  }, []);

  const t = useCallback(
    (bnText, enText) => {
      if (lang === 'bn') {
        return bnText || enText || '';
      }
      return enText || bnText || '';
    },
    [lang]
  );

  return (
    <LanguageContext.Provider
      value={{
        lang,
        isBangla: lang === 'bn',
        setLang,
        toggleLanguage,
        selectedDistrict,
        setSelectedDistrict,
        supportedDistricts: SUPPORTED_DISTRICTS,
        dialectVoiceEnabled,
        setDialectVoiceEnabled,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
