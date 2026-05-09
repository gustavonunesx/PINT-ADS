package plat.gamificada.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import plat.gamificada.entity.Course;
import plat.gamificada.entity.CourseModule;
import plat.gamificada.entity.Lesson;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByModuleOrderByLessonOrderAsc(CourseModule module);
    long countByModule(CourseModule module);
    long countByModule_Course(Course course);
}
