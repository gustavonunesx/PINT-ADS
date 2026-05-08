package plat.gamificada.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import plat.gamificada.entity.Trail;
import plat.gamificada.entity.TrailModule;

import java.util.List;

public interface TrailModuleRepository extends JpaRepository<TrailModule, Long> {
    List<TrailModule> findByTrailOrderByModuleOrderAsc(Trail trail);
}
