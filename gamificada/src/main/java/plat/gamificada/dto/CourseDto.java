package plat.gamificada.dto;

import java.util.List;

public record CourseDto(
        Long id,
        String name,
        String description,
        String category,
        String difficulty,
        String thumbnailUrl,
        String color,
        String institution,
        String accessCode,
        boolean published,
        int totalLessons,
        int completedLessons,
        int lessonsCount,
        int enrolledCount,
        List<CourseModuleDto> modules,
        List<CourseLessonDto> lessons_list,
        List<CourseLessonDto> lessons
) {}
