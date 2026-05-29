package plat.gamificada.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import plat.gamificada.dto.*;
import plat.gamificada.entity.*;
import plat.gamificada.repository.*;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final UserLessonProgressRepository lessonProgressRepo;
    private final UserCourseProgressRepository courseProgressRepo;
    private final CourseModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;

    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    public List<CourseDto> listAll(User user) {
        if (user.getRole() == User.Role.INSTITUTION) {
            return courseRepository.findByInstitution(user).stream()
                    .map(c -> toDto(c, user))
                    .toList();
        }
        return enrollmentRepository.findByStudent(user).stream()
                .map(e -> toDto(e.getCourse(), user))
                .toList();
    }

    public CourseDto getById(Long id, User user) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Curso não encontrado: " + id));

        if (user.getRole() == User.Role.STUDENT) {
            boolean enrolled = enrollmentRepository.existsByCourseAndStudent(course, user);
            if (!enrolled) throw new IllegalStateException("Acesso negado: você não está matriculado neste curso.");
        }

        return toDto(course, user);
    }

    @Transactional
    public CourseDto create(CreateCourseRequest req, User institution) {
        Course course = new Course();
        course.setTitle(req.name());
        course.setDescription(req.description());
        course.setCategory(req.category());
        course.setDifficulty(req.difficulty());
        course.setThumbnailUrl(req.thumbnailUrl());
        course.setColor(req.color());
        course.setXpReward(req.xpReward());
        course.setInstitution(institution);
        course.setAccessCode(generateUniqueCode());
        courseRepository.save(course);
        return toDto(course, institution);
    }

    @Transactional
    public CourseDto update(Long id, CreateCourseRequest req, User institution) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Curso não encontrado: " + id));
        course.setTitle(req.name());
        course.setDescription(req.description());
        course.setCategory(req.category());
        course.setDifficulty(req.difficulty());
        course.setThumbnailUrl(req.thumbnailUrl());
        course.setColor(req.color());
        course.setXpReward(req.xpReward());
        courseRepository.save(course);
        return toDto(course, institution);
    }

    @Transactional
    public CourseDto enroll(String code, User student) {
        String normalizedCode = code.trim().toUpperCase();
        Course course = courseRepository.findByAccessCode(normalizedCode)
                .orElseThrow(() -> new IllegalArgumentException("Código inválido."));

        if (enrollmentRepository.existsByCourseAndStudent(course, student)) {
            throw new IllegalStateException("Você já está matriculado neste curso.");
        }

        CourseEnrollment enrollment = new CourseEnrollment();
        enrollment.setCourse(course);
        enrollment.setStudent(student);
        enrollmentRepository.save(enrollment);

        return toDto(course, student);
    }

    @Transactional
    public CourseLessonDto createLesson(Long courseId, CreateLessonRequest req, User institution) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Curso não encontrado: " + courseId));

        CourseModule module = moduleRepository.findFirstByCourseOrderByModuleOrderAsc(course)
                .orElseGet(() -> {
                    CourseModule m = new CourseModule();
                    m.setCourse(course);
                    m.setTitle("Aulas");
                    m.setModuleOrder(1);
                    return moduleRepository.save(m);
                });

        int order = (int) lessonRepository.countByModule(module) + 1;

        Lesson lesson = new Lesson();
        lesson.setModule(module);
        lesson.setTitle(req.title());
        lesson.setDuration(req.duration());
        lesson.setVideoUrl(req.videoUrl());
        lesson.setThumbnailUrl(req.thumbnailUrl());
        lesson.setPublished(req.published());
        lesson.setLessonOrder(order);
        lesson.setXpReward(100);
        lessonRepository.save(lesson);

        return new CourseLessonDto(lesson.getId(), lesson.getTitle(), lesson.getDuration(),
                lesson.getVideoUrl(), lesson.getThumbnailUrl(), lesson.isPublished(), "available");
    }

    @Transactional
    public CourseLessonDto updateLesson(Long courseId, Long lessonId, CreateLessonRequest req) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Aula não encontrada: " + lessonId));

        if (!lesson.getModule().getCourse().getId().equals(courseId)) {
            throw new IllegalArgumentException("Aula não pertence a este curso.");
        }

        lesson.setTitle(req.title());
        lesson.setDuration(req.duration());
        lesson.setVideoUrl(req.videoUrl());
        lesson.setThumbnailUrl(req.thumbnailUrl());
        lesson.setPublished(req.published());
        lessonRepository.save(lesson);

        return new CourseLessonDto(lesson.getId(), lesson.getTitle(), lesson.getDuration(),
                lesson.getVideoUrl(), lesson.getThumbnailUrl(), lesson.isPublished(), "available");
    }

    @Transactional
    public void deleteCourse(Long courseId, User institution) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Curso não encontrado: " + courseId));

        if (!course.getInstitution().getId().equals(institution.getId())) {
            throw new IllegalStateException("Não tens permissão para eliminar este curso.");
        }

        lessonProgressRepo.deleteByCourse(course);
        courseProgressRepo.deleteByCourse(course);
        enrollmentRepository.deleteByCourse(course);
        courseRepository.delete(course); // CascadeType.ALL propaga para modules → lessons
    }

    @Transactional
    public void deleteLesson(Long courseId, Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Aula não encontrada: " + lessonId));

        if (!lesson.getModule().getCourse().getId().equals(courseId)) {
            throw new IllegalArgumentException("Aula não pertence a este curso.");
        }

        lessonRepository.delete(lesson);
    }

    private String generateUniqueCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder(8);
            for (int i = 0; i < 8; i++) {
                sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
            }
            code = sb.toString();
        } while (courseRepository.existsByAccessCode(code));
        return code;
    }

    private CourseDto toDto(Course course, User user) {
        List<UserLessonProgress> progresses = lessonProgressRepo.findByUserAndCourseId(user, course.getId());
        Map<Long, UserLessonProgress> progressMap = progresses.stream()
                .collect(Collectors.toMap(p -> p.getLesson().getId(), p -> p));

        int totalLessons = 0;
        int completedLessons = 0;

        List<CourseModuleDto> moduleDtos = new ArrayList<>();
        List<CourseLessonDto> allLessons = new ArrayList<>();

        for (var module : course.getModules()) {
            List<LessonDto> lessonDtos = new ArrayList<>();
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
                allLessons.add(new CourseLessonDto(
                        lesson.getId(),
                        lesson.getTitle(),
                        lesson.getDuration(),
                        lesson.getVideoUrl(),
                        lesson.getThumbnailUrl(),
                        lesson.isPublished(),
                        done ? "done" : "available"
                ));
            }
            moduleDtos.add(new CourseModuleDto(module.getId(), module.getTitle(), module.getModuleOrder(), lessonDtos));
        }

        String institution = course.getInstitution() != null
                ? (course.getInstitution().getCompanyName() != null
                    ? course.getInstitution().getCompanyName()
                    : course.getInstitution().getName())
                : null;

        String accessCode = (user.getRole() == User.Role.INSTITUTION
                && course.getInstitution() != null
                && course.getInstitution().getId().equals(user.getId()))
                ? course.getAccessCode()
                : null;

        int enrolledCount = (int) enrollmentRepository.countByCourse(course);

        return new CourseDto(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getCategory(),
                course.getDifficulty(),
                course.getThumbnailUrl(),
                course.getColor(),
                institution,
                accessCode,
                course.isPublished(),
                course.getXpReward(),
                totalLessons,
                completedLessons,
                totalLessons,
                enrolledCount,
                moduleDtos,
                allLessons,
                allLessons
        );
    }

    public List<TrailDto> listAsTrails(User user) {
        return courseRepository.findAll().stream()
                .map(c -> toCourseTrailDto(c, user))
                .toList();
    }

    public TrailDto getAsTrail(Long courseId, User user) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Trilha não encontrada: " + courseId));
        return toCourseTrailDto(course, user);
    }

    private TrailDto toCourseTrailDto(Course course, User user) {
        List<UserLessonProgress> progresses = lessonProgressRepo.findByUserAndCourseId(user, course.getId());
        Map<Long, UserLessonProgress> progressMap = progresses.stream()
                .collect(Collectors.toMap(p -> p.getLesson().getId(), p -> p));

        List<TrailModuleDto> moduleDtos = new ArrayList<>();
        int order = 0;

        for (CourseModule module : course.getModules()) {
            for (Lesson lesson : module.getLessons()) {
                UserLessonProgress prog = progressMap.get(lesson.getId());
                boolean done = prog != null && prog.isCompleted();
                String type = (lesson.getVideoUrl() != null && !lesson.getVideoUrl().isBlank())
                        ? "video" : "lesson";
                int xp = lesson.getXpReward() > 0 ? lesson.getXpReward() : 100;

                moduleDtos.add(new TrailModuleDto(
                        lesson.getId(),
                        lesson.getTitle(),
                        null,
                        ++order,
                        xp,
                        type,
                        lesson.getDuration(),
                        false,
                        false,
                        done,
                        prog != null ? prog.getCorrectAnswers() : 0,
                        prog != null ? prog.getTotalQuestions() : 0
                ));
            }
        }

        int xpTotal = moduleDtos.stream().mapToInt(TrailModuleDto::xpReward).sum();
        int xpEarned = moduleDtos.stream()
                .filter(TrailModuleDto::completed)
                .mapToInt(TrailModuleDto::xpReward)
                .sum();

        String institution = course.getInstitution() != null
                ? (course.getInstitution().getCompanyName() != null
                    ? course.getInstitution().getCompanyName()
                    : course.getInstitution().getName())
                : null;

        return new TrailDto(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                institution,
                null,
                course.getThumbnailUrl(),
                course.getColor(),
                null,
                xpTotal,
                xpEarned,
                moduleDtos.size(),
                (int) moduleDtos.stream().filter(TrailModuleDto::completed).count(),
                moduleDtos
        );
    }
}
