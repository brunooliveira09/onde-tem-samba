// ============================================
// ONDE TEM SAMBA — Configuração Central
// ============================================
// Substitua os valores abaixo com suas credenciais do Supabase
// Encontre em: supabase.com → seu projeto → Settings → API

const OTS_CONFIG = {
  supabase: {
    url: 'https://cwdjdvsdswpisqidcayn.supabase.co/rest/v1/',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3ZGpkdnNkc3dwaXNxaWRjYXluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMDI0ODEsImV4cCI6MjA5Njg3ODQ4MX0.yl_yleFrsNgQhOrN15op8EfK4LtfQ3UNHNH1-uh5svU',
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
