package plat.gamificada.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCourseRequest(
        @NotBlank String name,
        String description,
        String category,
        String difficulty,
        String thumbnailUrl,
        String color,
        int xpReward,
        String institution  // ignorado — vem do token
) {}
