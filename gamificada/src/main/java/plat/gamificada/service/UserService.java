package plat.gamificada.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import plat.gamificada.dto.*;
import plat.gamificada.entity.ActivityLog;
import plat.gamificada.entity.User;
import plat.gamificada.entity.UserAchievement;
import plat.gamificada.repository.ActivityLogRepository;
import plat.gamificada.repository.UserAchievementRepository;
import plat.gamificada.repository.UserLessonProgressRepository;
import plat.gamificada.repository.UserRepository;
import plat.gamificada.repository.UserTrailModuleProgressRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final UserLessonProgressRepository lessonProgressRepo;
    private final UserTrailModuleProgressRepository trailProgressRepo;
    private final XpService xpService;

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + id));
    }

    public UserProfileDto toProfileDto(User user) {
        String roleStr = user.getRole().name();
        return new UserProfileDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                roleStr,
                roleStr.equalsIgnoreCase("INSTITUTION") ? "institution" : "student",
                user.getCompanyName(),
                user.getXp(),
                user.getLevel(),
                xpService.xpToNextLevel(user),
                user.getStreak()
        );
    }

    public DashboardDto getDashboard(Long userId) {
        User user = findById(userId);

        long lessons = lessonProgressRepo.countByUserAndCompleted(user, true);
        long trailMods = trailProgressRepo.countByUserAndCompleted(user, true);

        List<ActivityLogDto> recentActivity = activityLogRepository
                .findByUserOrderByDateDesc(user).stream()
                .limit(10)
                .map(this::toActivityDto)
                .toList();

        List<AchievementDto> recentAchievements = userAchievementRepository
                .findByUser(user).stream()
                .sorted((a, b) -> b.getUnlockedAt().compareTo(a.getUnlockedAt()))
                .limit(5)
                .map(this::toAchievementDto)
                .toList();

        return new DashboardDto(
                toProfileDto(user),
                (int) lessons,
                (int) trailMods,
                0,
                recentActivity,
                recentAchievements
        );
    }

    public List<AchievementDto> getAchievements(Long userId) {
        User user = findById(userId);
        return userAchievementRepository.findByUser(user).stream()
                .map(this::toAchievementDto)
                .toList();
    }

    private ActivityLogDto toActivityDto(ActivityLog log) {
        return new ActivityLogDto(log.getId(), log.getXpEarned(), log.getDescription(),
                log.getDate().toString());
    }

    private AchievementDto toAchievementDto(UserAchievement ua) {
        return new AchievementDto(
                ua.getAchievement().getId(),
                ua.getAchievement().getKey(),
                ua.getAchievement().getTitle(),
                ua.getAchievement().getDescription(),
                ua.getAchievement().getIcon(),
                ua.getAchievement().getXpReward(),
                ua.getUnlockedAt().toString()
        );
    }
}
