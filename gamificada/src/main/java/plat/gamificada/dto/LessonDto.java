package plat.gamificada.dto;

public record LessonDto(
        Long id,
        String title,
        String type,
        int durationMinutes,
        int xpReward,
        int lessonOrder,
        boolean completed,
        int correctAnswers,
        int totalQuestions
) {}
