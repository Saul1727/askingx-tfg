import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAppConfig } from '../services/configService';

const ConfigContext = createContext(null);

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({
    installationName: 'AskingX',
    platformUrl: 'http://localhost:5173',
    logoUrl: '/favicon.svg'
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const data = await getAppConfig();
      setConfig(data);
      // Actualizar el título de la pestaña del navegador
      document.title = data.installationName;
      // Actualizar el favicon
      const link = document.querySelector("link[rel~='icon']");
      if (link) {
        link.href = data.logoUrl;
      }
    } catch (error) {
      console.error("Error al cargar la configuración global:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, refreshConfig: fetchConfig, isLoading }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
