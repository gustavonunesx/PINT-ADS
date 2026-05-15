package plat.gamificada.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import plat.gamificada.entity.Course;
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

    @Query("SELECT COUNT(p) FROM UserLessonProgress p WHERE p.user = :user AND p.lesson.module.course.id = :courseId AND p.completed = true")
    long countCompletedByUserAndCourse(User user, Long courseId);

    @Query("SELECT COUNT(p) FROM UserLessonProgress p WHERE p.lesson.module.course.institution = :institution AND p.completed = true")
    long countCompletedByInstitution(@Param("institution") User institution);

    @Query("SELECT COALESCE(SUM(p.lesson.xpReward), 0) FROM UserLessonProgress p WHERE p.lesson.module.course.institution = :institution AND p.completed = true")
    long sumXpByInstitution(@Param("institution") User institution);

    @Modifying
    @Query("DELETE FROM UserLessonProgress p WHERE p.lesson.module.course = :course")
    void deleteByCourse(@Param("course") Course course);
}
