package plat.gamificada.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import plat.gamificada.dto.LeaderboardEntryDto;
import plat.gamificada.entity.User;
import plat.gamificada.repository.ActivityLogRepository;
import plat.gamificada.repository.CourseEnrollmentRepository;
import plat.gamificada.repository.UserRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final CourseEnrollmentRepository enrollmentRepository;

    public List<LeaderboardEntryDto> getLeaderboard(String period, String tab) {
        // only students enrolled in at least one course
        Set<Long> enrolledIds = enrollmentRepository.findAll().stream()
                .map(e -> e.getStudent().getId())
                .collect(Collectors.toSet());
        List<User> users = userRepository.findByRole(User.Role.STUDENT).stream()
                .filter(u -> enrolledIds.contains(u.getId()))
                .collect(Collectors.toList());

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
        for (int i = 0; i < sorted.size(); i++) {
            User u = userMap.get(sorted.get(i)[0]);
            if (u != null) {
                entries.add(new LeaderboardEntryDto(
                        i + 1, u.getId(), u.getName(),
                        xpMap.getOrDefault(u.getId(), 0), u.getLevel(), u.getStreak()
                ));
            }
        }
        return entries;
    }
}
