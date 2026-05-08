package plat.gamificada.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import plat.gamificada.dto.LeaderboardEntryDto;
import plat.gamificada.entity.User;
import plat.gamificada.repository.ActivityLogRepository;
import plat.gamificada.repository.UserRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;

    public List<LeaderboardEntryDto> getLeaderboard(String period, String tab) {
        List<User> users = userRepository.findByRole(User.Role.STUDENT);

        if ("weekly".equalsIgnoreCase(period)) {
            return buildWeeklyLeaderboard(users);
        }
        // monthly ou all-time: usa xp total do usuário
        return buildAllTimeLeaderboard(users);
    }

    private List<LeaderboardEntryDto> buildWeeklyLeaderboard(List<User> users) {
        LocalDate from = LocalDate.now().minusDays(7);
        List<Object[]> rows = activityLogRepository.sumXpByUserSince(from);

        Map<Long, Integer> weeklyXp = rows.stream()
                .collect(Collectors.toMap(
                        r -> (Long) r[0],
                        r -> ((Number) r[1]).intValue()
                ));

        Map<Long, User> userMap = users.stream().collect(Collectors.toMap(User::getId, u -> u));

        List<LeaderboardEntryDto> entries = new ArrayList<>();
        weeklyXp.entrySet().stream()
                .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
                .forEach(e -> {
                    User u = userMap.get(e.getKey());
                    if (u != null) {
                        entries.add(new LeaderboardEntryDto(
                                entries.size() + 1,
                                u.getId(), u.getName(),
                                e.getValue(), u.getLevel(), u.getStreak()
                        ));
                    }
                });

        // inclui usuários sem atividade na semana com xp=0
        userMap.values().stream()
                .filter(u -> !weeklyXp.containsKey(u.getId()))
                .forEach(u -> entries.add(new LeaderboardEntryDto(
                        entries.size() + 1,
                        u.getId(), u.getName(), 0, u.getLevel(), u.getStreak()
                )));

        return entries;
    }

    private List<LeaderboardEntryDto> buildAllTimeLeaderboard(List<User> users) {
        List<LeaderboardEntryDto> entries = new ArrayList<>();
        users.stream()
                .sorted((a, b) -> Integer.compare(b.getXp(), a.getXp()))
                .forEach(u -> entries.add(new LeaderboardEntryDto(
                        entries.size() + 1,
                        u.getId(), u.getName(), u.getXp(), u.getLevel(), u.getStreak()
                )));
        return entries;
    }
}
