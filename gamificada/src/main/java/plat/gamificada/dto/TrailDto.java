package plat.gamificada.dto;

import java.util.List;

public record TrailDto(
        Long id,
        String title,
        String description,
        String category,
        String difficulty,
        String thumbnailUrl,
        String color,
        String badge,
        int xpTotal,
        int xpEarned,
        int totalModules,
        int completedModules,
        List<TrailModuleDto> modules
) {}
