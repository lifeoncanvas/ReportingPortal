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
    const raw = sessionStorage.getItem(STORAGE_KEY);
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
    sessionStorage.removeItem(STORAGE_KEY);
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
    // Nav
    dashboard: 'Dashboard', reportingPortal: 'Reporting Portal',
    financePortal: 'Finance Portal', analytics: 'Analytics',
    auditLogs: 'Audit Logs', userManagement: 'User Management',
    magazine: 'Magazine', notifications: 'Notifications', settings: 'Settings',
    // Welcome
    welcomeBack: 'Welcome back', today: 'Today',
    weeklyReminderTitle: 'Weekly Report Reminder',
    weeklyReminderDesc: "Don't forget to submit your weekly report by end of day Thursday.",
    // KPI
    totalReports: 'Total Reports', totalFinance: 'Total Finance',
    totalAttendance: 'Total Attendance', completionRate: 'Completion Rate',
    newMembers: 'New Members', avgAttendance: 'Avg. Attendance',
    // Table / actions
    recentActivity: 'Recent Activity', search: 'Search...',
    filters: 'Filters', showingReports: 'Showing', reports: 'reports',
    submitReport: 'Submit Report', addEntry: 'Add Entry',
    uploadCSV: 'Upload CSV/Excel', export: 'Export',
    view: 'View', download: 'Download', actions: 'Actions',
    status: 'Status', date: 'Date', region: 'Region', zone: 'Zone',
    campaign: 'Campaign', submittedBy: 'Submitted By', attendance: 'Attendance',
    notes: 'Notes', reportId: 'Report ID',
    // Finance
    totalRecords: 'Total Records', totalAmount: 'Total Amount',
    avgAmount: 'Average Amount', category: 'Category', amount: 'Amount',
    entryId: 'Entry ID',
    // Audit
    totalActivities: 'Total Activities', activeUsers: 'Active Users',
    modules: 'Modules', user: 'User', action: 'Action',
    module: 'Module', previousValue: 'Previous Value', updatedValue: 'Updated Value',
    timestamp: 'Timestamp',
    // Auth
    signOut: 'Sign Out', signIn: 'Sign In', signUp: 'Sign Up',
    email: 'Email', password: 'Password', fullName: 'Full Name',
    // Misc
    saveChanges: 'Save Changes', cancel: 'Cancel', close: 'Close',
    placeOrder: 'Place Order', backToOrders: 'Back to Orders',
    campaignPerformance: 'Campaign Performance',
    monthlyTrends: 'Monthly Trends', regionStats: 'Region-wise Statistics',
    analyticsDashboard: 'Analytics Dashboard',
    attendanceTrend: 'Attendance Trend', financeTrend: 'Finance Trend',
    regionalComparison: 'Regional Comparison', campaignDistribution: 'Campaign Distribution',
    attendanceSummary: 'Attendance Summary by Region', timeRange: 'Time Range',
    markAllRead: 'Mark All as Read',
    all: 'All', unread: 'Unread', new: 'New',
    noNotifications: 'No notifications', markAsRead: 'Mark as read',
    // Settings
    settingsTitle: 'Settings', settingsDesc: 'Manage your account preferences and configuration',
    profile: 'Profile', security: 'Security', preferences: 'Preferences', privacy: 'Privacy',
    profileInfo: 'Profile Information', profileInfoDesc: 'Update your personal details and contact information',
    firstName: 'First Name', lastName: 'Last Name', emailAddress: 'Email Address',
    phoneNumber: 'Phone Number', timezone: 'Timezone', role: 'Role', region: 'Region',
    changePhoto: 'Change Photo', remove: 'Remove',
    securityTitle: 'Security', securityDesc: 'Manage your password and account security',
    changePassword: 'Change Password', currentPassword: 'Current Password',
    newPassword: 'New Password', confirmPassword: 'Confirm Password',
    updatePassword: 'Update Password', twoFactor: 'Two-Factor Authentication',
    twoFactorDesc: 'Add an extra layer of security to your account.',
    enable2FA: 'Enable 2FA', enabled: 'Enabled', disabled: 'Disabled',
    activeSessions: 'Active Sessions', activeSessionsDesc: 'Devices currently signed into your account.',
    current: 'Current', revoke: 'Revoke',
    notifPrefs: 'Notification Preferences', notifPrefsDesc: 'Choose what you want to be notified about',
    savePreferences: 'Save Preferences',
    preferencesTitle: 'Preferences', preferencesDesc: 'Customize your platform experience',
    display: 'Display', language: 'Language', dateFormat: 'Date Format', currency: 'Currency',
    theme: 'Theme', themeDesc: 'Changes apply instantly across the entire app.',
    light: 'Light', dark: 'Dark', system: 'System',
    privacyTitle: 'Privacy', privacyDesc: 'Control your data and privacy settings',
    dataActivity: 'Data & Activity', dangerZone: 'Danger Zone',
    dangerZoneDesc: 'These actions are permanent and cannot be undone.',
    deleteAccount: 'Delete Account', deleteAccountDesc: 'Permanently delete your account and all associated data',
    activityLogging: 'Activity logging', activityLoggingDesc: 'Allow the platform to log your activity for audit purposes',
    analyticsTracking: 'Analytics tracking', analyticsTrackingDesc: 'Share anonymous usage data to help improve the platform',
    profileVisibility: 'Profile visibility', profileVisibilityDesc: 'Allow other users in your region to view your profile',
    financePortalTitle: 'Finance Portal', reportingPortalTitle: 'Reporting Portal',
    auditLogsTitle: 'Audit Logs',
  },
  French: {
    dashboard: 'Tableau de Bord', reportingPortal: 'Portail de Rapports',
    financePortal: 'Portail Financier', analytics: 'Analytique',
    auditLogs: "Journaux d'Audit", userManagement: 'Gestion des Utilisateurs',
    magazine: 'Magazine', notifications: 'Notifications', settings: 'Paramètres',
    welcomeBack: 'Bienvenue', today: "Aujourd'hui",
    weeklyReminderTitle: 'Rappel de Rapport Hebdomadaire',
    weeklyReminderDesc: "N'oubliez pas de soumettre votre rapport hebdomadaire avant jeudi.",
    totalReports: 'Total des Rapports', totalFinance: 'Total Financier',
    totalAttendance: 'Présence Totale', completionRate: "Taux d'Achèvement",
    newMembers: 'Nouveaux Membres', avgAttendance: 'Présence Moy.',
    recentActivity: 'Activité Récente', search: 'Rechercher...',
    filters: 'Filtres', showingReports: 'Affichage de', reports: 'rapports',
    submitReport: 'Soumettre le Rapport', addEntry: 'Ajouter une Entrée',
    uploadCSV: 'Télécharger CSV/Excel', export: 'Exporter',
    view: 'Voir', download: 'Télécharger', actions: 'Actions',
    status: 'Statut', date: 'Date', region: 'Région', zone: 'Zone',
    campaign: 'Campagne', submittedBy: 'Soumis Par', attendance: 'Présence',
    notes: 'Notes', reportId: 'ID Rapport',
    totalRecords: 'Total des Enregistrements', totalAmount: 'Montant Total',
    avgAmount: 'Montant Moyen', category: 'Catégorie', amount: 'Montant',
    entryId: 'ID Entrée',
    totalActivities: 'Total des Activités', activeUsers: 'Utilisateurs Actifs',
    modules: 'Modules', user: 'Utilisateur', action: 'Action',
    module: 'Module', previousValue: 'Valeur Précédente', updatedValue: 'Valeur Mise à Jour',
    timestamp: 'Horodatage',
    signOut: 'Se Déconnecter', signIn: 'Se Connecter', signUp: "S'inscrire",
    email: 'E-mail', password: 'Mot de passe', fullName: 'Nom Complet',
    saveChanges: 'Enregistrer', cancel: 'Annuler', close: 'Fermer',
    placeOrder: 'Passer Commande', backToOrders: 'Retour aux Commandes',
    campaignPerformance: 'Performance des Campagnes',
    monthlyTrends: 'Tendances Mensuelles', regionStats: 'Statistiques Régionales',
    analyticsDashboard: 'Tableau Analytique',
    attendanceTrend: 'Tendance de Présence', financeTrend: 'Tendance Financière',
    regionalComparison: 'Comparaison Régionale', campaignDistribution: 'Distribution des Campagnes',
    attendanceSummary: 'Résumé de Présence par Région', timeRange: 'Période',
    markAllRead: 'Tout Marquer comme Lu',
    all: 'Tout', unread: 'Non lu', new: 'Nouveau',
    noNotifications: 'Aucune notification', markAsRead: 'Marquer comme lu',
    settingsTitle: 'Paramètres', settingsDesc: 'Gérez vos préférences et configuration',
    profile: 'Profil', security: 'Sécurité', preferences: 'Préférences', privacy: 'Confidentialité',
    profileInfo: 'Informations du Profil', profileInfoDesc: 'Mettez à jour vos coordonnées',
    firstName: 'Prénom', lastName: 'Nom de Famille', emailAddress: 'Adresse E-mail',
    phoneNumber: 'Numéro de Téléphone', timezone: 'Fuseau Horaire', role: 'Rôle', region: 'Région',
    changePhoto: 'Changer la Photo', remove: 'Supprimer',
    securityTitle: 'Sécurité', securityDesc: 'Gérez votre mot de passe et la sécurité',
    changePassword: 'Changer le Mot de Passe', currentPassword: 'Mot de Passe Actuel',
    newPassword: 'Nouveau Mot de Passe', confirmPassword: 'Confirmer le Mot de Passe',
    updatePassword: 'Mettre à Jour le Mot de Passe', twoFactor: 'Authentification à Deux Facteurs',
    twoFactorDesc: 'Ajoutez une couche de sécurité supplémentaire.',
    enable2FA: 'Activer 2FA', enabled: 'Activé', disabled: 'Désactivé',
    activeSessions: 'Sessions Actives', activeSessionsDesc: 'Appareils connectés à votre compte.',
    current: 'Actuel', revoke: 'Révoquer',
    notifPrefs: 'Préférences de Notification', notifPrefsDesc: 'Choisissez ce dont vous voulez être notifié',
    savePreferences: 'Enregistrer les Préférences',
    preferencesTitle: 'Préférences', preferencesDesc: 'Personnalisez votre expérience',
    display: 'Affichage', language: 'Langue', dateFormat: 'Format de Date', currency: 'Devise',
    theme: 'Thème', themeDesc: 'Les changements s\'appliquent instantanément.',
    light: 'Clair', dark: 'Sombre', system: 'Système',
    privacyTitle: 'Confidentialité', privacyDesc: 'Contrôlez vos données et paramètres de confidentialité',
    dataActivity: 'Données et Activité', dangerZone: 'Zone Dangereuse',
    dangerZoneDesc: 'Ces actions sont permanentes et irréversibles.',
    deleteAccount: 'Supprimer le Compte', deleteAccountDesc: 'Supprimez définitivement votre compte',
    activityLogging: 'Journal d\'activité', activityLoggingDesc: 'Permettre à la plateforme de journaliser votre activité',
    analyticsTracking: 'Suivi analytique', analyticsTrackingDesc: 'Partager des données d\'utilisation anonymes',
    profileVisibility: 'Visibilité du profil', profileVisibilityDesc: 'Permettre aux autres utilisateurs de voir votre profil',
    financePortalTitle: 'Portail Financier', reportingPortalTitle: 'Portail de Rapports',
    auditLogsTitle: "Journaux d'Audit",
  },
  Spanish: {
    dashboard: 'Panel Principal', reportingPortal: 'Portal de Informes',
    financePortal: 'Portal Financiero', analytics: 'Análisis',
    auditLogs: 'Registros de Auditoría', userManagement: 'Gestión de Usuarios',
    magazine: 'Revista', notifications: 'Notificaciones', settings: 'Configuración',
    welcomeBack: 'Bienvenido de nuevo', today: 'Hoy',
    weeklyReminderTitle: 'Recordatorio de Informe Semanal',
    weeklyReminderDesc: 'No olvides enviar tu informe semanal antes del jueves.',
    totalReports: 'Total de Informes', totalFinance: 'Total Financiero',
    totalAttendance: 'Asistencia Total', completionRate: 'Tasa de Finalización',
    newMembers: 'Nuevos Miembros', avgAttendance: 'Asistencia Prom.',
    recentActivity: 'Actividad Reciente', search: 'Buscar...',
    filters: 'Filtros', showingReports: 'Mostrando', reports: 'informes',
    submitReport: 'Enviar Informe', addEntry: 'Agregar Entrada',
    uploadCSV: 'Subir CSV/Excel', export: 'Exportar',
    view: 'Ver', download: 'Descargar', actions: 'Acciones',
    status: 'Estado', date: 'Fecha', region: 'Región', zone: 'Zona',
    campaign: 'Campaña', submittedBy: 'Enviado Por', attendance: 'Asistencia',
    notes: 'Notas', reportId: 'ID Informe',
    totalRecords: 'Total de Registros', totalAmount: 'Monto Total',
    avgAmount: 'Monto Promedio', category: 'Categoría', amount: 'Monto',
    entryId: 'ID Entrada',
    totalActivities: 'Total de Actividades', activeUsers: 'Usuarios Activos',
    modules: 'Módulos', user: 'Usuario', action: 'Acción',
    module: 'Módulo', previousValue: 'Valor Anterior', updatedValue: 'Valor Actualizado',
    timestamp: 'Marca de Tiempo',
    signOut: 'Cerrar Sesión', signIn: 'Iniciar Sesión', signUp: 'Registrarse',
    email: 'Correo', password: 'Contraseña', fullName: 'Nombre Completo',
    saveChanges: 'Guardar Cambios', cancel: 'Cancelar', close: 'Cerrar',
    placeOrder: 'Realizar Pedido', backToOrders: 'Volver a Pedidos',
    campaignPerformance: 'Rendimiento de Campañas',
    monthlyTrends: 'Tendencias Mensuales', regionStats: 'Estadísticas Regionales',
    analyticsDashboard: 'Panel Analítico',
    attendanceTrend: 'Tendencia de Asistencia', financeTrend: 'Tendencia Financiera',
    regionalComparison: 'Comparación Regional', campaignDistribution: 'Distribución de Campañas',
    attendanceSummary: 'Resumen de Asistencia por Región', timeRange: 'Período',
    markAllRead: 'Marcar Todo como Leído',
    all: 'Todo', unread: 'No leído', new: 'Nuevo',
    noNotifications: 'Sin notificaciones', markAsRead: 'Marcar como leído',
    settingsTitle: 'Configuración', settingsDesc: 'Administra tus preferencias y configuración',
    profile: 'Perfil', security: 'Seguridad', preferences: 'Preferencias', privacy: 'Privacidad',
    profileInfo: 'Información del Perfil', profileInfoDesc: 'Actualiza tus datos personales',
    firstName: 'Nombre', lastName: 'Apellido', emailAddress: 'Correo Electrónico',
    phoneNumber: 'Número de Teléfono', timezone: 'Zona Horaria', role: 'Rol', region: 'Región',
    changePhoto: 'Cambiar Foto', remove: 'Eliminar',
    securityTitle: 'Seguridad', securityDesc: 'Administra tu contraseña y seguridad',
    changePassword: 'Cambiar Contraseña', currentPassword: 'Contraseña Actual',
    newPassword: 'Nueva Contraseña', confirmPassword: 'Confirmar Contraseña',
    updatePassword: 'Actualizar Contraseña', twoFactor: 'Autenticación de Dos Factores',
    twoFactorDesc: 'Añade una capa extra de seguridad.',
    enable2FA: 'Activar 2FA', enabled: 'Activado', disabled: 'Desactivado',
    activeSessions: 'Sesiones Activas', activeSessionsDesc: 'Dispositivos conectados a tu cuenta.',
    current: 'Actual', revoke: 'Revocar',
    notifPrefs: 'Preferencias de Notificación', notifPrefsDesc: 'Elige sobre qué quieres ser notificado',
    savePreferences: 'Guardar Preferencias',
    preferencesTitle: 'Preferencias', preferencesDesc: 'Personaliza tu experiencia',
    display: 'Pantalla', language: 'Idioma', dateFormat: 'Formato de Fecha', currency: 'Moneda',
    theme: 'Tema', themeDesc: 'Los cambios se aplican instantáneamente.',
    light: 'Claro', dark: 'Oscuro', system: 'Sistema',
    privacyTitle: 'Privacidad', privacyDesc: 'Controla tus datos y configuración de privacidad',
    dataActivity: 'Datos y Actividad', dangerZone: 'Zona de Peligro',
    dangerZoneDesc: 'Estas acciones son permanentes e irreversibles.',
    deleteAccount: 'Eliminar Cuenta', deleteAccountDesc: 'Elimina permanentemente tu cuenta',
    activityLogging: 'Registro de actividad', activityLoggingDesc: 'Permitir que la plataforma registre tu actividad',
    analyticsTracking: 'Seguimiento analítico', analyticsTrackingDesc: 'Compartir datos de uso anónimos',
    profileVisibility: 'Visibilidad del perfil', profileVisibilityDesc: 'Permitir que otros usuarios vean tu perfil',
    financePortalTitle: 'Portal Financiero', reportingPortalTitle: 'Portal de Informes',
    auditLogsTitle: 'Registros de Auditoría',
  },
  Portuguese: {
    dashboard: 'Painel', reportingPortal: 'Portal de Relatórios',
    financePortal: 'Portal Financeiro', analytics: 'Análises',
    auditLogs: 'Registros de Auditoria', userManagement: 'Gestão de Usuários',
    magazine: 'Revista', notifications: 'Notificações', settings: 'Configurações',
    welcomeBack: 'Bem-vindo de volta', today: 'Hoje',
    weeklyReminderTitle: 'Lembrete de Relatório Semanal',
    weeklyReminderDesc: 'Não se esqueça de enviar seu relatório semanal até quinta-feira.',
    totalReports: 'Total de Relatórios', totalFinance: 'Total Financeiro',
    totalAttendance: 'Presença Total', completionRate: 'Taxa de Conclusão',
    newMembers: 'Novos Membros', avgAttendance: 'Presença Méd.',
    recentActivity: 'Atividade Recente', search: 'Pesquisar...',
    filters: 'Filtros', showingReports: 'Mostrando', reports: 'relatórios',
    submitReport: 'Enviar Relatório', addEntry: 'Adicionar Entrada',
    uploadCSV: 'Carregar CSV/Excel', export: 'Exportar',
    view: 'Ver', download: 'Baixar', actions: 'Ações',
    status: 'Status', date: 'Data', region: 'Região', zone: 'Zona',
    campaign: 'Campanha', submittedBy: 'Enviado Por', attendance: 'Presença',
    notes: 'Notas', reportId: 'ID Relatório',
    totalRecords: 'Total de Registros', totalAmount: 'Valor Total',
    avgAmount: 'Valor Médio', category: 'Categoria', amount: 'Valor',
    entryId: 'ID Entrada',
    totalActivities: 'Total de Atividades', activeUsers: 'Usuários Ativos',
    modules: 'Módulos', user: 'Usuário', action: 'Ação',
    module: 'Módulo', previousValue: 'Valor Anterior', updatedValue: 'Valor Atualizado',
    timestamp: 'Carimbo de Tempo',
    signOut: 'Sair', signIn: 'Entrar', signUp: 'Cadastrar',
    email: 'E-mail', password: 'Senha', fullName: 'Nome Completo',
    saveChanges: 'Salvar Alterações', cancel: 'Cancelar', close: 'Fechar',
    placeOrder: 'Fazer Pedido', backToOrders: 'Voltar aos Pedidos',
    campaignPerformance: 'Desempenho de Campanhas',
    monthlyTrends: 'Tendências Mensais', regionStats: 'Estatísticas Regionais',
    analyticsDashboard: 'Painel Analítico',
    attendanceTrend: 'Tendência de Presença', financeTrend: 'Tendência Financeira',
    regionalComparison: 'Comparação Regional', campaignDistribution: 'Distribuição de Campanhas',
    attendanceSummary: 'Resumo de Presença por Região', timeRange: 'Período',
    markAllRead: 'Marcar Tudo como Lido',
    all: 'Tudo', unread: 'Não lido', new: 'Novo',
    noNotifications: 'Sem notificações', markAsRead: 'Marcar como lido',
    settingsTitle: 'Configurações', settingsDesc: 'Gerencie suas preferências e configuração',
    profile: 'Perfil', security: 'Segurança', preferences: 'Preferências', privacy: 'Privacidade',
    profileInfo: 'Informações do Perfil', profileInfoDesc: 'Atualize seus dados pessoais',
    firstName: 'Nome', lastName: 'Sobrenome', emailAddress: 'Endereço de E-mail',
    phoneNumber: 'Número de Telefone', timezone: 'Fuso Horário', role: 'Função', region: 'Região',
    changePhoto: 'Alterar Foto', remove: 'Remover',
    securityTitle: 'Segurança', securityDesc: 'Gerencie sua senha e segurança',
    changePassword: 'Alterar Senha', currentPassword: 'Senha Atual',
    newPassword: 'Nova Senha', confirmPassword: 'Confirmar Senha',
    updatePassword: 'Atualizar Senha', twoFactor: 'Autenticação de Dois Fatores',
    twoFactorDesc: 'Adicione uma camada extra de segurança.',
    enable2FA: 'Ativar 2FA', enabled: 'Ativado', disabled: 'Desativado',
    activeSessions: 'Sessões Ativas', activeSessionsDesc: 'Dispositivos conectados à sua conta.',
    current: 'Atual', revoke: 'Revogar',
    notifPrefs: 'Preferências de Notificação', notifPrefsDesc: 'Escolha sobre o que deseja ser notificado',
    savePreferences: 'Salvar Preferências',
    preferencesTitle: 'Preferências', preferencesDesc: 'Personalize sua experiência',
    display: 'Exibição', language: 'Idioma', dateFormat: 'Formato de Data', currency: 'Moeda',
    theme: 'Tema', themeDesc: 'As alterações se aplicam instantaneamente.',
    light: 'Claro', dark: 'Escuro', system: 'Sistema',
    privacyTitle: 'Privacidade', privacyDesc: 'Controle seus dados e configurações de privacidade',
    dataActivity: 'Dados e Atividade', dangerZone: 'Zona de Perigo',
    dangerZoneDesc: 'Essas ações são permanentes e irreversíveis.',
    deleteAccount: 'Excluir Conta', deleteAccountDesc: 'Exclua permanentemente sua conta',
    activityLogging: 'Registro de atividade', activityLoggingDesc: 'Permitir que a plataforma registre sua atividade',
    analyticsTracking: 'Rastreamento analítico', analyticsTrackingDesc: 'Compartilhar dados de uso anônimos',
    profileVisibility: 'Visibilidade do perfil', profileVisibilityDesc: 'Permitir que outros usuários vejam seu perfil',
    financePortalTitle: 'Portal Financeiro', reportingPortalTitle: 'Portal de Relatórios',
    auditLogsTitle: 'Registros de Auditoria',
  },
  Yoruba: { reportingPortal: 'Ẹ̀bùn Ìjábọ̀',
    financePortal: 'Ẹ̀bùn Ìṣúná', analytics: 'Ìtúpalẹ̀',
    auditLogs: 'Àkọsílẹ̀ Àyẹ̀wò', userManagement: 'Ìṣàkóso Olùmúlò',
    magazine: 'Ìwé Ìròyìn', notifications: 'Ìfitónilétí', settings: 'Ìtòlẹ́sẹẹsẹ',
    welcomeBack: 'Ẹ káàbọ̀', today: 'Òní',
    weeklyReminderTitle: 'Ìránlétí Ìjábọ̀ Ọ̀sẹ̀',
    weeklyReminderDesc: 'Má gbàgbé láti fi ìjábọ̀ rẹ sílẹ̀ ṣáájú ọjọ́ Ẹtì.',
    totalReports: 'Àpapọ̀ Ìjábọ̀', totalFinance: 'Àpapọ̀ Ìṣúná',
    totalAttendance: 'Àpapọ̀ Ìjókòó', completionRate: 'Ìpele Ìparí',
    newMembers: 'Àwọn Ọmọ Tuntun', avgAttendance: 'Ìjókòó Àárọ̀',
    recentActivity: 'Ìgbésẹ̀ Àìpẹ́', search: 'Wá...',
    filters: 'Àṣàyàn', showingReports: 'Ìfihàn', reports: 'ìjábọ̀',
    submitReport: 'Fi Ìjábọ̀ Sílẹ̀', addEntry: 'Ṣàfikún Ìforúkọsílẹ̀',
    uploadCSV: 'Gbé CSV/Excel Sórí', export: 'Gbé Jáde',
    view: 'Wò', download: 'Gba', actions: 'Ìgbésẹ̀',
    status: 'Ipò', date: 'Ọjọ́', region: 'Àgbègbè', zone: 'Àgbègbè Kékeré',
    campaign: 'Ìpolongo', submittedBy: 'Tí a Fi Sílẹ̀ Látọwọ́', attendance: 'Ìjókòó',
    notes: 'Àkọsílẹ̀', reportId: 'Nọ́mbà Ìjábọ̀',
    totalRecords: 'Àpapọ̀ Àkọsílẹ̀', totalAmount: 'Àpapọ̀ Owó',
    avgAmount: 'Owó Àárọ̀', category: 'Ẹ̀ka', amount: 'Owó',
    entryId: 'Nọ́mbà Ìforúkọsílẹ̀',
    totalActivities: 'Àpapọ̀ Ìgbésẹ̀', activeUsers: 'Àwọn Olùmúlò Tó Ń Ṣiṣẹ́',
    modules: 'Àwọn Ẹ̀ka', user: 'Olùmúlò', action: 'Ìgbésẹ̀',
    module: 'Ẹ̀ka', previousValue: 'Iye Tẹ́lẹ̀', updatedValue: 'Iye Tuntun',
    timestamp: 'Àkókò',
    signOut: 'Jáde', signIn: 'Wọlé', signUp: 'Forúkọsílẹ̀',
    email: 'Ímeèlì', password: 'Ọ̀rọ̀ Aṣínà', fullName: 'Orúkọ Kíkún',
    saveChanges: 'Tọ́jú Àyípadà', cancel: 'Fagilé', close: 'Pa',
    placeOrder: 'Ṣe Àṣẹ', backToOrders: 'Padà sí Àwọn Àṣẹ',
    campaignPerformance: 'Ìṣẹ́ Ìpolongo',
    monthlyTrends: 'Ìṣòro Oṣooṣù', regionStats: 'Ìṣirò Àgbègbè',
    analyticsDashboard: 'Dáṣíbọ́ọ̀dù Ìtúpalẹ̀',
    attendanceTrend: 'Ìṣòro Ìjókòó', financeTrend: 'Ìṣòro Ìṣúná',
    regionalComparison: 'Ìfiwéra Àgbègbè', campaignDistribution: 'Ìpínpín Ìpolongo',
    attendanceSummary: 'Àkópọ̀ Ìjókòó Látọwọ́ Àgbègbè', timeRange: 'Àkókò',
    markAllRead: 'Samisi Gbogbo Gẹ́gẹ́ bí a ti Kà',
    all: 'Gbogbo', unread: 'Ti a Kò Kà', new: 'Tuntun',
    noNotifications: 'Kò sí Ìfitónilétí', markAsRead: 'Samisi Gẹ́gẹ́ bí a ti Kà',
    settingsTitle: 'Ìtòlẹ́sẹẹsẹ', settingsDesc: 'Saré àwọn ìfẹ́ rẹ àti ìtò rẹ',
    profile: 'Ìwọ̀ Araọn', security: 'Àbò', preferences: 'Ìfẹ́ Araọn', privacy: 'Àṣírì',
    profileInfo: 'Ìtọmọ Ìwọ̀ Araọn', profileInfoDesc: 'Mọ ìtọmọ araọn rẹ ṣínsin',
    firstName: 'Orúkọ Àkọ́kọ́', lastName: 'Orúkọ Idí', emailAddress: 'Àdírèsì Ímeèlì',
    phoneNumber: 'Nọ́mbà Fónù', timezone: 'Àkókò Àgbègbè', role: 'Ọ̀nà', region: 'Àgbègbè',
    changePhoto: 'Yi Awọ̀ràn Pàdà', remove: 'Yọ̀ Kú̀',
    securityTitle: 'Àbò', securityDesc: 'Saré ọ̀rọ̀ aṣínà rẹ àti àbò',
    changePassword: 'Yi Ọ̀rọ̀ Aṣínà Pàdà', currentPassword: 'Ọ̀rọ̀ Aṣínà Télẹ̀',
    newPassword: 'Ọ̀rọ̀ Aṣínà Tuntun', confirmPassword: 'Jẹ́rẹ̀ Ọ̀rọ̀ Aṣínà',
    updatePassword: 'Mọ Ọ̀rọ̀ Aṣínà Ṣínsin', twoFactor: 'Àmòjú-Èjò Ìjẹ́ríisi',
    twoFactorDesc: 'Fi àbò àárọ̀ kun sí àkóóùnù rẹ.',
    enable2FA: 'Mu 2FA Ṣiṣẹ́', enabled: 'Ti Mu Ṣiṣẹ́', disabled: 'Ti Pa',
    activeSessions: 'Àwọn Ìpade Tó Ń Ṣiṣẹ́', activeSessionsDesc: 'Àwọn ìrò tó wọlé sí àkóùnù rẹ.',
    current: 'Tó Wa', revoke: 'Fágilé',
    notifPrefs: 'Ìfẹ́ Ìfitónilétí', notifPrefsDesc: 'Yàn ohun tó fẹ́ jẹ́ kí a fi tónilétí rẹ',
    savePreferences: 'Tọ́jú Ìfẹ́',
    preferencesTitle: 'Ìfẹ́ Araọn', preferencesDesc: 'Saré ìríà rẹ lárí ìlànà rẹ',
    display: 'Ìfihàn', language: 'Èdè', dateFormat: 'Àrútó Ọjọ́', currency: 'Owó Orílẹ̀èdè',
    theme: 'Àrútó Ìwọ̀', themeDesc: 'Àyípadà mà waye lẹ́sẹ̀kẹ́sẹ̀.',
    light: 'Àìmọ̀lé', dark: 'Òkùtù', system: 'Èrò Nàà',
    privacyTitle: 'Àṣírì', privacyDesc: 'Saré àwọn data rẹ àti àṣírì',
    dataActivity: 'Data àti Ìgbésẹ̀', dangerZone: 'Àgbègbè Îwú',
    dangerZoneDesc: 'Àwọn ìgbésẹ̀ wọ̀nyí jẹ́ dédé kó sí àṣé ìpadà.',
    deleteAccount: 'Pa Àkóùnù Rẹ̀', deleteAccountDesc: 'Pa àkóùnù rẹ ré máá láérí',
    activityLogging: 'Ìgbànà Ìgbésẹ̀', activityLoggingDesc: 'Jekí ìlànà gba ìgbésẹ̀ rẹ sílẹ̀',
    analyticsTracking: 'Ìtúàṣẹ̀ Ìtúpalẹ̀', analyticsTrackingDesc: 'Pin data líàṣé láti ran lọ́wọ́ láti mọ ìlànà dárá',
    profileVisibility: 'Ìfihàn Ìwọ̀ Araọn', profileVisibilityDesc: 'Jekí àwọn olùmúlò míràn wo ìwọ̀ araọn rẹ',
    financePortalTitle: 'Ẹ̀bùn Ìṣúná', reportingPortalTitle: 'Ẹ̀bùn Ìjábọ̀',
    auditLogsTitle: 'Àkọsílẹ̀ Àyẹ̀wò',
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
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
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