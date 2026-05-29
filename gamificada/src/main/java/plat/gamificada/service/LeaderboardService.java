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

        List<long[]> sorted = users.stream()
                .map(u -> new long[]{ u.getId(), weeklyXp.getOrDefault(u.getId(), 0) })
                .sorted((a, b) -> a[1] != b[1] ? Long.compare(b[1], a[1]) : Long.compare(a[0], b[0]))
                .collect(Collectors.toList());

        Map<Long, User> userMap = users.stream().collect(Collectors.toMap(User::getId, u -> u));
        return assignRanks(sorted, userMap, weeklyXp);
    }

    private List<LeaderboardEntryDto> buildAllTimeLeaderboard(List<User> users) {
        List<long[]> sorted = users.stream()
                .map(u -> new long[]{ u.getId(), u.getXp() })
                .sorted((a, b) -> a[1] != b[1] ? Long.compare(b[1], a[1]) : Long.compare(a[0], b[0]))
                .collect(Collectors.toList());

        Map<Long, User> userMap = users.stream().collect(Collectors.toMap(User::getId, u -> u));
        Map<Long, Integer> xpMap = users.stream().collect(Collectors.toMap(User::getId, User::getXp));
        return assignRanks(sorted, userMap, xpMap);
    }

    private List<LeaderboardEntryDto> assignRanks(List<long[]> sorted, Map<Long, User> userMap, Map<Long, Integer> xpMap) {
        List<LeaderboardEntryDto> entries = new ArrayList<>();
        int rank = 1;
        for (int i = 0; i < sorted.size(); i++) {
            if (i > 0 && sorted.get(i)[1] < sorted.get(i - 1)[1]) {
                rank = i + 1;
            }
            User u = userMap.get(sorted.get(i)[0]);
            if (u != null) {
                entries.add(new LeaderboardEntryDto(
                        rank, u.getId(), u.getName(),
                        xpMap.getOrDefault(u.getId(), 0), u.getLevel(), u.getStreak()
                ));
            }
        }
        return entries;
    }
}
