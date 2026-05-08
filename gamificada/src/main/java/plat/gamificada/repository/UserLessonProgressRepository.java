package plat.gamificada.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import plat.gamificada.entity.Lesson;
import plat.gamificada.entity.User;
import plat.gamificada.entity.UserLessonProgress;

import java.util.List;
import java.util.Optional;

public interface UserLessonProgressRepository extends JpaRepository<UserLessonProgress, Long> {
    Optional<UserLessonProgress> findByUserAndLesson(User user, Lesson lesson);
    List<UserLessonProgress> findByUser(User user);
    long countByUserAndCompleted(User user, boolean completed);

    @Query("SELECT p FROM UserLessonProgress p WHERE p.user = :user AND p.lesson.module.course.id = :courseId")
    List<UserLessonProgress> findByUserAndCourseId(User user, Long courseId);
}
