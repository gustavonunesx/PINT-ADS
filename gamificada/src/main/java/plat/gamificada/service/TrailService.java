package plat.gamificada.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import plat.gamificada.dto.TrailDto;
import plat.gamificada.dto.TrailModuleDto;
import plat.gamificada.entity.Trail;
import plat.gamificada.entity.TrailModule;
import plat.gamificada.entity.User;
import plat.gamificada.entity.UserTrailModuleProgress;
import plat.gamificada.repository.TrailRepository;
import plat.gamificada.repository.UserTrailModuleProgressRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrailService {

    private final TrailRepository trailRepository;
    private final UserTrailModuleProgressRepository progressRepo;

    public List<TrailDto> listAll(User user) {
        return trailRepository.findAll().stream()
                .map(t -> toDto(t, user))
                .toList();
    }

    public TrailDto getById(Long id, User user) {
        Trail trail = trailRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Trilha não encontrada: " + id));
        return toDto(trail, user);
    }

    private TrailDto toDto(Trail trail, User user) {
        List<UserTrailModuleProgress> progresses = progressRepo.findByUserAndTrailId(user, trail.getId());
        Map<Long, UserTrailModuleProgress> progressMap = progresses.stream()
                .collect(Collectors.toMap(p -> p.getTrailModule().getId(), p -> p));

        List<TrailModule> modules = trail.getModules();
        List<TrailModuleDto> moduleDtos = new ArrayList<>();

        for (int i = 0; i < modules.size(); i++) {
            TrailModule m = modules.get(i);
            UserTrailModuleProgress prog = progressMap.get(m.getId());

            boolean completed = prog != null && prog.isCompleted();
            // módulo 0 sempre desbloqueado; módulo i bloqueado até i-1 estar done
            boolean locked = i > 0 && !isModuleCompleted(progressMap, modules.get(i - 1).getId());

            moduleDtos.add(new TrailModuleDto(
                    m.getId(),
                    m.getTitle(),
                    m.getDescription(),
                    m.getModuleOrder(),
                    m.getXpReward(),
                    m.isQuiz() ? "quiz" : "lesson",
                    null,
                    m.isQuiz(),
                    locked,
                    completed,
                    prog != null ? prog.getCorrectAnswers() : 0,
                    prog != null ? prog.getTotalQuestions() : 0
            ));
        }

        long completedCount = moduleDtos.stream().filter(TrailModuleDto::completed).count();
        int xpTotal = moduleDtos.stream().mapToInt(TrailModuleDto::xpReward).sum();
        int xpEarned = moduleDtos.stream()
                .filter(TrailModuleDto::completed)
                .mapToInt(TrailModuleDto::xpReward)
                .sum();

        return new TrailDto(
                trail.getId(),
                trail.getTitle(),
                trail.getDescription(),
                trail.getCategory(),
                trail.getDifficulty(),
                trail.getThumbnailUrl(),
                trail.getColor(),
                trail.getBadge(),
                xpTotal,
                xpEarned,
                modules.size(),
                (int) completedCount,
                moduleDtos
        );
    }

    private boolean isModuleCompleted(Map<Long, UserTrailModuleProgress> map, Long moduleId) {
        UserTrailModuleProgress p = map.get(moduleId);
        return p != null && p.isCompleted();
    }
}
