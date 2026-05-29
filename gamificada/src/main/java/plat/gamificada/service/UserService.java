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

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

        List<WeeklyDayDto> weeklyStats = buildWeeklyStats(user);

        return new DashboardDto(
                toProfileDto(user),
                (int) lessons,
                (int) trailMods,
                0,
                recentActivity,
                recentAchievements,
                weeklyStats
        );
    }

    public List<AchievementDto> getAchievements(Long userId) {
        User user = findById(userId);
        return userAchievementRepository.findByUser(user).stream()
                .map(this::toAchievementDto)
                .toList();
    }

    private List<WeeklyDayDto> buildWeeklyStats(User user) {
        LocalDate today    = LocalDate.now();
        LocalDate monday   = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sunday   = monday.plusDays(6);

        List<ActivityLog> weekLogs = activityLogRepository.findByUserAndDateAfter(user, monday.minusDays(1));

        Map<LocalDate, Integer> xpByDay = weekLogs.stream()
                .filter(l -> !l.getDate().isAfter(sunday))
                .collect(Collectors.groupingBy(
                        ActivityLog::getDate,
                        Collectors.summingInt(ActivityLog::getXpEarned)
                ));

        String[] labels = { "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom" };
        List<WeeklyDayDto> result = new ArrayList<>(7);
        for (int i = 0; i < 7; i++) {
            LocalDate day    = monday.plusDays(i);
            int xp           = xpByDay.getOrDefault(day, 0);
            boolean done     = xp > 0;
            result.add(new WeeklyDayDto(labels[i], xp, done));
        }
        return result;
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
