package plat.gamificada.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import plat.gamificada.entity.Achievement;
import plat.gamificada.entity.User;
import plat.gamificada.entity.UserAchievement;
import plat.gamificada.repository.AchievementRepository;
import plat.gamificada.repository.UserAchievementRepository;
import plat.gamificada.repository.UserLessonProgressRepository;
import plat.gamificada.repository.UserTrailModuleProgressRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AchievementService {

    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final UserLessonProgressRepository lessonProgressRepo;
    private final UserTrailModuleProgressRepository trailProgressRepo;
    private final XpService xpService;

    @Transactional
    public List<Achievement> checkAndUnlock(User user) {
        List<Achievement> all = achievementRepository.findAll();
        List<Achievement> newlyUnlocked = new ArrayList<>();

        long lessonsCompleted = lessonProgressRepo.countByUserAndCompleted(user, true);
        long trailModulesCompleted = trailProgressRepo.countByUserAndCompleted(user, true);

        for (Achievement ach : all) {
            if (userAchievementRepository.existsByUserAndAchievement(user, ach)) continue;

            boolean met = switch (ach.getConditionType()) {
                case "XP_EARNED"               -> user.getXp() >= ach.getConditionThreshold();
                case "STREAK_DAYS"             -> user.getStreak() >= ach.getConditionThreshold();
                case "LESSONS_COMPLETED"       -> lessonsCompleted >= ach.getConditionThreshold();
                case "TRAIL_MODULES_COMPLETED" -> trailModulesCompleted >= ach.getConditionThreshold();
                default -> false;
            };

            if (met) {
                UserAchievement ua = new UserAchievement();
                ua.setUser(user);
                ua.setAchievement(ach);
                ua.setUnlockedAt(LocalDateTime.now());
                userAchievementRepository.save(ua);

                if (ach.getXpReward() > 0) {
                    xpService.addXp(user, ach.getXpReward(), "Conquista: " + ach.getTitle());
                }
                newlyUnlocked.add(ach);
            }
        }
        return newlyUnlocked;
    }
}
