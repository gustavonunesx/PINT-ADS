package plat.gamificada.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import plat.gamificada.entity.Course;
import plat.gamificada.entity.CourseModule;

import java.util.List;
import java.util.Optional;

public interface CourseModuleRepository extends JpaRepository<CourseModule, Long> {
    List<CourseModule> findByCourseOrderByModuleOrderAsc(Course course);
    Optional<CourseModule> findFirstByCourseOrderByModuleOrderAsc(Course course);
}
