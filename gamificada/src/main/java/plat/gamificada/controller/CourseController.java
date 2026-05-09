package plat.gamificada.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import plat.gamificada.dto.CourseLessonDto;
import plat.gamificada.dto.CourseDto;
import plat.gamificada.dto.CreateCourseRequest;
import plat.gamificada.dto.CreateLessonRequest;
import plat.gamificada.dto.EnrollRequest;
import plat.gamificada.entity.User;
import plat.gamificada.repository.UserRepository;
import plat.gamificada.service.CourseService;
import plat.gamificada.util.UserResolver;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<CourseDto>> listAll(
            @RequestHeader(value = "Authorization", required = false) String auth) {
        User user = UserResolver.resolve(auth, userRepository);
        return ResponseEntity.ok(courseService.listAll(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDto> getById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        User user = UserResolver.resolve(auth, userRepository);
        return ResponseEntity.ok(courseService.getById(id, user));
    }

    @PostMapping
    public ResponseEntity<CourseDto> create(
            @Valid @RequestBody CreateCourseRequest req,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        User user = UserResolver.resolve(auth, userRepository);
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.create(req, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseDto> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateCourseRequest req,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        User user = UserResolver.resolve(auth, userRepository);
        return ResponseEntity.ok(courseService.update(id, req, user));
    }

    @PostMapping("/enroll")
    public ResponseEntity<?> enroll(
            @Valid @RequestBody EnrollRequest req,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        User user = UserResolver.resolve(auth, userRepository);
        try {
            CourseDto course = courseService.enroll(req.code(), user);
            return ResponseEntity.ok(course);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{courseId}/lessons")
    public ResponseEntity<?> createLesson(
            @PathVariable Long courseId,
            @Valid @RequestBody CreateLessonRequest req,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        User user = UserResolver.resolve(auth, userRepository);
        try {
            CourseLessonDto lesson = courseService.createLesson(courseId, req, user);
            return ResponseEntity.status(HttpStatus.CREATED).body(lesson);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{courseId}/lessons/{lessonId}")
    public ResponseEntity<?> updateLesson(
            @PathVariable Long courseId,
            @PathVariable Long lessonId,
            @Valid @RequestBody CreateLessonRequest req,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        UserResolver.resolve(auth, userRepository);
        try {
            CourseLessonDto lesson = courseService.updateLesson(courseId, lessonId, req);
            return ResponseEntity.ok(lesson);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{courseId}/lessons/{lessonId}")
    public ResponseEntity<?> deleteLesson(
            @PathVariable Long courseId,
            @PathVariable Long lessonId,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        UserResolver.resolve(auth, userRepository);
        try {
            courseService.deleteLesson(courseId, lessonId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}
