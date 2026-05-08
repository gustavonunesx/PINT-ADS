package plat.gamificada.dto;

public record TrailModuleDto(
        Long id,
        String title,
        String description,
        int moduleOrder,
        int xpReward,
        boolean quiz,
        boolean locked,
        boolean completed,
        int correctAnswers,
        int totalQuestions
) {}
