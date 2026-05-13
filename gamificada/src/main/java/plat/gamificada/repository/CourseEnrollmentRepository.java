package plat.gamificada.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import plat.gamificada.entity.Course;
import plat.gamificada.entity.CourseEnrollment;
import plat.gamificada.entity.User;

import java.util.List;

public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {
    List<CourseEnrollment> findByStudent(User student);
    List<CourseEnrollment> findByCourse(Course course);
    List<CourseEnrollment> findByCourseIn(List<Course> courses);
    boolean existsByCourseAndStudent(Course course, User student);
    long countByCourse(Course course);
}
