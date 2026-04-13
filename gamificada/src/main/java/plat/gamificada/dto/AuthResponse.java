package plat.gamificada.dto;

public record AuthResponse(
        String token,
        String name,
        String email,
        String role,
        String companyName
) {}
