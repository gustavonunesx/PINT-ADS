package plat.gamificada.dto;

public record UserProfileDto(
        Long id,
        String name,
        String email,
        String role,
        String type,
        String companyName,
        int xp,
        int level,
        int xpToNextLevel,
        int streak
) {}
