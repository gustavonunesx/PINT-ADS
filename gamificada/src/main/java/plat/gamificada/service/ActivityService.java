package plat.gamificada.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import plat.gamificada.dto.AchievementDto;
import plat.gamificada.dto.CompleteResponse;
import plat.gamificada.entity.*;
import plat.gamificada.repository.*;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final TrailModuleRepository trailModuleRepo;
    private final UserTrailModuleProgressRepository trailProgressRepo;
    private final LessonRepository lessonRepo;
    private final UserLessonProgressRepository lessonProgressRepo;
    private final XpService xpService;
    private final AchievementService achievementService;

    @Transactional
    public CompleteResponse completeTrailModule(Long moduleId, User user, int correctAnswers, int totalQuestions) {
        TrailModule module = trailModuleRepo.findById(moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Módulo de trilha não encontrado: " + moduleId));

        UserTrailModuleProgress progress = trailProgressRepo
                .findByUserAndTrailModule(user, module)
                .orElseGet(() -> {
                    UserTrailModuleProgress p = new UserTrailModuleProgress();
                    p.setUser(user);
                    p.setTrailModule(module);
                    return p;
                });

        if (progress.isCompleted()) {
            return new CompleteResponse(0, user.getXp(), user.getLevel(), List.of());
        }

        // Verifica lock: módulo i só pode ser completado se i-1 estiver done
        List<TrailModule> siblings = module.getTrail().getModules();
        int idx = -1;
        for (int i = 0; i < siblings.size(); i++) {
            if (siblings.get(i).getId().equals(moduleId)) { idx = i; break; }
        }
        if (idx > 0) {
            TrailModule prev = siblings.get(idx - 1);
            boolean prevDone = trailProgressRepo.findByUserAndTrailModule(user, prev)
                    .map(UserTrailModuleProgress::isCompleted).orElse(false);
            if (!prevDone) throw new IllegalStateException("Módulo anterior ainda não concluído");
        }

        int xpEarned;
        if (module.isQuiz() && totalQuestions > 0) {
            xpEarned = xpService.calcQuizXp(module.getBaseXP(), correctAnswers, totalQuestions);
        } else {
            xpEarned = module.getXpReward();
        }

        progress.setCompleted(true);
        progress.setCorrectAnswers(correctAnswers);
        progress.setTotalQuestions(totalQuestions);
        progress.setCompletedAt(LocalDateTime.now());
        trailProgressRepo.save(progress);

        xpService.addXp(user, xpEarned, "Módulo de trilha: " + module.getTitle());

        List<Achievement> unlocked = achievementService.checkAndUnlock(user);
        List<AchievementDto> achDtos = unlocked.stream()
                .map(a -> new AchievementDto(a.getId(), a.getKey(), a.getTitle(),
                        a.getDescription(), a.getIcon(), a.getXpReward(), LocalDateTime.now().toString()))
                .toList();

        return new CompleteResponse(xpEarned, user.getXp(), user.getLevel(), achDtos);
    }

    @Transactional
    public CompleteResponse completeLesson(Long lessonId, User user, int correctAnswers, int totalQuestions) {
        Lesson lesson = lessonRepo.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Lição não encontrada: " + lessonId));

        UserLessonProgress progress = lessonProgressRepo
                .findByUserAndLesson(user, lesson)
                .orElseGet(() -> {
                    UserLessonProgress p = new UserLessonProgress();
                    p.setUser(user);
                    p.setLesson(lesson);
                    return p;
                });

        if (progress.isCompleted()) {
            return new CompleteResponse(0, user.getXp(), user.getLevel(), List.of());
        }

        int xpEarned;
        if ("QUIZ".equalsIgnoreCase(lesson.getType()) && totalQuestions > 0) {
            xpEarned = xpService.calcQuizXp(lesson.getXpReward(), correctAnswers, totalQuestions);
        } else {
            xpEarned = lesson.getXpReward();
        }

        progress.setCompleted(true);
        progress.setCorrectAnswers(correctAnswers);
        progress.setTotalQuestions(totalQuestions);
        progress.setCompletedAt(LocalDateTime.now());
        lessonProgressRepo.save(progress);

        xpService.addXp(user, xpEarned, "Lição: " + lesson.getTitle());

        List<Achievement> unlocked = achievementService.checkAndUnlock(user);
        List<AchievementDto> achDtos = unlocked.stream()
                .map(a -> new AchievementDto(a.getId(), a.getKey(), a.getTitle(),
                        a.getDescription(), a.getIcon(), a.getXpReward(), LocalDateTime.now().toString()))
                .toList();

        return new CompleteResponse(xpEarned, user.getXp(), user.getLevel(), achDtos);
    }
}
