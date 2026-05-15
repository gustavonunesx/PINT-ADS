package plat.gamificada.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import plat.gamificada.dto.CourseStatsDto;
import plat.gamificada.dto.InstitutionStatsDto;
import plat.gamificada.entity.Course;
import plat.gamificada.entity.CourseEnrollment;
import plat.gamificada.entity.User;
import plat.gamificada.repository.CourseEnrollmentRepository;
import plat.gamificada.repository.CourseRepository;
import plat.gamificada.repository.LessonRepository;
import plat.gamificada.repository.UserCourseProgressRepository;
import plat.gamificada.repository.UserLessonProgressRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InstitutionService {

    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final LessonRepository lessonRepository;
    private final UserLessonProgressRepository lessonProgressRepo;
    private final UserCourseProgressRepository courseProgressRepo;

    public InstitutionStatsDto getStats(User institution) {
        List<Course> courses = courseRepository.findByInstitution(institution);

        // distinct students enrolled in any of the institution's courses
        long totalStudents = enrollmentRepository.findByCourseIn(courses)
                .stream()
                .map(e -> e.getStudent().getId())
                .distinct()
                .count();

        long totalCompleted = lessonProgressRepo.countCompletedByInstitution(institution);
        long totalXp = lessonProgressRepo.sumXpByInstitution(institution);

        return new InstitutionStatsDto(courses.size(), (int) totalStudents, (int) totalCompleted, (int) totalXp);
    }

    public CourseStatsDto getCourseStats(User institution, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        if (!course.getInstitution().getId().equals(institution.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your course");
        }

        long totalLessons = lessonRepository.countByModule_Course(course);
        long enrolledCount = enrollmentRepository.countByCourse(course);
        long completedCount = courseProgressRepo.countByCourse(course);

        double avgProgress = 0.0;
        if (enrolledCount > 0 && totalLessons > 0) {
            List<CourseEnrollment> enrollments = enrollmentRepository.findByCourse(course);
            double sum = 0.0;
            for (CourseEnrollment enrollment : enrollments) {
                long done = lessonProgressRepo.countCompletedByUserAndCourse(enrollment.getStudent(), courseId);
                sum += (done * 100.0) / totalLessons;
            }
            avgProgress = sum / enrolledCount;
        }

        return new CourseStatsDto(enrolledCount, Math.round(avgProgress * 10.0) / 10.0, completedCount, totalLessons);
    }
}
