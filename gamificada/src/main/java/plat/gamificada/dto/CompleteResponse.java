package plat.gamificada.dto;

import java.util.List;

public record CompleteResponse(
        int xpEarned,
        int totalXp,
        int level,
        boolean leveledUp,
        List<AchievementDto> newAchievements
) {}
