package plat.gamificada.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import plat.gamificada.entity.*;
import plat.gamificada.repository.*;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepo;
    private final TrailRepository trailRepo;
    private final TrailModuleRepository trailModuleRepo;
    private final CourseRepository courseRepo;
    private final CourseModuleRepository courseModuleRepo;
    private final LessonRepository lessonRepo;
    private final AchievementRepository achievementRepo;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepo.count() > 0) return; // já inicializado

        // ── Usuários ────────────────────────────────────────────────
        User institution = new User();
        institution.setName("SENAI Digital");
        institution.setEmail("senai@example.com");
        institution.setRole(User.Role.INSTITUTION);
        institution.setCompanyName("SENAI Digital");
        userRepo.save(institution);

        User student1 = new User();
        student1.setName("Ana Silva");
        student1.setEmail("ana@example.com");
        student1.setRole(User.Role.STUDENT);
        student1.setXp(3200);
        student1.setLevel(1);
        student1.setStreak(5);
        userRepo.save(student1);

        User student2 = new User();
        student2.setName("Carlos Mendes");
        student2.setEmail("carlos@example.com");
        student2.setRole(User.Role.STUDENT);
        student2.setXp(7800);
        student2.setLevel(2);
        student2.setStreak(12);
        userRepo.save(student2);

        User student3 = new User();
        student3.setName("Beatriz Costa");
        student3.setEmail("beatriz@example.com");
        student3.setRole(User.Role.STUDENT);
        student3.setXp(1500);
        student3.setLevel(1);
        student3.setStreak(2);
        userRepo.save(student3);

        // ── Conquistas ──────────────────────────────────────────────
        seedAchievements();

        // ── Trilhas ─────────────────────────────────────────────────
        seedTrails();

        // ── Cursos ──────────────────────────────────────────────────
        seedCourses(institution);
    }

    private void seedAchievements() {
        List<Object[]> defs = List.of(
            new Object[]{"first_lesson",      "Primeira Lição",        "Complete sua primeira lição",           "🎯", 50,  "LESSONS_COMPLETED",       1},
            new Object[]{"lessons_5",         "Estudante Dedicado",    "Complete 5 lições",                     "📚", 100, "LESSONS_COMPLETED",       5},
            new Object[]{"lessons_20",        "Mestre das Lições",     "Complete 20 lições",                    "🏆", 300, "LESSONS_COMPLETED",       20},
            new Object[]{"first_trail",       "Trilheiro Iniciante",   "Complete seu primeiro módulo de trilha","🌱", 100, "TRAIL_MODULES_COMPLETED", 1},
            new Object[]{"trail_modules_5",   "Explorador",            "Complete 5 módulos de trilha",          "🗺️", 200, "TRAIL_MODULES_COMPLETED", 5},
            new Object[]{"trail_modules_15",  "Desbravador",           "Complete 15 módulos de trilha",         "⚔️", 500, "TRAIL_MODULES_COMPLETED", 15},
            new Object[]{"xp_1000",           "Mil Pontos",            "Acumule 1000 XP",                       "⭐", 0,   "XP_EARNED",               1000},
            new Object[]{"xp_5000",           "Primeiro Nível",        "Alcance 5000 XP (Nível 2)",             "🌟", 0,   "XP_EARNED",               5000},
            new Object[]{"xp_10000",          "Segundo Nível",         "Alcance 10000 XP (Nível 3)",            "💫", 0,   "XP_EARNED",               10000},
            new Object[]{"streak_3",          "Sequência de 3",        "Mantenha uma sequência de 3 dias",      "🔥", 50,  "STREAK_DAYS",             3},
            new Object[]{"streak_7",          "Uma Semana Inteira",    "Mantenha uma sequência de 7 dias",      "🔥", 150, "STREAK_DAYS",             7},
            new Object[]{"streak_30",         "Mês Perfeito",          "Mantenha uma sequência de 30 dias",     "🔥", 500, "STREAK_DAYS",             30}
        );

        for (Object[] d : defs) {
            Achievement a = new Achievement();
            a.setKey((String) d[0]);
            a.setTitle((String) d[1]);
            a.setDescription((String) d[2]);
            a.setIcon((String) d[3]);
            a.setXpReward((int) d[4]);
            a.setConditionType((String) d[5]);
            a.setConditionThreshold((int) d[6]);
            achievementRepo.save(a);
        }
    }

    private void seedTrails() {
        // Trilha 1: Programação Web
        Trail web = new Trail();
        web.setTitle("Fundamentos de Programação Web");
        web.setDescription("Aprenda HTML, CSS e JavaScript do zero ao avançado");
        web.setCategory("Tecnologia");
        web.setDifficulty("BEGINNER");
        web.setThumbnailUrl("https://placehold.co/400x200/4F46E5/white?text=Web");
        trailRepo.save(web);

        addTrailModule(web, 1, "Introdução ao HTML",    "Estrutura básica de páginas web", false, 150, 0);
        addTrailModule(web, 2, "CSS e Estilização",     "Estilos, cores e layout com CSS", false, 200, 0);
        addTrailModule(web, 3, "Quiz: HTML & CSS",      "Teste seus conhecimentos",         true,  0,   300);
        addTrailModule(web, 4, "JavaScript Básico",     "Variáveis, funções e DOM",         false, 250, 0);
        addTrailModule(web, 5, "JavaScript Avançado",   "Promises, async/await e APIs",     false, 300, 0);
        addTrailModule(web, 6, "Quiz Final: Web Dev",   "Avaliação completa de Web Dev",    true,  0,   500);

        // Trilha 2: Banco de Dados
        Trail db = new Trail();
        db.setTitle("Banco de Dados Essencial");
        db.setDescription("SQL, modelagem e boas práticas com MySQL e PostgreSQL");
        db.setCategory("Dados");
        db.setDifficulty("INTERMEDIATE");
        db.setThumbnailUrl("https://placehold.co/400x200/0891B2/white?text=DB");
        trailRepo.save(db);

        addTrailModule(db, 1, "Modelagem Relacional",  "Entidades, atributos e relações",  false, 200, 0);
        addTrailModule(db, 2, "SQL Básico",             "SELECT, INSERT, UPDATE, DELETE",    false, 250, 0);
        addTrailModule(db, 3, "Quiz: SQL",              "Teste de SQL",                      true,  0,   350);
        addTrailModule(db, 4, "Joins e Subqueries",     "INNER, LEFT, RIGHT JOIN",           false, 300, 0);
        addTrailModule(db, 5, "Índices e Performance",  "Otimização de queries",             false, 350, 0);

        // Trilha 3: Java e Spring
        Trail java = new Trail();
        java.setTitle("Java e Spring Boot");
        java.setDescription("Desenvolvimento backend profissional com Java 21 e Spring Boot");
        java.setCategory("Backend");
        java.setDifficulty("ADVANCED");
        java.setThumbnailUrl("https://placehold.co/400x200/DC2626/white?text=Java");
        trailRepo.save(java);

        addTrailModule(java, 1, "Java Moderno",         "Records, sealed classes, pattern matching", false, 200, 0);
        addTrailModule(java, 2, "Spring Core",          "IoC, DI, Beans e contexto",                 false, 250, 0);
        addTrailModule(java, 3, "Spring Data JPA",      "Repositories, JPQL e relacionamentos",      false, 300, 0);
        addTrailModule(java, 4, "Quiz: Spring",         "Avaliação Spring Boot",                     true,  0,   400);
        addTrailModule(java, 5, "REST APIs",            "Controllers, DTOs e validações",            false, 350, 0);
    }

    private void addTrailModule(Trail trail, int order, String title, String desc,
                                 boolean quiz, int xpReward, int baseXP) {
        TrailModule m = new TrailModule();
        m.setTrail(trail);
        m.setModuleOrder(order);
        m.setTitle(title);
        m.setDescription(desc);
        m.setQuiz(quiz);
        m.setXpReward(xpReward);
        m.setBaseXP(baseXP);
        trailModuleRepo.save(m);
    }

    private void seedCourses(User institution) {
        // Curso 1: React para Iniciantes
        Course react = new Course();
        react.setTitle("React para Iniciantes");
        react.setDescription("Aprenda React 19 com hooks, estado e componentes");
        react.setCategory("Frontend");
        react.setDifficulty("BEGINNER");
        react.setThumbnailUrl("https://placehold.co/400x200/06B6D4/white?text=React");
        react.setInstitution(institution);
        courseRepo.save(react);

        CourseModule m1 = addCourseModule(react, 1, "Fundamentos do React");
        addLesson(m1, 1, "O que é React?",          "VIDEO", 10, 50);
        addLesson(m1, 2, "Componentes e JSX",        "VIDEO", 15, 75);
        addLesson(m1, 3, "Quiz: Fundamentos",        "QUIZ",  5,  100);

        CourseModule m2 = addCourseModule(react, 2, "Hooks e Estado");
        addLesson(m2, 1, "useState e useEffect",    "VIDEO", 20, 100);
        addLesson(m2, 2, "useContext e useRef",      "VIDEO", 15, 75);
        addLesson(m2, 3, "Quiz: Hooks",              "QUIZ",  5,  150);

        CourseModule m3 = addCourseModule(react, 3, "Projeto Final");
        addLesson(m3, 1, "Criando um CRUD completo", "VIDEO", 30, 200);
        addLesson(m3, 2, "Deploy e boas práticas",   "TEXT",  10, 100);

        // Curso 2: Python para Dados
        Course python = new Course();
        python.setTitle("Python para Ciência de Dados");
        python.setDescription("Pandas, NumPy, visualização e análise de dados com Python");
        python.setCategory("Dados");
        python.setDifficulty("INTERMEDIATE");
        python.setThumbnailUrl("https://placehold.co/400x200/F59E0B/white?text=Python");
        python.setInstitution(institution);
        courseRepo.save(python);

        CourseModule p1 = addCourseModule(python, 1, "Python Essencial");
        addLesson(p1, 1, "Tipos e estruturas de dados", "VIDEO", 15, 75);
        addLesson(p1, 2, "Funções e módulos",           "VIDEO", 15, 75);
        addLesson(p1, 3, "Quiz: Python Básico",         "QUIZ",  5,  100);

        CourseModule p2 = addCourseModule(python, 2, "Pandas e NumPy");
        addLesson(p2, 1, "Introdução ao Pandas",        "VIDEO", 20, 100);
        addLesson(p2, 2, "DataFrames e operações",      "VIDEO", 20, 100);
        addLesson(p2, 3, "NumPy e arrays",              "VIDEO", 15, 75);
        addLesson(p2, 4, "Quiz: Pandas",                "QUIZ",  5,  150);

        // Curso 3: DevOps
        Course devops = new Course();
        devops.setTitle("DevOps na Prática");
        devops.setDescription("Docker, CI/CD, Kubernetes e boas práticas de entrega contínua");
        devops.setCategory("Infraestrutura");
        devops.setDifficulty("ADVANCED");
        devops.setThumbnailUrl("https://placehold.co/400x200/10B981/white?text=DevOps");
        devops.setInstitution(institution);
        courseRepo.save(devops);

        CourseModule d1 = addCourseModule(devops, 1, "Docker Fundamentals");
        addLesson(d1, 1, "Containers e imagens",        "VIDEO", 20, 100);
        addLesson(d1, 2, "Docker Compose",              "VIDEO", 20, 100);
        addLesson(d1, 3, "Quiz: Docker",                "QUIZ",  5,  150);

        CourseModule d2 = addCourseModule(devops, 2, "CI/CD com GitHub Actions");
        addLesson(d2, 1, "Pipelines básicos",           "VIDEO", 15, 100);
        addLesson(d2, 2, "Deploy automatizado",         "VIDEO", 20, 150);
    }

    private CourseModule addCourseModule(Course course, int order, String title) {
        CourseModule m = new CourseModule();
        m.setCourse(course);
        m.setModuleOrder(order);
        m.setTitle(title);
        courseModuleRepo.save(m);
        return m;
    }

    private void addLesson(CourseModule module, int order, String title, String type,
                            int durationMinutes, int xpReward) {
        Lesson l = new Lesson();
        l.setModule(module);
        l.setLessonOrder(order);
        l.setTitle(title);
        l.setType(type);
        l.setDurationMinutes(durationMinutes);
        l.setXpReward(xpReward);
        lessonRepo.save(l);
    }
}
