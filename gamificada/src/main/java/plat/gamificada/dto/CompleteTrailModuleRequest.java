package plat.gamificada.dto;

public record CompleteTrailModuleRequest(
        int correctAnswers,
        int totalQuestions
) {}
