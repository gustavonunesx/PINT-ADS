package plat.gamificada.dto;

public record CompleteLessonRequest(
        int correctAnswers,
        int totalQuestions
) {}
