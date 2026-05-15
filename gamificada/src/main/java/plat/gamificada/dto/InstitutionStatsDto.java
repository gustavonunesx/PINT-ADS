package plat.gamificada.dto;

public record InstitutionStatsDto(
        int totalCourses,
        int totalStudents,
        int totalLessonsCompleted,
        int totalXpDistributed
) {}
