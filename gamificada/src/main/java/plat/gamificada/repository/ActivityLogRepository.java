package plat.gamificada.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import plat.gamificada.entity.ActivityLog;
import plat.gamificada.entity.User;

import java.time.LocalDate;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByUserOrderByDateDesc(User user);

    @Query("SELECT a FROM ActivityLog a WHERE a.user = :user AND a.date >= :from ORDER BY a.date DESC")
    List<ActivityLog> findByUserAndDateAfter(User user, LocalDate from);

    @Query("SELECT a.user.id, SUM(a.xpEarned) FROM ActivityLog a WHERE a.date >= :from GROUP BY a.user.id ORDER BY SUM(a.xpEarned) DESC")
    List<Object[]> sumXpByUserSince(LocalDate from);
}
