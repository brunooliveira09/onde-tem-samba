// ============================================
// ONDE TEM SAMBA — Configuração Central
// ============================================
// Substitua os valores abaixo com suas credenciais do Supabase
// Encontre em: supabase.com → seu projeto → Settings → API

const OTS_CONFIG = {
  supabase: {
    url: 'https://SEU_PROJECT_ID.supabase.co',
    anonKey: 'SUA_ANON_KEY_AQUI',
  },
  map: {
    defaultCenter: [-23.2165, -47.5238], // Porto Feliz
    defaultZoom: 14,
  },
  app: {
    name: 'Onde Tem Samba',
    version: '1.0.0',
  }
};
