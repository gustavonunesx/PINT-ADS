package plat.gamificada.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import plat.gamificada.dto.CourseDto;
import plat.gamificada.dto.CreateCourseRequest;
import plat.gamificada.entity.User;
import plat.gamificada.repository.UserRepository;
import plat.gamificada.service.CourseService;
import plat.gamificada.util.UserResolver;

import java.util.List;

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
}
