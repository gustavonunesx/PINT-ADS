package plat.gamificada.dto;

public record TrailModuleDto(
        Long id,
        String title,
        String description,
        int moduleOrder,
        int xpReward,
        String type,
        String duration,
        boolean quiz,
        boolean locked,
        boolean completed,
        int correctAnswers,
        int totalQuestions
) {}
