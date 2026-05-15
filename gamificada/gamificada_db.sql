-- ============================================================
--  Plataforma Gamificada — Script completo do banco de dados
--  MySQL 8.x
--  Execute este script ANTES de iniciar o backend.
--  Os INSERTs são os mesmos que o DataSeeder Java faria,
--  mas aqui já ficam persistidos mesmo se o seeder não rodar.
-- ============================================================

CREATE DATABASE IF NOT EXISTS gamificada_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gamificada_db;

-- ────────────────────────────────────────────────────────────
--  Tabelas (DROP na ordem inversa das FKs para reset limpo)
-- ────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS user_lesson_progress;
DROP TABLE IF EXISTS user_trail_module_progress;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS course_modules;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS trail_modules;
DROP TABLE IF EXISTS trails;
DROP TABLE IF EXISTS achievements;
DROP TABLE IF EXISTS users;

-- ── users ────────────────────────────────────────────────────
CREATE TABLE users (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(255)        NOT NULL,
    email            VARCHAR(255)        NOT NULL UNIQUE,
    role             VARCHAR(20)         NOT NULL,   -- STUDENT | INSTITUTION
    company_name     VARCHAR(255),
    xp               INT                 NOT NULL DEFAULT 0,
    level            INT                 NOT NULL DEFAULT 1,
    streak           INT                 NOT NULL DEFAULT 0,
    last_active_date DATE,
    created_at       DATETIME
);

-- ── achievements ─────────────────────────────────────────────
CREATE TABLE achievements (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    `key`                VARCHAR(100)        NOT NULL UNIQUE,
    title                VARCHAR(255)        NOT NULL,
    description          TEXT,
    icon                 VARCHAR(50),
    xp_reward            INT                 NOT NULL DEFAULT 0,
    condition_type       VARCHAR(50),        -- LESSONS_COMPLETED | TRAIL_MODULES_COMPLETED | XP_EARNED | STREAK_DAYS
    condition_threshold  INT                 NOT NULL DEFAULT 0
);

-- ── trails ───────────────────────────────────────────────────
CREATE TABLE trails (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    category      VARCHAR(100),
    difficulty    VARCHAR(20),               -- BEGINNER | INTERMEDIATE | ADVANCED
    thumbnail_url VARCHAR(500)
);

-- ── trail_modules ────────────────────────────────────────────
CREATE TABLE trail_modules (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    trail_id       BIGINT       NOT NULL,
    title          VARCHAR(255) NOT NULL,
    description    TEXT,
    module_order   INT          NOT NULL,
    xp_reward      INT          NOT NULL DEFAULT 0,
    base_xp        INT          NOT NULL DEFAULT 0,  -- XP base para quiz (calculado por acertos/total)
    quiz           TINYINT(1)   NOT NULL DEFAULT 0,
    questions_json TEXT,
    CONSTRAINT fk_tm_trail FOREIGN KEY (trail_id) REFERENCES trails(id)
);

-- ── courses ──────────────────────────────────────────────────
CREATE TABLE courses (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    title          VARCHAR(255) NOT NULL,
    description    TEXT,
    category       VARCHAR(100),
    difficulty     VARCHAR(20),
    thumbnail_url  VARCHAR(500),
    institution_id BIGINT,
    CONSTRAINT fk_course_inst FOREIGN KEY (institution_id) REFERENCES users(id)
);

-- ── course_modules ───────────────────────────────────────────
CREATE TABLE course_modules (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id    BIGINT       NOT NULL,
    title        VARCHAR(255) NOT NULL,
    module_order INT          NOT NULL,
    CONSTRAINT fk_cm_course FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- ── lessons ──────────────────────────────────────────────────
CREATE TABLE lessons (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    module_id        BIGINT       NOT NULL,
    title            VARCHAR(255) NOT NULL,
    type             VARCHAR(20),             -- VIDEO | QUIZ | TEXT
    duration_minutes INT          NOT NULL DEFAULT 0,
    xp_reward        INT          NOT NULL DEFAULT 0,
    lesson_order     INT          NOT NULL DEFAULT 0,
    questions_json   TEXT,
    CONSTRAINT fk_lesson_module FOREIGN KEY (module_id) REFERENCES course_modules(id)
);

-- ── user_trail_module_progress ───────────────────────────────
CREATE TABLE user_trail_module_progress (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT     NOT NULL,
    trail_module_id  BIGINT     NOT NULL,
    completed        TINYINT(1) NOT NULL DEFAULT 0,
    correct_answers  INT        NOT NULL DEFAULT 0,
    total_questions  INT        NOT NULL DEFAULT 0,
    completed_at     DATETIME,
    UNIQUE KEY uq_utmp (user_id, trail_module_id),
    CONSTRAINT fk_utmp_user   FOREIGN KEY (user_id)         REFERENCES users(id),
    CONSTRAINT fk_utmp_module FOREIGN KEY (trail_module_id) REFERENCES trail_modules(id)
);

-- ── user_lesson_progress ─────────────────────────────────────
CREATE TABLE user_lesson_progress (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT     NOT NULL,
    lesson_id        BIGINT     NOT NULL,
    completed        TINYINT(1) NOT NULL DEFAULT 0,
    correct_answers  INT        NOT NULL DEFAULT 0,
    total_questions  INT        NOT NULL DEFAULT 0,
    completed_at     DATETIME,
    UNIQUE KEY uq_ulp (user_id, lesson_id),
    CONSTRAINT fk_ulp_user   FOREIGN KEY (user_id)   REFERENCES users(id),
    CONSTRAINT fk_ulp_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

-- ── user_achievements ────────────────────────────────────────
CREATE TABLE user_achievements (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT NOT NULL,
    achievement_id BIGINT NOT NULL,
    unlocked_at    DATETIME,
    UNIQUE KEY uq_ua (user_id, achievement_id),
    CONSTRAINT fk_ua_user FOREIGN KEY (user_id)        REFERENCES users(id),
    CONSTRAINT fk_ua_ach  FOREIGN KEY (achievement_id) REFERENCES achievements(id)
);

-- ── activity_logs ────────────────────────────────────────────
CREATE TABLE activity_logs (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    xp_earned   INT          NOT NULL DEFAULT 0,
    description VARCHAR(500),
    date        DATE,
    CONSTRAINT fk_al_user FOREIGN KEY (user_id) REFERENCES users(id)
);


-- ============================================================
--  SEED — Dados iniciais (mesmos que o DataSeeder Java insere)
-- ============================================================

-- ── Usuários ─────────────────────────────────────────────────
-- id=1 → INSTITUTION (SENAI Digital)
-- id=2 → STUDENT Ana Silva      (usa como Bearer 2 no frontend)
-- id=3 → STUDENT Carlos Mendes  (usa como Bearer 3 no frontend)
-- id=4 → STUDENT Beatriz Costa  (usa como Bearer 4 no frontend)

INSERT INTO users (name, email, role, company_name, xp, level, streak, created_at) VALUES
('SENAI Digital', 'senai@example.com',   'INSTITUTION', 'SENAI Digital', 0,    1, 0,  NOW()),
('Ana Silva',     'ana@example.com',     'STUDENT',     NULL,            3200, 1, 5,  NOW()),
('Carlos Mendes', 'carlos@example.com',  'STUDENT',     NULL,            7800, 2, 12, NOW()),
('Beatriz Costa', 'beatriz@example.com', 'STUDENT',     NULL,            1500, 1, 2,  NOW());

-- ── Conquistas ───────────────────────────────────────────────
INSERT INTO achievements (`key`, title, description, icon, xp_reward, condition_type, condition_threshold) VALUES
('first_lesson',     'Primeira Lição',       'Complete sua primeira lição',                '🎯', 50,  'LESSONS_COMPLETED',       1),
('lessons_5',        'Estudante Dedicado',   'Complete 5 lições',                          '📚', 100, 'LESSONS_COMPLETED',       5),
('lessons_20',       'Mestre das Lições',    'Complete 20 lições',                         '🏆', 300, 'LESSONS_COMPLETED',       20),
('first_trail',      'Trilheiro Iniciante',  'Complete seu primeiro módulo de trilha',     '🌱', 100, 'TRAIL_MODULES_COMPLETED', 1),
('trail_modules_5',  'Explorador',           'Complete 5 módulos de trilha',               '🗺', 200, 'TRAIL_MODULES_COMPLETED', 5),
('trail_modules_15', 'Desbravador',          'Complete 15 módulos de trilha',              '⚔', 500, 'TRAIL_MODULES_COMPLETED', 15),
('xp_1000',          'Mil Pontos',           'Acumule 1000 XP',                            '⭐', 0,   'XP_EARNED',               1000),
('xp_5000',          'Primeiro Nível',       'Alcance 5000 XP (Nível 2)',                  '🌟', 0,   'XP_EARNED',               5000),
('xp_10000',         'Segundo Nível',        'Alcance 10000 XP (Nível 3)',                 '💫', 0,   'XP_EARNED',               10000),
('streak_3',         'Sequência de 3',       'Mantenha uma sequência de 3 dias',           '🔥', 50,  'STREAK_DAYS',             3),
('streak_7',         'Uma Semana Inteira',   'Mantenha uma sequência de 7 dias',           '🔥', 150, 'STREAK_DAYS',             7),
('streak_30',        'Mês Perfeito',         'Mantenha uma sequência de 30 dias',          '🔥', 500, 'STREAK_DAYS',             30);

-- ── Trilhas ──────────────────────────────────────────────────

INSERT INTO trails (title, description, category, difficulty, thumbnail_url) VALUES
('Fundamentos de Programação Web',  'Aprenda HTML, CSS e JavaScript do zero ao avançado',             'Tecnologia', 'BEGINNER',     'https://placehold.co/400x200/4F46E5/white?text=Web'),
('Banco de Dados Essencial',        'SQL, modelagem e boas práticas com MySQL e PostgreSQL',           'Dados',      'INTERMEDIATE', 'https://placehold.co/400x200/0891B2/white?text=DB'),
('Java e Spring Boot',              'Desenvolvimento backend profissional com Java 21 e Spring Boot', 'Backend',    'ADVANCED',     'https://placehold.co/400x200/DC2626/white?text=Java');

-- trail_id=1 (Web)
INSERT INTO trail_modules (trail_id, title, description, module_order, xp_reward, base_xp, quiz) VALUES
(1, 'Introdução ao HTML',    'Estrutura básica de páginas web',           1, 150, 0,   0),
(1, 'CSS e Estilização',     'Estilos, cores e layout com CSS',           2, 200, 0,   0),
(1, 'Quiz: HTML & CSS',      'Teste seus conhecimentos',                  3, 0,   300, 1),
(1, 'JavaScript Básico',     'Variáveis, funções e DOM',                  4, 250, 0,   0),
(1, 'JavaScript Avançado',   'Promises, async/await e APIs',              5, 300, 0,   0),
(1, 'Quiz Final: Web Dev',   'Avaliação completa de Web Dev',             6, 0,   500, 1);

-- trail_id=2 (DB)
INSERT INTO trail_modules (trail_id, title, description, module_order, xp_reward, base_xp, quiz) VALUES
(2, 'Modelagem Relacional',  'Entidades, atributos e relações',           1, 200, 0,   0),
(2, 'SQL Básico',            'SELECT, INSERT, UPDATE, DELETE',            2, 250, 0,   0),
(2, 'Quiz: SQL',             'Teste de SQL',                              3, 0,   350, 1),
(2, 'Joins e Subqueries',    'INNER, LEFT, RIGHT JOIN',                   4, 300, 0,   0),
(2, 'Índices e Performance', 'Otimização de queries',                     5, 350, 0,   0);

-- trail_id=3 (Java)
INSERT INTO trail_modules (trail_id, title, description, module_order, xp_reward, base_xp, quiz) VALUES
(3, 'Java Moderno',          'Records, sealed classes, pattern matching', 1, 200, 0,   0),
(3, 'Spring Core',           'IoC, DI, Beans e contexto',                2, 250, 0,   0),
(3, 'Spring Data JPA',       'Repositories, JPQL e relacionamentos',      3, 300, 0,   0),
(3, 'Quiz: Spring',          'Avaliação Spring Boot',                     4, 0,   400, 1),
(3, 'REST APIs',             'Controllers, DTOs e validações',            5, 350, 0,   0);

-- ── Cursos ───────────────────────────────────────────────────

INSERT INTO courses (title, description, category, difficulty, thumbnail_url, institution_id) VALUES
('React para Iniciantes',       'Aprenda React 19 com hooks, estado e componentes',                          'Frontend',       'BEGINNER',     'https://placehold.co/400x200/06B6D4/white?text=React',   1),
('Python para Ciência de Dados','Pandas, NumPy, visualização e análise de dados com Python',                 'Dados',          'INTERMEDIATE', 'https://placehold.co/400x200/F59E0B/white?text=Python',  1),
('DevOps na Prática',           'Docker, CI/CD, Kubernetes e boas práticas de entrega contínua',             'Infraestrutura', 'ADVANCED',     'https://placehold.co/400x200/10B981/white?text=DevOps',  1);

-- course_modules — Curso 1 (React)
INSERT INTO course_modules (course_id, title, module_order) VALUES
(1, 'Fundamentos do React', 1),
(1, 'Hooks e Estado',       2),
(1, 'Projeto Final',        3);

-- course_modules — Curso 2 (Python)
INSERT INTO course_modules (course_id, title, module_order) VALUES
(2, 'Python Essencial', 1),
(2, 'Pandas e NumPy',   2);

-- course_modules — Curso 3 (DevOps)
INSERT INTO course_modules (course_id, title, module_order) VALUES
(3, 'Docker Fundamentals',     1),
(3, 'CI/CD com GitHub Actions',2);

-- lessons — módulo 1 (Fundamentos do React)  module_id=1
INSERT INTO lessons (module_id, title, type, duration_minutes, xp_reward, lesson_order) VALUES
(1, 'O que é React?',       'VIDEO', 10, 50,  1),
(1, 'Componentes e JSX',    'VIDEO', 15, 75,  2),
(1, 'Quiz: Fundamentos',    'QUIZ',  5,  100, 3);

-- lessons — módulo 2 (Hooks e Estado)  module_id=2
INSERT INTO lessons (module_id, title, type, duration_minutes, xp_reward, lesson_order) VALUES
(2, 'useState e useEffect', 'VIDEO', 20, 100, 1),
(2, 'useContext e useRef',  'VIDEO', 15, 75,  2),
(2, 'Quiz: Hooks',          'QUIZ',  5,  150, 3);

-- lessons — módulo 3 (Projeto Final)  module_id=3
INSERT INTO lessons (module_id, title, type, duration_minutes, xp_reward, lesson_order) VALUES
(3, 'Criando um CRUD completo', 'VIDEO', 30, 200, 1),
(3, 'Deploy e boas práticas',   'TEXT',  10, 100, 2);

-- lessons — módulo 4 (Python Essencial)  module_id=4
INSERT INTO lessons (module_id, title, type, duration_minutes, xp_reward, lesson_order) VALUES
(4, 'Tipos e estruturas de dados', 'VIDEO', 15, 75,  1),
(4, 'Funções e módulos',           'VIDEO', 15, 75,  2),
(4, 'Quiz: Python Básico',         'QUIZ',  5,  100, 3);

-- lessons — módulo 5 (Pandas e NumPy)  module_id=5
INSERT INTO lessons (module_id, title, type, duration_minutes, xp_reward, lesson_order) VALUES
(5, 'Introdução ao Pandas',   'VIDEO', 20, 100, 1),
(5, 'DataFrames e operações', 'VIDEO', 20, 100, 2),
(5, 'NumPy e arrays',         'VIDEO', 15, 75,  3),
(5, 'Quiz: Pandas',           'QUIZ',  5,  150, 4);

-- lessons — módulo 6 (Docker Fundamentals)  module_id=6
INSERT INTO lessons (module_id, title, type, duration_minutes, xp_reward, lesson_order) VALUES
(6, 'Containers e imagens', 'VIDEO', 20, 100, 1),
(6, 'Docker Compose',       'VIDEO', 20, 100, 2),
(6, 'Quiz: Docker',         'QUIZ',  5,  150, 3);

-- lessons — módulo 7 (CI/CD com GitHub Actions)  module_id=7
INSERT INTO lessons (module_id, title, type, duration_minutes, xp_reward, lesson_order) VALUES
(7, 'Pipelines básicos',     'VIDEO', 15, 100, 1),
(7, 'Deploy automatizado',   'VIDEO', 20, 150, 2);


-- ============================================================
--  Verificação rápida
-- ============================================================
SELECT 'users'        AS tabela, COUNT(*) AS registros FROM users
UNION ALL
SELECT 'achievements',          COUNT(*) FROM achievements
UNION ALL
SELECT 'trails',                COUNT(*) FROM trails
UNION ALL
SELECT 'trail_modules',         COUNT(*) FROM trail_modules
UNION ALL
SELECT 'courses',               COUNT(*) FROM courses
UNION ALL
SELECT 'course_modules',        COUNT(*) FROM course_modules
UNION ALL
SELECT 'lessons',               COUNT(*) FROM lessons;
