package plat.gamificada.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import plat.gamificada.dto.AchievementDto;
import plat.gamificada.dto.DashboardDto;
import plat.gamificada.dto.UserProfileDto;
import plat.gamificada.entity.User;
import plat.gamificada.repository.UserRepository;
import plat.gamificada.service.UserService;
import plat.gamificada.util.UserResolver;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> profile(
            @RequestHeader(value = "Authorization", required = false) String auth) {
        User user = UserResolver.resolve(auth, userRepository);
        return ResponseEntity.ok(userService.toProfileDto(user));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto> dashboard(
            @RequestHeader(value = "Authorization", required = false) String auth) {
        User user = UserResolver.resolve(auth, userRepository);
        return ResponseEntity.ok(userService.getDashboard(user.getId()));
    }

    @GetMapping("/achievements")
    public ResponseEntity<List<AchievementDto>> achievements(
            @RequestHeader(value = "Authorization", required = false) String auth) {
        User user = UserResolver.resolve(auth, userRepository);
        return ResponseEntity.ok(userService.getAchievements(user.getId()));
    }
}
