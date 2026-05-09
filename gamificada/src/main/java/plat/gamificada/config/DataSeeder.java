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
    private final AchievementRepository achievementRepo;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepo.count() > 0) return;

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
}
