package plat.gamificada.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import plat.gamificada.entity.User;
import plat.gamificada.repository.UserRepository;
import plat.gamificada.service.XpService;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class SimpleAuthController {

    private final UserRepository userRepository;
    private final XpService xpService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email obrigatório"));
        }

        // busca insensível a maiúsculas/minúsculas
        Optional<User> opt = userRepository.findAll().stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(email.trim()))
                .findFirst();

        if (opt.isEmpty()) {
            List<String> emails = userRepository.findAll().stream()
                    .map(User::getEmail).toList();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "error", "Usuário não encontrado",
                            "emailEnviado", email.trim(),
                            "emailsDisponiveis", emails
                    ));
        }

        return ResponseEntity.ok(toResponse(opt.get()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String name  = body.get("name");

        // "type" field from frontend ("student"/"institution") determines account role
        String type        = body.getOrDefault("type", "student");
        User.Role accountRole = "institution".equalsIgnoreCase(type) ? User.Role.INSTITUTION : User.Role.STUDENT;

        if (email == null || name == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Nome e e-mail obrigatórios"));
        }

        email = email.trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            // se já existe, faz login direto (não quebra o fluxo)
            User user = userRepository.findByEmail(email).get();
            return ResponseEntity.ok(toResponse(user));
        }

        User user = new User();
        user.setName(name.trim());
        user.setEmail(email);
        user.setRole(accountRole);
        if (accountRole == User.Role.INSTITUTION) {
            // frontend sends "company", legacy may send "companyName"
            String companyName = body.containsKey("company") ? body.get("company")
                               : body.getOrDefault("companyName", name.trim());
            user.setCompanyName(companyName);
        }
        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Logout realizado"));
    }

    // Rota de diagnóstico — lista todos os usuários
    @GetMapping("/users")
    public ResponseEntity<?> listUsers() {
        return ResponseEntity.ok(
                userRepository.findAll().stream()
                        .map(u -> Map.of("id", u.getId(), "email", u.getEmail(),
                                "name", u.getName(), "role", u.getRole().name()))
                        .toList()
        );
    }

    private Map<String, Object> toResponse(User user) {
        String roleStr = user.getRole().name();
        String type    = roleStr.equalsIgnoreCase("INSTITUTION") ? "institution" : "student";
        Map<String, Object> userMap = new java.util.HashMap<>();
        userMap.put("id",          user.getId());
        userMap.put("name",        user.getName());
        userMap.put("email",       user.getEmail());
        userMap.put("role",        roleStr);
        userMap.put("type",        type);
        userMap.put("xp",          user.getXp());
        userMap.put("level",       user.getLevel());
        userMap.put("streak",      user.getStreak());
        userMap.put("xpToNext",    xpService.xpToNextLevel(user));
        userMap.put("xpToNextLevel", xpService.xpToNextLevel(user));
        userMap.put("companyName", user.getCompanyName() != null ? user.getCompanyName() : "");
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("token", String.valueOf(user.getId()));
        response.put("user",  userMap);
        return response;
    }
}
