package plat.gamificada.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import plat.gamificada.dto.TrailDto;
import plat.gamificada.entity.User;
import plat.gamificada.repository.UserRepository;
import plat.gamificada.service.CourseService;
import plat.gamificada.util.UserResolver;

import java.util.List;

@RestController
@RequestMapping("/api/trails")
@RequiredArgsConstructor
public class TrailController {

    private final CourseService courseService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<TrailDto>> listAll(
            @RequestHeader(value = "Authorization", required = false) String auth) {
        User user = UserResolver.resolve(auth, userRepository);
        return ResponseEntity.ok(courseService.listAsTrails(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrailDto> getById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        User user = UserResolver.resolve(auth, userRepository);
        return ResponseEntity.ok(courseService.getAsTrail(id, user));
    }
}
