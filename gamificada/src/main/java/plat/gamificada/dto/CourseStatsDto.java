package plat.gamificada.dto;

public record CourseStatsDto(
        long enrolledCount,
        double avgProgress,
        long completedCount,
        long totalLessons
) {}
