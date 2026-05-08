# BACKEND SPECIFICATION — GamifyPro LMS
> Documento gerado para integração perfeita com o frontend React existente.
> Backend: Java 21 + Spring Boot 3.x + Spring Security + JWT + JPA/Hibernate

---

## 1. VISÃO GERAL DO PROJETO

Plataforma LMS (Learning Management System) gamificada com:
- Autenticação JWT para estudantes e instituições
- Sistema de trilhas de aprendizado (Trails) com módulos e atividades
- Sistema de cursos com lições em vídeo
- Sistema de XP, níveis, streaks e conquistas (achievements)
- Leaderboard individual e por departamento
- Dashboard personalizado por tipo de usuário

---

## 2. STACK RECOMENDADA

```
Java 21
Spring Boot 3.x
Spring Security 6 + JWT (jjwt ou nimbus)
Spring Data JPA + Hibernate
PostgreSQL (banco de dados)
Lombok
MapStruct (opcional, para DTOs)
Maven ou Gradle
```

---

## 3. MODELOS DE DADOS (Entidades JPA)

### 3.1 User
```java
@Entity @Table(name = "users")
public class User {
    @Id @GeneratedValue UUID id;
    String name;
    String email;          // único
    String passwordHash;
    String type;           // "student" | "institution"
    String company;        // para institution
    String role;           // para student: "Analista", "Dev", "Gestor", etc.
    int xp;                // total acumulado, default 0
    int level;             // calculado: xp / 5000, default 1
    int streak;            // dias consecutivos de estudo, default 0
    LocalDate lastActiveDate; // para calcular streak
    LocalDateTime createdAt;
}
```

### 3.2 Course
```java
@Entity @Table(name = "courses")
public class Course {
    @Id @GeneratedValue UUID id;
    String name;
    String institution;
    String color;          // hex color ex: "#6C63FF"
    String glow;           // hex color semi-transparente
    String badge;          // emoji ex: "🛡️"
    String bannerUrl;      // URL da imagem de capa
    boolean published;
    String instructor;
    String totalDuration;  // ex: "4h 30min"
    boolean certificate;
    int xpReward;          // XP total ao completar o curso
    @ManyToOne User createdBy;  // institution user
    LocalDateTime createdAt;

    @OneToMany(mappedBy = "course", cascade = ALL)
    List<CourseModule> modules;
}
```

### 3.3 CourseModule
```java
@Entity @Table(name = "course_modules")
public class CourseModule {
    @Id @GeneratedValue UUID id;
    @ManyToOne Course course;
    String name;           // ex: "Módulo 1 — Fundamentos"
    int orderIndex;

    @OneToMany(mappedBy = "module", cascade = ALL)
    List<Lesson> lessons;
}
```

### 3.4 Lesson
```java
@Entity @Table(name = "lessons")
public class Lesson {
    @Id @GeneratedValue UUID id;
    @ManyToOne CourseModule module;
    String title;
    String duration;       // ex: "12min"
    String videoUrl;       // YouTube, Vimeo, ou direto
    String description;
    String coverUrl;
    int orderIndex;
    LocalDateTime createdAt;
}
```

### 3.5 Trail
```java
@Entity @Table(name = "trails")
public class Trail {
    @Id @GeneratedValue UUID id;
    String title;
    String description;
    String color;
    String glow;
    String badge;          // emoji
    String category;
    int xpTotal;

    @OneToMany(mappedBy = "trail", cascade = ALL)
    List<TrailModule> modules;
}
```

### 3.6 TrailModule
```java
@Entity @Table(name = "trail_modules")
public class TrailModule {
    @Id @GeneratedValue UUID id;
    @ManyToOne Trail trail;
    String title;
    String type;           // "video" | "quiz" | "lesson" | "exam"
    String duration;
    int xp;
    int orderIndex;
    
    // Para quiz: perguntas em JSON
    @Column(columnDefinition = "TEXT")
    String questionsJson;  // JSON array de QuizQuestion
}
```

### 3.7 UserProgress (progresso do estudante)
```java
@Entity @Table(name = "user_progress")
public class UserProgress {
    @Id @GeneratedValue UUID id;
    @ManyToOne User user;
    String entityType;     // "lesson" | "trail_module"
    UUID entityId;         // lessonId ou trailModuleId
    boolean completed;
    int xpEarned;
    int score;             // para quiz (0-100)
    LocalDateTime completedAt;
}
```

### 3.8 Achievement
```java
@Entity @Table(name = "achievements")
public class Achievement {
    @Id @GeneratedValue UUID id;
    String icon;           // emoji "🔥"
    String label;          // "7 dias seguidos"
    String conditionType;  // "streak" | "quiz_score" | "rank" | "trail_complete" | "speed"
    int conditionValue;    // ex: streak >= 7
}
```

### 3.9 UserAchievement
```java
@Entity @Table(name = "user_achievements")
public class UserAchievement {
    @Id @GeneratedValue UUID id;
    @ManyToOne User user;
    @ManyToOne Achievement achievement;
    LocalDateTime unlockedAt;
}
```

### 3.10 UserCourseEnrollment
```java
@Entity @Table(name = "user_course_enrollments")
public class UserCourseEnrollment {
    @Id @GeneratedValue UUID id;
    @ManyToOne User user;
    @ManyToOne Course course;
    int progress;          // 0-100
    int lessonsCompleted;
    LocalDateTime lastAccessAt;
    LocalDateTime enrolledAt;
}
```

### 3.11 ActivityLog
```java
@Entity @Table(name = "activity_logs")
public class ActivityLog {
    @Id @GeneratedValue UUID id;
    @ManyToOne User user;
    String action;         // "Completou quiz", "Assistiu vídeo", etc.
    int xpEarned;
    LocalDateTime createdAt;
}
```

---

## 4. ENDPOINTS DA API

### BASE URL: `/api`
### Autenticação: `Authorization: Bearer <JWT>` em todos os endpoints protegidos

---

### 4.1 AUTH

#### POST `/api/auth/login`
```json
// Request
{
  "email": "ana@empresa.com",
  "password": "senha123"
}

// Response 200
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid",
    "name": "Ana Silva",
    "email": "ana@empresa.com",
    "type": "student",
    "xp": 3840,
    "level": 12,
    "streak": 7
  }
}

// Response 401
{ "error": "Credenciais inválidas" }
```

#### POST `/api/auth/register`
```json
// Request
{
  "name": "Ana Silva",
  "email": "ana@empresa.com",
  "password": "Senha@123",
  "type": "student",           // ou "institution"
  "company": "Empresa XYZ",   // obrigatório se type=institution
  "role": "Analista de TI"     // obrigatório se type=student
}

// Response 201
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid",
    "name": "Ana Silva",
    "email": "ana@empresa.com",
    "type": "student",
    "xp": 0,
    "level": 1,
    "streak": 0
  }
}

// Response 409
{ "error": "Email já cadastrado" }
```

#### POST `/api/auth/logout`
```json
// Headers: Authorization: Bearer <token>
// Response 200
{ "success": true }
```

---

### 4.2 USER

#### GET `/api/user/profile`
```json
// Response 200
{
  "id": "uuid",
  "name": "Ana Silva",
  "email": "ana@empresa.com",
  "type": "student",
  "xp": 3840,
  "level": 12,
  "streak": 7,
  "company": null,
  "role": "Analista de TI"
}
```

#### GET `/api/user/dashboard`
```json
// Response 200
{
  "user": {
    "name": "Ana Silva",
    "xp": 3840,
    "level": 12,
    "streak": 7,
    "xpToNextLevel": 5000
  },
  "weeklyStats": [
    { "day": "Seg", "minutes": 45, "done": true },
    { "day": "Ter", "minutes": 30, "done": true },
    { "day": "Qua", "minutes": 60, "done": true },
    { "day": "Qui", "minutes": 20, "done": true },
    { "day": "Sex", "minutes": 50, "done": true },
    { "day": "Sáb", "minutes": 15, "done": true },
    { "day": "Dom", "minutes": 0, "done": false }
  ],
  "recentActivity": [
    {
      "time": "Hoje, 14h32",
      "action": "Completou quiz de Segurança",
      "xp": 120
    }
  ],
  "myPosition": {
    "rank": 14,
    "topPercent": 5
  },
  "nextCourse": {
    "id": "uuid",
    "name": "Segurança da Informação",
    "progress": 87,
    "nextLesson": {
      "id": "uuid",
      "title": "Criptografia Assimétrica"
    }
  }
}
```

---

### 4.3 COURSES

#### GET `/api/courses`
```json
// Query params opcionais: ?filter=all|in-progress|completed&search=texto
// Response 200
[
  {
    "id": "uuid",
    "name": "Segurança da Informação",
    "institution": "Universidade Nova",
    "color": "#6C63FF",
    "glow": "rgba(108,99,255,0.3)",
    "badge": "🛡️",
    "progress": 87,
    "lessonsTotal": 8,
    "lessonsDone": 7,
    "lastAccess": "2026-05-06T14:32:00",
    "published": true
  }
]
```

#### GET `/api/courses/:id`
```json
// Response 200
{
  "id": "uuid",
  "name": "Segurança da Informação",
  "institution": "Universidade Nova",
  "color": "#6C63FF",
  "glow": "rgba(108,99,255,0.3)",
  "badge": "🛡️",
  "progress": 87,
  "instructor": "Dr. Carlos Mendes",
  "totalDuration": "4h 30min",
  "certificate": true,
  "xpReward": 850,
  "modules": [
    {
      "id": "uuid",
      "name": "Módulo 1 — Fundamentos",
      "lessons": [
        {
          "id": "uuid",
          "title": "O que é Segurança da Informação?",
          "duration": "12min",
          "status": "done",
          "videoUrl": "https://youtube.com/embed/..."
        },
        {
          "id": "uuid",
          "title": "Ameaças e Vulnerabilidades",
          "duration": "18min",
          "status": "available",
          "videoUrl": ""
        }
      ]
    }
  ]
}
```

#### POST `/api/courses` (somente institution)
```json
// Request
{
  "name": "Novo Curso",
  "color": "#FF6584",
  "bannerUrl": "https://..."
}

// Response 201
{ "id": "uuid", "name": "Novo Curso", ... }
```

#### PUT `/api/courses/:id` (somente institution)
```json
// Request (campos opcionais)
{
  "name": "Nome Atualizado",
  "published": true
}

// Response 200
{ "id": "uuid", "name": "Nome Atualizado", ... }
```

#### POST `/api/courses/:id/lessons` (somente institution)
```json
// Request
{
  "moduleId": "uuid",   // se null, cria novo módulo
  "moduleName": "Módulo 3",
  "title": "Nova Aula",
  "duration": "15min",
  "videoUrl": "https://youtube.com/embed/...",
  "description": "Descrição da aula"
}

// Response 201
{ "id": "uuid", "title": "Nova Aula", ... }
```

#### DELETE `/api/courses/:courseId/lessons/:lessonId` (somente institution)
```json
// Response 204 No Content
```

---

### 4.4 TRAILS

#### GET `/api/trails`
```json
// Response 200
[
  {
    "id": "security",
    "title": "Segurança da Informação",
    "color": "#6C63FF",
    "glow": "rgba(108,99,255,0.3)",
    "badge": "🛡️",
    "desc": "Aprenda a proteger...",
    "category": "Segurança",
    "xpTotal": 1200,
    "xpEarned": 960,
    "progress": 80,
    "modulesTotal": 8,
    "modulesDone": 6
  }
]
```

#### GET `/api/trails/:id`
```json
// Response 200
{
  "id": "security",
  "title": "Segurança da Informação",
  "color": "#6C63FF",
  "glow": "rgba(108,99,255,0.3)",
  "badge": "🛡️",
  "desc": "Aprenda a proteger sistemas contra ameaças digitais",
  "category": "Segurança",
  "xpTotal": 1200,
  "xpEarned": 960,
  "progress": 80,
  "modules": [
    {
      "id": "uuid",
      "title": "Fundamentos de Segurança",
      "type": "video",
      "duration": "15min",
      "xp": 110,
      "done": true,
      "locked": false
    },
    {
      "id": "uuid",
      "title": "Quiz: Ameaças e Riscos",
      "type": "quiz",
      "duration": "10min",
      "xp": 150,
      "done": true,
      "locked": false
    },
    {
      "id": "uuid",
      "title": "Leitura: Boas práticas",
      "type": "lesson",
      "duration": "8min",
      "xp": 130,
      "done": false,
      "locked": false
    }
  ]
}
```

---

### 4.5 ACTIVITIES (Completar módulos)

#### POST `/api/activities/trail-module/:moduleId/complete`
```json
// Request
{
  "score": 3,          // para quiz: quantas corretas (null se não for quiz)
  "totalQuestions": 4  // para quiz (null se não for quiz)
}

// Response 200
{
  "xpEarned": 112,
  "totalXp": 3952,
  "level": 12,
  "leveledUp": false,
  "achievements": [
    // achievements desbloqueados nesta ação (pode ser vazio)
    { "icon": "🔥", "label": "7 dias seguidos" }
  ]
}
```

#### POST `/api/activities/lessons/:lessonId/complete`
```json
// Request: vazio {}
// Response 200
{
  "xpEarned": 110,
  "totalXp": 3950,
  "level": 12,
  "leveledUp": false,
  "courseProgress": 75,
  "achievements": []
}
```

---

### 4.6 LEADERBOARD

#### GET `/api/leaderboard?period=week&tab=individual`
```
period: "week" | "month" | "all"
tab: "individual" | "department"
```

```json
// Response 200 (individual)
{
  "myRank": {
    "rank": 4,
    "xp": 3840,
    "weeklyDelta": 150,
    "gapToTop3": 210
  },
  "board": [
    {
      "rank": 1,
      "name": "Carlos M.",
      "dept": "Engenharia",
      "xp": 5200,
      "delta": "+320",
      "avatar": "CM",
      "color": "#6C63FF",
      "badge": "🥇",
      "isMe": false
    },
    {
      "rank": 4,
      "name": "Ana Silva",
      "dept": "Segurança",
      "xp": 3840,
      "delta": "+150",
      "avatar": "AS",
      "color": "#FF6584",
      "badge": "",
      "isMe": true
    }
  ]
}

// Response 200 (department)
{
  "board": [
    {
      "rank": 1,
      "name": "Engenharia",
      "members": 24,
      "score": 94500,
      "scorePercent": 100,
      "color": "#6C63FF"
    }
  ]
}
```

---

### 4.7 ACHIEVEMENTS

#### GET `/api/user/achievements`
```json
// Response 200
[
  { "id": "uuid", "icon": "🔥", "label": "7 dias seguidos", "unlocked": true, "unlockedAt": "2026-04-30T10:00:00" },
  { "id": "uuid", "icon": "🎯", "label": "100% em Segurança", "unlocked": true, "unlockedAt": "2026-05-02T15:30:00" },
  { "id": "uuid", "icon": "⚡", "label": "Velocista", "unlocked": false, "unlockedAt": null },
  { "id": "uuid", "icon": "🧠", "label": "Mestre LGPD", "unlocked": false, "unlockedAt": null },
  { "id": "uuid", "icon": "🏆", "label": "Top 3 ranking", "unlocked": false, "unlockedAt": null },
  { "id": "uuid", "icon": "🌟", "label": "Trilha completa", "unlocked": false, "unlockedAt": null }
]
```

---

### 4.8 INSTITUTION DASHBOARD

#### GET `/api/institution/stats`
```json
// Response 200
{
  "totalCourses": 5,
  "totalStudents": 234,
  "totalLessons": 42,
  "completionRate": 68,
  "courses": [
    {
      "id": "uuid",
      "name": "Segurança da Informação",
      "students": 128,
      "lessonsCount": 8,
      "color": "#6C63FF",
      "badge": "🛡️",
      "published": true
    }
  ]
}
```

---

## 5. LÓGICA DE NEGÓCIO (regras obrigatórias)

### 5.1 XP e Níveis
```
XP por nível: 5000 XP (fixo)
level = Math.floor(xp / 5000) + 1
xpToNextLevel = 5000
xpProgressInLevel = xp % 5000

XP de Quiz: baseXP * (score / totalQuestions) — arredondar para inteiro
XP de Video: valor fixo do módulo
XP de Lesson: valor fixo do módulo
XP de Exam: valor fixo do módulo
```

### 5.2 Streak
```
Ao completar qualquer atividade:
  - Se lastActiveDate == ontem: streak++
  - Se lastActiveDate == hoje: streak (sem mudança)
  - Se lastActiveDate < ontem: streak = 1 (reset)
  - Atualizar lastActiveDate = hoje
```

### 5.3 Lock/Unlock de Módulos de Trilha
```
Módulo [i] está locked se módulo [i-1] não foi completed
Primeiro módulo sempre unlocked
```

### 5.4 Status de Lesson em Curso
```
"done"      → UserProgress existe com completed=true
"available" → Lição anterior done, ou é a primeira
"locked"    → Lição anterior não done
```

### 5.5 Progresso de Curso
```
progress = (lessonsDone / lessonsTotal) * 100
Atualizar UserCourseEnrollment ao completar cada lesson
```

### 5.6 Progresso de Trilha
```
progress = (modulesDone / modulesTotal) * 100
xpEarned = soma do xp dos módulos done
```

### 5.7 Achievements — Condições de Desbloqueio
```
"7 dias seguidos"    → streak >= 7
"100% em Segurança"  → curso "Segurança" com progress == 100
"Velocista"          → completar qualquer trilha em menos de 7 dias
"Mestre LGPD"        → trilha LGPD com todos módulos done
"Top 3 ranking"      → aparecer em rank <= 3 no leaderboard semanal
"Trilha completa"    → qualquer trilha 100% completa
```
Verificar e desbloquear achievements após cada `/complete`.

### 5.8 Leaderboard — Cálculo
```
individual/week  → soma de XP ganho nos últimos 7 dias (ActivityLog)
individual/month → soma de XP ganho nos últimos 30 dias
individual/all   → User.xp total

department → agrupar users por User.role (ou por campo dept futuro)
           → somar xp de todos da categoria

delta → XP ganho nesta semana vs semana anterior
```

---

## 6. INTEGRAÇÃO FRONTEND → BACKEND

### 6.1 Como o Frontend vai consumir a API

O frontend atualmente **não tem chamadas HTTP**. Ao integrar, deve-se:

1. Criar um arquivo `src/api/client.js`:
```javascript
const BASE_URL = 'http://localhost:8080/api';

export async function apiCall(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(BASE_URL + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  });
  if (!res.ok) throw await res.json();
  return res.json();
}
```

2. Substituir os `setTimeout` em LoginPage/RegisterPage por chamadas reais.

3. Substituir os dados mock em cada página pelas chamadas reais.

### 6.2 Fluxo de Autenticação

```
Login:
  POST /api/auth/login
  → Salvar token no localStorage: localStorage.setItem('token', res.token)
  → Salvar user no estado React: setUser(res.user)
  → Redirecionar baseado em res.user.type

Register:
  POST /api/auth/register
  → Mesmo fluxo do login

Logout:
  POST /api/auth/logout (com token)
  → localStorage.removeItem('token')
  → setUser(null)
  → Navegar para 'landing'

Restore session ao carregar app:
  const token = localStorage.getItem('token')
  if (token) GET /api/user/profile → setUser(res)
```

### 6.3 CORS — Configuração obrigatória no Spring Boot
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173")  // Vite dev server
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

---

## 7. DADOS INICIAIS (Seeds) do Banco

Ao iniciar o app pela primeira vez, popular:

### Trails (5 trilhas)
```
1. Segurança da Informação — 8 módulos (2 video, 2 quiz, 2 lesson, 2 exam) — 1200 XP total
2. Compliance & LGPD — 6 módulos — 900 XP total
3. DevOps Essentials — 5 módulos — 850 XP total
4. Governança de TI — 8 módulos — 1100 XP total
5. Soft Skills para Tech — 6 módulos — 950 XP total
```

### Achievements (6 conquistas)
```
1. 🔥 "7 dias seguidos"   — conditionType: "streak", conditionValue: 7
2. 🎯 "100% em Segurança" — conditionType: "course_complete", conditionValue: courseId
3. ⚡ "Velocista"          — conditionType: "trail_speed", conditionValue: 7 (dias)
4. 🧠 "Mestre LGPD"       — conditionType: "trail_complete", trailId: lgpd
5. 🏆 "Top 3 ranking"     — conditionType: "rank", conditionValue: 3
6. 🌟 "Trilha completa"   — conditionType: "any_trail_complete", conditionValue: 1
```

### Quiz Questions para Trail Segurança (seed)
```json
[
  {
    "q": "O que é phishing?",
    "opts": [
      "Um tipo de malware que criptografa arquivos",
      "Uma técnica de engenharia social para roubo de informações",
      "Um protocolo de rede seguro",
      "Um tipo de firewall avançado"
    ],
    "correct": 1,
    "explain": "Phishing é uma técnica onde atacantes se passam por entidades confiáveis para roubar dados sensíveis como senhas e números de cartão."
  },
  {
    "q": "Qual das seguintes opções representa uma senha forte?",
    "opts": ["senha123", "João1990", "P@ssw0rd#2024!", "qwerty"],
    "correct": 2,
    "explain": "Uma senha forte combina letras maiúsculas, minúsculas, números e símbolos, com pelo menos 12 caracteres."
  },
  {
    "q": "O que significa 2FA (Autenticação de Dois Fatores)?",
    "opts": [
      "Usar duas senhas diferentes",
      "Verificar identidade com dois métodos distintos",
      "Ter duas contas de usuário",
      "Fazer login duas vezes por dia"
    ],
    "correct": 1,
    "explain": "2FA requer dois métodos de verificação independentes: algo que você sabe (senha) + algo que você tem (token/SMS)."
  },
  {
    "q": "Qual é a função principal de um firewall?",
    "opts": [
      "Acelerar a conexão com a internet",
      "Armazenar dados criptografados",
      "Filtrar tráfego de rede não autorizado",
      "Fazer backup automático de arquivos"
    ],
    "correct": 2,
    "explain": "Firewalls monitoram e controlam o tráfego de rede com base em regras de segurança predefinidas."
  }
]
```

---

## 8. ESTRUTURA DE PACOTES RECOMENDADA

```
com.gamifypro/
├── config/
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   └── JwtConfig.java
├── auth/
│   ├── AuthController.java
│   ├── AuthService.java
│   ├── JwtService.java
│   └── dto/ (LoginRequest, RegisterRequest, AuthResponse)
├── user/
│   ├── User.java (entity)
│   ├── UserRepository.java
│   ├── UserController.java
│   ├── UserService.java
│   └── dto/ (UserProfileResponse, DashboardResponse)
├── course/
│   ├── Course.java, CourseModule.java, Lesson.java
│   ├── repositories/
│   ├── CourseController.java
│   ├── CourseService.java
│   └── dto/
├── trail/
│   ├── Trail.java, TrailModule.java
│   ├── repositories/
│   ├── TrailController.java
│   ├── TrailService.java
│   └── dto/
├── activity/
│   ├── UserProgress.java, ActivityLog.java
│   ├── repositories/
│   ├── ActivityController.java
│   ├── ActivityService.java (lógica de XP, streak, achievements)
│   └── dto/
├── leaderboard/
│   ├── LeaderboardController.java
│   ├── LeaderboardService.java
│   └── dto/
├── achievement/
│   ├── Achievement.java, UserAchievement.java
│   ├── repositories/
│   ├── AchievementController.java
│   ├── AchievementService.java (verificação de condições)
│   └── dto/
├── institution/
│   ├── InstitutionController.java
│   └── InstitutionService.java
└── common/
    ├── exception/ (GlobalExceptionHandler)
    └── ApiResponse.java
```

---

## 9. CONFIGURAÇÃO application.properties

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/gamifypro
spring.datasource.username=postgres
spring.datasource.password=postgres

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

jwt.secret=sua-chave-secreta-muito-longa-minimo-256-bits
jwt.expiration=86400000   # 24 horas em ms

server.port=8080
```

---

## 10. NAVEGAÇÃO DO FRONTEND (para contexto)

O frontend usa roteamento por estado (não URL). Estas são as telas e suas dependências de dados:

| Tela | Endpoint(s) necessário(s) |
|------|--------------------------|
| LoginPage | POST /api/auth/login |
| RegisterPage | POST /api/auth/register |
| StudentDashboard | GET /api/user/dashboard |
| DashboardPage (com sidebar) | GET /api/user/dashboard, GET /api/trails |
| TrailPage (lista) | GET /api/trails |
| TrailPage (detalhe) | GET /api/trails/:id |
| ActivityPage (quiz/video/lesson) | GET /api/trails/:id (módulo específico), POST /api/activities/trail-module/:id/complete |
| LeaderboardPage | GET /api/leaderboard?period=&tab= |
| MyCoursesPage | GET /api/courses?filter= |
| CourseDetailPage | GET /api/courses/:id |
| CoursePlayerPage | GET /api/courses/:id, POST /api/activities/lessons/:id/complete |
| InstitutionDashboard | GET /api/institution/stats, POST /api/courses, PUT /api/courses/:id |

---

## 11. TIPOS DE CONTA E PERMISSÕES

```
student:
  - Lê trilhas, cursos, leaderboard, conquistas
  - Completa atividades (gera XP)
  - Não pode criar/editar cursos

institution:
  - Cria e edita cursos
  - Vê estatísticas dos seus cursos
  - Não participa do leaderboard individual
```

Spring Security: proteger `/api/courses` (POST/PUT) com role INSTITUTION.
Todos os outros endpoints requerem apenas autenticação válida.

---

## 12. RESPONSE PADRÃO DE ERROS

```json
{
  "error": "Mensagem de erro",
  "status": 400,
  "timestamp": "2026-05-07T10:00:00"
}
```

HTTP Status codes:
- 200: OK
- 201: Created
- 204: No Content
- 400: Bad Request (validação)
- 401: Unauthorized (token inválido/ausente)
- 403: Forbidden (sem permissão)
- 404: Not Found
- 409: Conflict (ex: email já existe)
- 500: Internal Server Error
