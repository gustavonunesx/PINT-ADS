package plat.gamificada.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateLessonRequest(
        @NotBlank String title,
        String duration,
        String videoUrl,
        boolean published
) {}
