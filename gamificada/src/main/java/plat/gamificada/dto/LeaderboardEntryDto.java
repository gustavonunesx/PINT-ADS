package plat.gamificada.dto;

public record LeaderboardEntryDto(
        int rank,
        Long userId,
        String name,
        int xp,
        int level,
        int streak
) {}
