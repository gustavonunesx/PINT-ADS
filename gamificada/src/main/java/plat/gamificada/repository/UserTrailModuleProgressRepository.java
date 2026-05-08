package plat.gamificada.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import plat.gamificada.entity.TrailModule;
import plat.gamificada.entity.User;
import plat.gamificada.entity.UserTrailModuleProgress;

import java.util.List;
import java.util.Optional;

public interface UserTrailModuleProgressRepository extends JpaRepository<UserTrailModuleProgress, Long> {
    Optional<UserTrailModuleProgress> findByUserAndTrailModule(User user, TrailModule module);
    List<UserTrailModuleProgress> findByUser(User user);
    long countByUserAndCompleted(User user, boolean completed);

    @Query("SELECT p FROM UserTrailModuleProgress p WHERE p.user = :user AND p.trailModule.trail.id = :trailId")
    List<UserTrailModuleProgress> findByUserAndTrailId(User user, Long trailId);
}
