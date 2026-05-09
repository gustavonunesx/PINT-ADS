package plat.gamificada.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import plat.gamificada.entity.Course;
import plat.gamificada.entity.User;
import plat.gamificada.entity.UserCourseProgress;

public interface UserCourseProgressRepository extends JpaRepository<UserCourseProgress, Long> {
    boolean existsByCourseAndUser(Course course, User user);
}
