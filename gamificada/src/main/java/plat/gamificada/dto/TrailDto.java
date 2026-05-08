package plat.gamificada.dto;

import java.util.List;

public record TrailDto(
        Long id,
        String title,
        String description,
        String category,
        String difficulty,
        String thumbnailUrl,
        int totalModules,
        int completedModules,
        List<TrailModuleDto> modules
) {}
