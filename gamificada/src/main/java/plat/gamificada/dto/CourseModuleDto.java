package plat.gamificada.dto;

import java.util.List;

public record CourseModuleDto(
        Long id,
        String title,
        int moduleOrder,
        List<LessonDto> lessons
) {}
