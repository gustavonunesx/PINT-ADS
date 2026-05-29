# CLAUDE.md — GamifyPro LMS

## Visão Geral

Plataforma de aprendizado gamificado (LMS) para treinamento corporativo. Sistema full-stack com dois papéis: **Estudantes** e **Instituições**, com mecânicas de gamificação (XP, níveis, conquistas, leaderboard).

---

## Estrutura do Repositório

```
PINT-ADS/
├── src/                        # Frontend React
│   ├── pages/                  # páginas JSX
│   ├── components/             # AppShell, AuthShell
│   └── api/client.js           # Cliente HTTP centralizado
├── gamificada/                 # Backend Spring Boot
│   └── src/main/java/plat/gamificada/
│       ├── controller/         # 7 controllers REST
│       ├── service/            # 8 services
│       ├── repository/         # 13 repositórios JPA
│       ├── entity/             # 13 entidades JPA
│       ├── dto/                # 20+ DTOs
│       └── config/             # CORS, DataSeeder, GlobalExceptionHandler
├── gamificada/gamificada_db.sql # Schema do banco
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
| InstitutionDashboard | Dashboard da instituição com tab "Estatísticas" |
| TrailPage | Trilhas de aprendizado (visão aluno) |
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
- `institution.courseStats(courseId)` — chama `GET /api/institution/courses/{id}/stats`

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
mvn compile           # compila (confirma erros reais — ignorar avisos Lombok do IDE)
mvn clean package     # gera o JAR
```

> **Nota IDE:** O processador incremental do NetBeans/LSP falha ao inicializar o Lombok e reporta falsos positivos (`cannot find symbol: getXxx()`). Usar `mvn compile` para confirmar erros reais.

### Banco de Dados
- **SGBD:** MySQL 8.x
- **Host:** `localhost:3306`
- **Database:** `gamificada_db`
- **Credenciais:** `root` / `123456`
- **DDL:** `spring.jpa.hibernate.ddl-auto=update`

---

## Entidades JPA

| Entidade | Tabela | Campos Relevantes |
|----------|--------|-------------------|
| User | `users` | role (STUDENT/INSTITUTION), companyName, xp, level, streak, lastActiveDate |
| Course | `courses` | title, category, difficulty, color, thumbnailUrl (MEDIUMTEXT, base64), accessCode (8 chars único), published, xpReward, institution (FK) |
| CourseModule | `course_modules` | course (FK), title, moduleOrder — cascade ALL → Lesson |
| Lesson | `lessons` | module (FK), title, type (VIDEO/QUIZ/TEXT), durationMinutes, duration (string), xpReward (default 100), lessonOrder, videoUrl, thumbnailUrl (MEDIUMTEXT), published, questionsJson |
| Trail | `trails` | title, color, badge — entidade estática, não usada para display (ver Trilhas vs Cursos) |
| TrailModule | `trail_modules` | trail (FK), title, xpReward, baseXP, quiz (boolean), moduleOrder |
| CourseEnrollment | `course_enrollments` | course (FK), student (FK), enrolledAt — UNIQUE(course_id, student_id) |
| UserLessonProgress | `user_lesson_progress` | user (FK), lesson (FK), completed, correctAnswers, totalQuestions, completedAt — UNIQUE(user_id, lesson_id) |
| UserTrailModuleProgress | `user_trail_module_progress` | user (FK), trailModule (FK), completed, correctAnswers, totalQuestions, completedAt |
| UserCourseProgress | `user_course_progress` | user (FK), course (FK), completedAt — UNIQUE(user_id, course_id) |
| Achievement | `achievements` | key (unique), title, icon, xpReward, conditionType (ENUM), conditionThreshold |
| UserAchievement | `user_achievements` | user (FK), achievement (FK), unlockedAt |
| ActivityLog | `activity_logs` | user (FK), xpEarned, description, date |

---

## Controllers e Endpoints

### `POST /api/auth/login` · `POST /api/auth/register` · `POST /api/auth/logout` · `GET /api/auth/users`

### CourseController — `/api/courses`
| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/` | Lista cursos do utilizador (INSTITUTION: seus cursos; STUDENT: matriculados) |
| GET | `/{id}` | Detalhes + módulos + aulas com status por utilizador |
| POST | `/` | Cria curso (INSTITUTION) |
| PUT | `/{id}` | Atualiza curso |
| DELETE | `/{id}` | Apaga curso + todos os dependentes (ver Cascade Delete) |
| POST | `/enroll` | Matrícula por código de acesso |
| POST | `/{courseId}/lessons` | Cria aula (auto-cria módulo "Aulas" se não existir) |
| PUT | `/{courseId}/lessons/{lessonId}` | Atualiza aula |
| DELETE | `/{courseId}/lessons/{lessonId}` | Remove aula |

### ActivityController — `/api/activities`
| Método | Path | Body | Resposta |
|--------|------|------|----------|
| POST | `/lessons/{id}/complete` | `{ correctAnswers, totalQuestions }` | `CompleteResponse` |
| POST | `/trail-module/{id}/complete` | `{ correctAnswers, totalQuestions }` | `CompleteResponse` (delega para `/lessons` se ID for de aula) |
| POST | `/courses/{courseId}/complete` | — | `CompleteResponse` (exige todas as aulas concluídas) |

**CompleteResponse shape:**
```json
{ "xpEarned": 100, "totalXp": 820, "level": 2, "leveledUp": false, "newAchievements": [] }
```

### UserController — `/api/user`
- `GET /profile` → `UserProfileDto` (id, name, email, role, xp, level, xpToNextLevel, streak)
- `GET /dashboard` → `DashboardDto` (profile + lessonsCompleted + recentActivity + recentAchievements + weeklyStats)
- `GET /achievements` → lista de conquistas desbloqueadas

### InstitutionController — `/api/institution`
- `GET /stats` → `{ totalCourses, totalStudents, totalLessonsCompleted, totalXpDistributed }` (scoped para a instituição autenticada)
- `GET /courses/{courseId}/stats` → `{ enrolledCount, avgProgress, completedCount, totalLessons }` (403 se curso não for da instituição)

### TrailController — `/api/trails`
- `GET /` e `GET /{id}` → delegam para `CourseService.listAsTrails()` / `getAsTrail()` (cursos apresentados como trilhas)

### LeaderboardController — `/api/leaderboard`
- `GET /?period=all-time|weekly&tab=students` → lista ranqueada com rank, name, xp, level, streak
- **Desempate:** quando XP igual, desempate por `id` crescente — cada posição é única (sem dois #1)

---

## Autenticação

- **Token:** `Bearer {userId}` — o userId é o próprio token (sem JWT real)
- **UserResolver:** extrai userId do header; fallback para primeiro STUDENT do banco se ausente (dev only)
- **Sem validação de password** — sistema simplificado para prototipagem

---

## Serviços — Comportamentos Importantes

### XpService
- `level = (xp / 5000) + 1`
- `addXp()` atualiza nível, streak e cria `ActivityLog`
- Streak: incrementa se última atividade foi ontem; reseta se gap > 1 dia
- Quiz XP: `baseXP * (correct / total)`

### ActivityService
- `completeLesson()` e `completeCourse()` capturam `levelBefore` antes do `addXp` para calcular `leveledUp`
- `completeTrailModule()`: se o ID não existir em `trail_modules`, delega para `completeLesson()` (trails são agora backed por aulas de cursos)
- `completeCourse()`: falha com 409 se nem todas as aulas estiverem concluídas

### AchievementService
- Chamado após cada `addXp` — verifica e desbloqueia conquistas automaticamente
- Condições: LESSONS_COMPLETED, TRAIL_MODULES_COMPLETED, XP_EARNED, STREAK_DAYS

### CourseService — Trilhas vs Cursos
- `listAsTrails()` / `getAsTrail()` / `toCourseTrailDto()`: cursos são mapeados como trilhas — lições → módulos com `type` (video/lesson), `xp`, `done`
- `TrailController` delega inteiramente para `CourseService` — a tabela `trails` não é usada para display
- `deleteCourse()`: apaga dependentes manualmente antes de deletar (ver abaixo)

---

## Cascade Delete — Ordem Obrigatória

`CourseService.deleteCourse()` apaga na seguinte ordem (constraint violations se alterada):

1. `lessonProgressRepo.deleteByCourse(course)` — `user_lesson_progress`
2. `courseProgressRepo.deleteByCourse(course)` — `user_course_progress`
3. `enrollmentRepository.deleteByCourse(course)` — `course_enrollments`
4. `courseRepository.delete(course)` — JPA propaga: `courses` → `course_modules` → `lessons`

---

## Repositórios — Queries Customizadas Relevantes

| Repositório | Método notável |
|-------------|---------------|
| UserLessonProgressRepository | `countCompletedByUserAndCourse(user, courseId)` — JPQL |
| UserLessonProgressRepository | `countCompletedByInstitution(institution)` / `sumXpByInstitution(institution)` — scoped |
| UserLessonProgressRepository | `deleteByCourse(course)` — `@Modifying @Query` bulk delete |
| ActivityLogRepository | `sumXpByUserSince(userId, date)` — GROUP BY para leaderboard semanal |
| CourseEnrollmentRepository | `findByCourseIn(courses)` — para contar alunos distintos da instituição |

---

## DTOs Principais

| DTO | Campos |
|-----|--------|
| CourseDto | id, name, description, category, difficulty, thumbnailUrl, color, institution, accessCode, published, xpReward, totalLessons, completedLessons, enrolledCount, modules, lessons |
| TrailDto | id, title, description, color, badge, xpTotal, xpEarned, totalModules, completedModules, modules |
| TrailModuleDto | id, title, moduleOrder, xpReward, type, duration, quiz, locked, completed |
| CompleteResponse | xpEarned, totalXp, level, leveledUp, newAchievements |
| InstitutionStatsDto | totalCourses, totalStudents, totalLessonsCompleted, totalXpDistributed |
| CourseStatsDto | enrolledCount, avgProgress (double, 0–100), completedCount, totalLessons |
| CreateCourseRequest | name, description, category, difficulty, thumbnailUrl, color, xpReward |
| CreateLessonRequest | title, duration, videoUrl, thumbnailUrl, published (sem xpReward — default 100 no serviço) |

---

## Dados Seed (DataSeeder)

| Tipo | Dados |
|------|-------|
| Instituição | SENAI Digital |
| Estudantes | Nenhum seedado — registam-se pela UI |
| Conquistas | 12 conquistas pré-definidas com ícones emoji |
| Trilhas | 3 trilhas estáticas (Web Dev, Databases, Java/Spring) com TrailModules |
| Cursos | Nenhum seedado — criados pela instituição via UI |

---

## Observações / Armadilhas

- **Aulas existentes com xpReward = 0:** Novas aulas recebem 100 XP por defeito. Aulas antigas precisam de `UPDATE lessons SET xp_reward = 100 WHERE xp_reward = 0;` (desativar safe mode no MySQL Workbench com `SET SQL_SAFE_UPDATES = 0;` antes)
- **Cursos com xpReward = 0:** O campo existe e é persistido — a instituição deve preencher ao criar/editar via UI
- **Trilhas vs Cursos:** `GET /api/trails` serve cursos formatados como trilhas. A tabela `trails` só é usada pelo `TrailService` (endpoint separado, não usado no frontend principal)
- **OneDrive:** `node_modules` pode corromper pela sincronização — se houver erros de pacote, correr `npm install`
- **Lombok IDE:** Falsos positivos do processador incremental do NetBeans. Usar `mvn compile` para verificar erros reais
- **thumbnailUrl base64:** colunas `courses.thumbnail_url` e `lessons.thumbnail_url` são `MEDIUMTEXT` no MySQL — se `ddl-auto=update` não aplicar a alteração em colunas existentes, executar manualmente: `ALTER TABLE courses MODIFY COLUMN thumbnail_url MEDIUMTEXT; ALTER TABLE lessons MODIFY COLUMN thumbnail_url MEDIUMTEXT;`
- **Limites de upload base64:** `application.properties` configura Tomcat com 20MB e MySQL JDBC com `maxAllowedPacket=64MB`

---

## Configuração (`application.properties`)

```properties
spring.jpa.open-in-view=false
spring.jpa.hibernate.ddl-auto=update
spring.servlet.multipart.max-file-size=20MB
spring.servlet.multipart.max-request-size=20MB
server.tomcat.max-http-form-post-size=20MB
server.tomcat.max-swallow-size=20MB
# maxAllowedPacket=67108864 configurado no JDBC URL
```

## Variáveis de Ambiente

| Variável | Valor padrão | Uso |
|----------|-------------|-----|
| VITE_API_URL | http://localhost:8080/api | URL base da API no frontend |
