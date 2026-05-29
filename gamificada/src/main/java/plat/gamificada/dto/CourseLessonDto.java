package plat.gamificada.dto;

public record CourseLessonDto(
        Long id,
        String title,
        String duration,
        String videoUrl,
        String thumbnailUrl,
        boolean published,
        String status
) {}
