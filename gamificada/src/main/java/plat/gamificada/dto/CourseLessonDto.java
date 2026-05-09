package plat.gamificada.dto;

public record CourseLessonDto(
        Long id,
        String title,
        String duration,
        String videoUrl,
        boolean published,
        String status
) {}
