# GamifyPro — Vite + React

## Pré-requisitos
- Node.js 18+ instalado (https://nodejs.org)

## Como rodar

```bash
# 1. Entre na pasta do projeto
cd gamifypro

# 2. Instale as dependências (só na primeira vez)
npm install

# 3. Rode o servidor de desenvolvimento
npm run dev
```

Abra http://localhost:5173 no navegador.

## Outros comandos

```bash
npm run build    # gera a versão de produção em /dist
npm run preview  # previa do build de produção
```

## Estrutura

```
src/
├── main.jsx                 # entry point
├── App.jsx                  # router de páginas
├── index.css                # todos os estilos
├── pages/
│   ├── LandingPage.jsx      # página principal
│   ├── LoginPage.jsx        # tela de login
│   └── RegisterPage.jsx     # tela de cadastro (2 etapas)
└── components/
    └── AuthShell.jsx        # layout compartilhado das telas de auth
```
