package plat.gamificada.dto;

import java.util.List;

public record CourseDto(
        Long id,
        String title,
        String description,
        String category,
        String difficulty,
        String thumbnailUrl,
        String institutionName,
        int totalLessons,
        int completedLessons,
        List<CourseModuleDto> modules
) {}
