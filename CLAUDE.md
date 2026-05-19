# CLAUDE.md — GamifyPro LMS

## Visão Geral

Plataforma de aprendizado gamificado (LMS) para treinamento corporativo. Sistema full-stack com dois papéis: **Estudantes** e **Instituições**, com mecânicas de gamificação (XP, níveis, conquistas, leaderboard).

---

## Estrutura do Repositório

```
PINT-ADS/
├── src/                        # Frontend React
│   ├── pages/                  # 18 páginas JSX
│   ├── components/             # AppShell, AuthShell
│   └── api/client.js           # Cliente HTTP centralizado
├── gamificada/                 # Backend Spring Boot
│   └── src/main/java/plat/gamificada/
│       ├── controller/         # 8 controllers REST
│       ├── service/            # 9 services
│       ├── repository/         # 13 repositórios JPA
│       ├── entity/             # 13 entidades JPA
│       ├── dto/                # 25+ DTOs
│       └── config/             # CORS, DataSeeder, GlobalExceptionHandler
├── gamificada/gamificada_db.sql # Schema do banco
├── BACKEND_SPEC.md             # Especificação da API
├── vite.config.js
├── package.json
└── .env                        # VITE_API_URL=http://localhost:8080/api
```

---

## Frontend

**Stack:** React 19 + Vite 8  
**Porta de desenvolvimento:** `http://localhost:5173`

### Comandos
```bash
npm run dev      # inicia servidor de desenvolvimento
npm run build    # build de produção
npm run lint     # ESLint
npm run preview  # preview do build
```

### Páginas (`src/pages/`)
| Arquivo | Descrição |
|---------|-----------|
| LandingPage | Página pública inicial |
| LoginPage | Autenticação |
| RegisterPage | Cadastro de usuário |
| StudentDashboard | Dashboard do estudante |
| InstitutionDashboard | Dashboard da instituição |
| DashboardPage | Dashboard genérico |
| TrailPage | Trilhas de aprendizado |
| ActivityPage | Histórico de atividades |
| LeaderboardPage | Ranking por XP |
| MyCoursesPage | Cursos matriculados |
| CourseDetailPage | Detalhes e módulos do curso |
| CoursePlayerPage | Player interativo de aulas |

### Arquitetura Frontend
- Roteamento via estado (sem React Router) — navegação por `page` + `ctx`
- Auth por Bearer token armazenado no `localStorage`
- `src/api/client.js` injeta o header `Authorization: Bearer {userId}` automaticamente
- Módulos de API: auth, user, courses, trails, activities, leaderboard, institution

---

## Backend

**Stack:** Spring Boot 3.3.4 + Java 21 + Maven  
**Porta:** `http://localhost:8080`  
**Pacote base:** `plat.gamificada`  
**Localização:** `/gamificada`

### Comandos
```bash
# Na pasta gamificada/
mvn spring-boot:run   # inicia o backend
mvn test              # executa testes
mvn clean package     # gera o JAR
```

### Banco de Dados
- **SGBD:** MySQL 8.x
- **Host:** `localhost:3306`
- **Database:** `gamificada_db`
- **Credenciais:** `root` / `123456`
- **DDL:** `spring.jpa.hibernate.ddl-auto=update`

### Entidades JPA
| Entidade | Tabela | Descrição |
|----------|--------|-----------|
| User | users | Usuários com role STUDENT/INSTITUTION, XP, nível, streak |
| Course | courses | Cursos criados por instituições com `access_code` (8 chars, único) |
| CourseModule | course_modules | Agrupamentos de aulas dentro de cursos |
| Lesson | lessons | Aulas tipo VIDEO/QUIZ/TEXT com `questions_json` |
| Trail | trails | Trilhas de aprendizado |
| TrailModule | trail_modules | Módulos de trilha com quiz e XP |
| CourseEnrollment | course_enrollments | Matrículas de estudantes |
| UserLessonProgress | user_lesson_progress | Progresso por aula |
| UserTrailModuleProgress | user_trail_module_progress | Progresso por módulo de trilha |
| UserCourseProgress | user_course_progress | Progresso por curso |
| Achievement | achievements | Conquistas com condition_type e threshold |
| UserAchievement | user_achievements | Conquistas desbloqueadas por usuário |
| ActivityLog | activity_logs | Histórico de atividades com XP ganho |

### Controllers e Endpoints Principais
| Controller | Base Path | Responsabilidade |
|------------|-----------|-----------------|
| AuthController | `/api/auth` | Login, registro, logout |
| CourseController | `/api/courses` | CRUD cursos, aulas, matrículas |
| TrailController | `/api/trails` | Gerenciamento de trilhas |
| UserController | `/api/user` | Perfil, dashboard, conquistas |
| ActivityController | `/api/activities` | Completar aulas/módulos, log |
| LeaderboardController | `/api/leaderboard` | Rankings por XP |
| InstitutionController | `/api/institution` | Estatísticas da instituição |

### Autenticação
- Formato do token: `Bearer {userId}` (o userId é o próprio token)
- `UserResolver` extrai o `userId` do header; se ausente, usa o primeiro STUDENT do banco (fallback de dev)
- **Sem JWT real** — sistema simplificado para prototipagem

### Serviços
- `XpService` — cálculo de XP e nível (`level = xp / 5000`)
- `AchievementService` — desbloqueio automático por condição (LESSONS_COMPLETED, XP_EARNED, STREAK_DAYS, TRAIL_MODULES_COMPLETED)
- `DataSeeder` — popula banco com dados iniciais ao subir a aplicação

### CORS
Configurado para aceitar `localhost:5173` e `localhost:3000`.

---

## Dados Seed (DataSeeder)

| Tipo | Dados |
|------|-------|
| Instituição | SENAI Digital |
| Estudantes | Ana Silva, Carlos Mendes, Beatriz Costa |
| Conquistas | 12 conquistas pré-definidas com ícones |
| Trilhas | 6 trilhas com módulos |
| Cursos | 3 cursos de exemplo |

---

## Problemas Conhecidos / Observações

- A coluna `enrollment_code` existe no banco mas **não está mapeada na entidade `Course`** — deve ser removida com `ALTER TABLE courses DROP COLUMN enrollment_code;`
- O aviso `spring.jpa.open-in-view` pode ser suprimido adicionando `spring.jpa.open-in-view=false` no `application.properties`
- O projeto fica na pasta do OneDrive — arquivos de `node_modules` podem ser corrompidos pela sincronização; se houver erros de pacote faltando, rodar `npm install` novamente

---

## Configuração Recomendada (`application.properties`)

```properties
spring.jpa.open-in-view=false
```

---

## Variáveis de Ambiente

| Variável | Valor padrão | Uso |
|----------|-------------|-----|
| VITE_API_URL | http://localhost:8080/api | URL base da API no frontend |
