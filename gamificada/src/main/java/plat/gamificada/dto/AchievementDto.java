package plat.gamificada.dto;

public record AchievementDto(
        Long id,
        String key,
        String title,
        String description,
        String icon,
        int xpReward,
        String unlockedAt
) {}
