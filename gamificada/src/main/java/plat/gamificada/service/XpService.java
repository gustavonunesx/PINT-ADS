package plat.gamificada.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import plat.gamificada.entity.ActivityLog;
import plat.gamificada.entity.User;
import plat.gamificada.repository.ActivityLogRepository;
import plat.gamificada.repository.UserRepository;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class XpService {

    private static final int XP_PER_LEVEL = 5000;

    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;

    @Transactional
    public int addXp(User user, int xp, String description) {
        user.setXp(user.getXp() + xp);
        user.setLevel(user.getXp() / XP_PER_LEVEL + 1);
        updateStreak(user);
        userRepository.save(user);

        ActivityLog log = new ActivityLog();
        log.setUser(user);
        log.setXpEarned(xp);
        log.setDescription(description);
        log.setDate(LocalDate.now());
        activityLogRepository.save(log);

        return xp;
    }

    private void updateStreak(User user) {
        LocalDate today = LocalDate.now();
        LocalDate last = user.getLastActiveDate();

        if (last == null || last.isBefore(today.minusDays(1))) {
            user.setStreak(1);
        } else if (last.equals(today.minusDays(1))) {
            user.setStreak(user.getStreak() + 1);
        }
        // last == today: mantém streak atual
        user.setLastActiveDate(today);
    }

    public int xpToNextLevel(User user) {
        return XP_PER_LEVEL - (user.getXp() % XP_PER_LEVEL);
    }

    public int calcQuizXp(int baseXP, int correct, int total) {
        if (total == 0) return 0;
        return (int) Math.round(baseXP * ((double) correct / total));
    }
}
