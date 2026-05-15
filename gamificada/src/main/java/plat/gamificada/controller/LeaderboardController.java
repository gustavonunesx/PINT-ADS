package plat.gamificada.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import plat.gamificada.dto.LeaderboardEntryDto;
import plat.gamificada.service.LeaderboardService;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<List<LeaderboardEntryDto>> get(
            @RequestParam(defaultValue = "all-time") String period,
            @RequestParam(defaultValue = "students") String tab) {
        return ResponseEntity.ok(leaderboardService.getLeaderboard(period, tab));
    }
}
