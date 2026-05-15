package plat.gamificada.dto;

public record ActivityLogDto(
        Long id,
        int xpEarned,
        String description,
        String date
) {}
