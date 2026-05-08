package plat.gamificada.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import plat.gamificada.dto.*;
import plat.gamificada.entity.Course;
import plat.gamificada.entity.Lesson;
import plat.gamificada.entity.User;
import plat.gamificada.entity.UserLessonProgress;
import plat.gamificada.repository.CourseRepository;
import plat.gamificada.repository.UserLessonProgressRepository;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserLessonProgressRepository lessonProgressRepo;

    public List<CourseDto> listAll(User user) {
        return courseRepository.findAll().stream()
                .map(c -> toDto(c, user))
                .toList();
    }

    public CourseDto getById(Long id, User user) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Curso não encontrado: " + id));
        return toDto(course, user);
    }

    @Transactional
    public CourseDto create(CreateCourseRequest req, User institution) {
        Course course = new Course();
        course.setTitle(req.title());
        course.setDescription(req.description());
        course.setCategory(req.category());
        course.setDifficulty(req.difficulty());
        course.setThumbnailUrl(req.thumbnailUrl());
        course.setInstitution(institution);
        courseRepository.save(course);
        return toDto(course, institution);
    }

    @Transactional
    public CourseDto update(Long id, CreateCourseRequest req, User institution) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Curso não encontrado: " + id));
        course.setTitle(req.title());
        course.setDescription(req.description());
        course.setCategory(req.category());
        course.setDifficulty(req.difficulty());
        course.setThumbnailUrl(req.thumbnailUrl());
        courseRepository.save(course);
        return toDto(course, institution);
    }

    private CourseDto toDto(Course course, User user) {
        List<UserLessonProgress> progresses = lessonProgressRepo.findByUserAndCourseId(user, course.getId());
        Map<Long, UserLessonProgress> progressMap = progresses.stream()
                .collect(Collectors.toMap(p -> p.getLesson().getId(), p -> p));

        int totalLessons = 0;
        int completedLessons = 0;

        List<CourseModuleDto> moduleDtos = new java.util.ArrayList<>();
        for (var module : course.getModules()) {
            List<LessonDto> lessonDtos = new java.util.ArrayList<>();
            for (Lesson lesson : module.getLessons()) {
                UserLessonProgress prog = progressMap.get(lesson.getId());
                boolean done = prog != null && prog.isCompleted();
                totalLessons++;
                if (done) completedLessons++;
                lessonDtos.add(new LessonDto(
                        lesson.getId(),
                        lesson.getTitle(),
                        lesson.getType(),
                        lesson.getDurationMinutes(),
                        lesson.getXpReward(),
                        lesson.getLessonOrder(),
                        done,
                        prog != null ? prog.getCorrectAnswers() : 0,
                        prog != null ? prog.getTotalQuestions() : 0
                ));
            }
            moduleDtos.add(new CourseModuleDto(module.getId(), module.getTitle(), module.getModuleOrder(), lessonDtos));
        }

        String institutionName = course.getInstitution() != null
                ? (course.getInstitution().getCompanyName() != null
                    ? course.getInstitution().getCompanyName()
                    : course.getInstitution().getName())
                : null;

        return new CourseDto(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getCategory(),
                course.getDifficulty(),
                course.getThumbnailUrl(),
                institutionName,
                totalLessons,
                completedLessons,
                moduleDtos
        );
    }
}
