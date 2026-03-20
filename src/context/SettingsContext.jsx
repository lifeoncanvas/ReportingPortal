import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'lw_settings';

const DEFAULTS = {
  profile: {
    firstName: 'Global',
    lastName:  'Partnership Manager',
    email:     'global@loveworld.com',
    phone:     '+1 (555) 000-0000',
    role:      'Global Partnership Manager',
    region:    'Global',
    timezone:  'UTC+0',
  },
  security:      { twoFactor: false },
  notifications: {
    reportDue: true, reportSubmitted: true,
    missingSubmit: true, newTemplate: false,
    financeUpdates: true, systemAlerts: true,
  },
  preferences: {
    language:   'English',
    dateFormat: 'MM/DD/YYYY',
    currency:   'USD ($)',
    theme:      'light',
  },
  privacy: {
    activityLogging: true, analyticsTracking: false, profileVisibility: true,
  },
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return DEFAULTS;
    return {
      profile:       { ...DEFAULTS.profile,       ...(parsed.profile       || {}) },
      security:      { ...DEFAULTS.security,       ...(parsed.security      || {}) },
      notifications: { ...DEFAULTS.notifications,  ...(parsed.notifications || {}) },
      preferences:   { ...DEFAULTS.preferences,    ...(parsed.preferences   || {}) },
      privacy:       { ...DEFAULTS.privacy,        ...(parsed.privacy       || {}) },
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return DEFAULTS;
  }
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

// Maps our language names to BCP-47 locale codes
export const LANGUAGE_LOCALE_MAP = {
  'English':    'en-US',
  'French':     'fr-FR',
  'Portuguese': 'pt-BR',
  'Spanish':    'es-ES',
  'Yoruba':     'yo-NG',
};

// Maps our date format labels to format functions
export const DATE_FORMAT_FN = {
  'MM/DD/YYYY': (d) => {
    const dt = d instanceof Date ? d : new Date(d);
    return `${String(dt.getMonth()+1).padStart(2,'0')}/${String(dt.getDate()).padStart(2,'0')}/${dt.getFullYear()}`;
  },
  'DD/MM/YYYY': (d) => {
    const dt = d instanceof Date ? d : new Date(d);
    return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;
  },
  'YYYY-MM-DD': (d) => {
    const dt = d instanceof Date ? d : new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
  },
};

// Maps currency label to symbol
export const CURRENCY_SYMBOL_MAP = {
  'USD ($)': '$',
  'EUR (€)': '€',
  'GBP (£)': '£',
  'NGN (₦)': '₦',
};

// UI string translations
export const TRANSLATIONS = {
  English: {
    dashboard:        'Dashboard',
    reportingPortal:  'Reporting Portal',
    financePortal:    'Finance Portal',
    analytics:        'Analytics',
    auditLogs:        'Audit Logs',
    userManagement:   'User Management',
    welcomeBack:      'Welcome back',
    totalReports:     'Total Reports',
    totalFinance:     'Total Finance',
    totalAttendance:  'Total Attendance',
    completionRate:   'Completion Rate',
    recentActivity:   'Recent Activity',
    settings:         'Settings',
    notifications:    'Notifications',
    signOut:          'Sign Out',
    saveChanges:      'Save Changes',
    cancel:           'Cancel',
    search:           'Search...',
    filters:          'Filters',
    showingReports:   'Showing',
    reports:          'reports',
    submitReport:     'Submit Report',
    addEntry:         'Add Entry',
    uploadCSV:        'Upload CSV/Excel',
  },
  French: {
    dashboard:        'Tableau de Bord',
    reportingPortal:  'Portail de Rapports',
    financePortal:    'Portail Financier',
    analytics:        'Analytique',
    auditLogs:        'Journaux d\'Audit',
    userManagement:   'Gestion des Utilisateurs',
    welcomeBack:      'Bienvenue',
    totalReports:     'Total des Rapports',
    totalFinance:     'Total Financier',
    totalAttendance:  'Présence Totale',
    completionRate:   'Taux d\'Achèvement',
    recentActivity:   'Activité Récente',
    settings:         'Paramètres',
    notifications:    'Notifications',
    signOut:          'Se Déconnecter',
    saveChanges:      'Enregistrer',
    cancel:           'Annuler',
    search:           'Rechercher...',
    filters:          'Filtres',
    showingReports:   'Affichage de',
    reports:          'rapports',
    submitReport:     'Soumettre le Rapport',
    addEntry:         'Ajouter une Entrée',
    uploadCSV:        'Télécharger CSV/Excel',
  },
  Spanish: {
    dashboard:        'Panel Principal',
    reportingPortal:  'Portal de Informes',
    financePortal:    'Portal Financiero',
    analytics:        'Análisis',
    auditLogs:        'Registros de Auditoría',
    userManagement:   'Gestión de Usuarios',
    welcomeBack:      'Bienvenido de nuevo',
    totalReports:     'Total de Informes',
    totalFinance:     'Total Financiero',
    totalAttendance:  'Asistencia Total',
    completionRate:   'Tasa de Finalización',
    recentActivity:   'Actividad Reciente',
    settings:         'Configuración',
    notifications:    'Notificaciones',
    signOut:          'Cerrar Sesión',
    saveChanges:      'Guardar Cambios',
    cancel:           'Cancelar',
    search:           'Buscar...',
    filters:          'Filtros',
    showingReports:   'Mostrando',
    reports:          'informes',
    submitReport:     'Enviar Informe',
    addEntry:         'Agregar Entrada',
    uploadCSV:        'Subir CSV/Excel',
  },
  Portuguese: {
    dashboard:        'Painel',
    reportingPortal:  'Portal de Relatórios',
    financePortal:    'Portal Financeiro',
    analytics:        'Análises',
    auditLogs:        'Registros de Auditoria',
    userManagement:   'Gestão de Usuários',
    welcomeBack:      'Bem-vindo de volta',
    totalReports:     'Total de Relatórios',
    totalFinance:     'Total Financeiro',
    totalAttendance:  'Presença Total',
    completionRate:   'Taxa de Conclusão',
    recentActivity:   'Atividade Recente',
    settings:         'Configurações',
    notifications:    'Notificações',
    signOut:          'Sair',
    saveChanges:      'Salvar Alterações',
    cancel:           'Cancelar',
    search:           'Pesquisar...',
    filters:          'Filtros',
    showingReports:   'Mostrando',
    reports:          'relatórios',
    submitReport:     'Enviar Relatório',
    addEntry:         'Adicionar Entrada',
    uploadCSV:        'Carregar CSV/Excel',
  },
  Yoruba: {
    dashboard:        'Dáṣíbọ́ọ̀dù',
    reportingPortal:  'Ẹ̀bùn Ìjábọ̀',
    financePortal:    'Ẹ̀bùn Ìṣúná',
    analytics:        'Ìtúpalẹ̀',
    auditLogs:        'Àkọsílẹ̀ Àyẹ̀wò',
    userManagement:   'Ìṣàkóso Olùmúlò',
    welcomeBack:      'Ẹ káàbọ̀',
    totalReports:     'Àpapọ̀ Ìjábọ̀',
    totalFinance:     'Àpapọ̀ Ìṣúná',
    totalAttendance:  'Àpapọ̀ Ìjókòó',
    completionRate:   'Ìpele Ìparí',
    recentActivity:   'Ìgbésẹ̀ Àìpẹ́',
    settings:         'Ìtòlẹ́sẹẹsẹ',
    notifications:    'Ìfitónilétí',
    signOut:          'Jáde',
    saveChanges:      'Tọ́jú Àyípadà',
    cancel:           'Fagilé',
    search:           'Wá...',
    filters:          'Àṣàyàn',
    showingReports:   'Ìfihàn',
    reports:          'ìjábọ̀',
    submitReport:     'Fi Ìjábọ̀ Sílẹ̀',
    addEntry:         'Ṣàfikún Ìforúkọsílẹ̀',
    uploadCSV:        'Gbé CSV/Excel Sórí',
  },
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const loaded = loadSettings();
    applyTheme(loaded.preferences.theme);
    return loaded;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    applyTheme(settings.preferences.theme);
  }, [settings.preferences.theme]);

  useEffect(() => {
    if (settings.preferences.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [settings.preferences.theme]);

  const updateSection = (section, values) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], ...values },
    }));
  };

  // Convenience helpers derived from preferences
  const language   = settings.preferences.language   || 'English';
  const dateFormat = settings.preferences.dateFormat || 'MM/DD/YYYY';
  const currency   = settings.preferences.currency   || 'USD ($)';

  const t          = TRANSLATIONS[language] || TRANSLATIONS.English;
  const formatDate = DATE_FORMAT_FN[dateFormat] || DATE_FORMAT_FN['MM/DD/YYYY'];
  const currSymbol = CURRENCY_SYMBOL_MAP[currency] || '$';

  return (
    <SettingsContext.Provider value={{
      settings, updateSection,
      t, formatDate, currSymbol, language, dateFormat, currency,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}