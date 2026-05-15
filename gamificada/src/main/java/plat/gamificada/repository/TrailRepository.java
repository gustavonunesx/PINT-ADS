package plat.gamificada.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import plat.gamificada.entity.Trail;

public interface TrailRepository extends JpaRepository<Trail, Long> {
}
