package plat.gamificada.dto;

import java.util.List;

public record DashboardDto(
        UserProfileDto user,
        int lessonsCompleted,
        int trailModulesCompleted,
        int coursesInProgress,
        List<ActivityLogDto> recentActivity,
        List<AchievementDto> recentAchievements,
        List<WeeklyDayDto> weeklyStats
) {}
