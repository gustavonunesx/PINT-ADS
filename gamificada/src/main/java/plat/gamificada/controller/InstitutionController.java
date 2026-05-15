package plat.gamificada.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import plat.gamificada.dto.CourseStatsDto;
import plat.gamificada.dto.InstitutionStatsDto;
import plat.gamificada.entity.User;
import plat.gamificada.repository.UserRepository;
import plat.gamificada.service.InstitutionService;
import plat.gamificada.util.UserResolver;

@RestController
@RequestMapping("/api/institution")
@RequiredArgsConstructor
public class InstitutionController {

    private final InstitutionService institutionService;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<InstitutionStatsDto> stats(
            @RequestHeader(value = "Authorization", required = false) String auth) {
        User user = UserResolver.resolve(auth, userRepository);
        return ResponseEntity.ok(institutionService.getStats(user));
    }

    @GetMapping("/courses/{courseId}/stats")
    public ResponseEntity<CourseStatsDto> courseStats(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable Long courseId) {
        User user = UserResolver.resolve(auth, userRepository);
        return ResponseEntity.ok(institutionService.getCourseStats(user, courseId));
    }
}
