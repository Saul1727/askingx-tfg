import React, { createContext, useContext, useState, useCallback } from 'react';
import translations from '../i18n/translations';
import { getUser } from '../services/authService';

/**
 * LanguageContext
 * -----------------------------------------------------------------------------
 * Gestiona el idioma de la interfaz (ES / CAT / EN) y expone la función t()
 * que traduce una clave al idioma activo.
 *
 * - El idioma inicial se toma de localStorage; si no, de la preferencia del
 *   usuario logueado; y por defecto, español.
 * - setLang() cambia el idioma y lo recuerda en localStorage (persiste al recargar).
 * - t('seccion.clave') busca la traducción; si falta en el idioma actual cae al
 *   español, y si tampoco existe devuelve la propia clave (para detectar olvidos).
 * -----------------------------------------------------------------------------
 */

const LanguageContext = createContext(null);
const STORAGE_KEY = 'appLanguage';

// Recorre un objeto siguiendo una ruta con puntos: get(obj, 'a.b.c')
const getByPath = (obj, path) =>
  path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || getUser()?.preferredLanguage || 'ES'
  );

  const setLang = useCallback((newLang) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
  }, []);

  const t = useCallback((key) => {
    const current = getByPath(translations[lang], key);
    if (current !== undefined) return current;
    // Respaldo: español y, en última instancia, la propia clave.
    const fallback = getByPath(translations.ES, key);
    return fallback !== undefined ? fallback : key;
  }, [lang]);

  // Traduce el nombre de un dominio temático al idioma activo.
  // Solo conoce los dominios incluidos en el mapa `domains` (los del seed);
  // cualquier dominio creado a mano que no esté en el mapa se devuelve tal cual.
  const translateDomain = useCallback((name) => {
    if (!name) return name;
    const map = translations[lang]?.domains;
    return (map && map[name]) || name;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, translateDomain }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
