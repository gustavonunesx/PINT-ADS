package plat.gamificada.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import plat.gamificada.entity.Course;
import plat.gamificada.entity.User;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByInstitution(User institution);
    java.util.Optional<Course> findByAccessCode(String accessCode);
    boolean existsByAccessCode(String accessCode);
}
