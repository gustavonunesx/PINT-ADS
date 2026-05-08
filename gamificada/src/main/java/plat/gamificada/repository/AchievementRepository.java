package plat.gamificada.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import plat.gamificada.entity.Achievement;

import java.util.Optional;

public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    Optional<Achievement> findByKey(String key);
}
