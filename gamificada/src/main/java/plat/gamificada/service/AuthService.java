package plat.gamificada.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import plat.gamificada.dto.AuthResponse;
import plat.gamificada.dto.LoginRequest;
import plat.gamificada.dto.RegisterRequest;
import plat.gamificada.entity.User;
import plat.gamificada.repository.UserRepository;
import plat.gamificada.security.JwtService;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new IllegalStateException("E-mail já cadastrado");
        }

        User user = new User();
        user.setName(req.name());
        user.setEmail(req.email());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setRole(User.Role.valueOf(req.role()));
        if (req.role().equals("INSTITUTION")) {
            user.setCompanyName(req.companyName());
        }

        userRepository.save(user);
        String token = jwtService.generateToken(user);
        return toResponse(user, token);
    }

    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password())
        );
        User user = userRepository.findByEmail(req.email()).orElseThrow();
        String token = jwtService.generateToken(user);
        return toResponse(user, token);
    }

    public AuthResponse me(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return toResponse(user, null);
    }

    private AuthResponse toResponse(User user, String token) {
        return new AuthResponse(token, user.getName(), user.getEmail(),
                user.getRole().name(), user.getCompanyName());
    }
}
