package plat.gamificada.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import plat.gamificada.dto.CompleteLessonRequest;
import plat.gamificada.dto.CompleteResponse;
import plat.gamificada.dto.CompleteTrailModuleRequest;
import plat.gamificada.entity.User;
import plat.gamificada.repository.UserRepository;
import plat.gamificada.service.ActivityService;
import plat.gamificada.util.UserResolver;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;
    private final UserRepository userRepository;

    @PostMapping("/trail-module/{id}/complete")
    public ResponseEntity<CompleteResponse> completeTrailModule(
            @PathVariable Long id,
            @RequestBody(required = false) CompleteTrailModuleRequest req,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        User user = UserResolver.resolve(auth, userRepository);
        int correct = req != null ? req.correctAnswers() : 0;
        int total   = req != null ? req.totalQuestions() : 0;
        return ResponseEntity.ok(activityService.completeTrailModule(id, user, correct, total));
    }

    @PostMapping("/lessons/{id}/complete")
    public ResponseEntity<CompleteResponse> completeLesson(
            @PathVariable Long id,
            @RequestBody(required = false) CompleteLessonRequest req,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        User user = UserResolver.resolve(auth, userRepository);
        int correct = req != null ? req.correctAnswers() : 0;
        int total   = req != null ? req.totalQuestions() : 0;
        return ResponseEntity.ok(activityService.completeLesson(id, user, correct, total));
    }

    @PostMapping("/courses/{courseId}/complete")
    public ResponseEntity<?> completeCourse(
            @PathVariable Long courseId,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        User user = UserResolver.resolve(auth, userRepository);
        try {
            return ResponseEntity.ok(activityService.completeCourse(courseId, user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(java.util.Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
