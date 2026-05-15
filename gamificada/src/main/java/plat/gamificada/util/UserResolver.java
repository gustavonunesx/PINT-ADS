package plat.gamificada.util;

import plat.gamificada.entity.User;
import plat.gamificada.repository.UserRepository;

public class UserResolver {

    // O token é literalmente o userId. Frontend envia: Authorization: Bearer 1
    public static User resolve(String authHeader, UserRepository repo) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                Long id = Long.parseLong(authHeader.substring(7).trim());
                return repo.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + id));
            } catch (NumberFormatException ignored) {}
        }
        // fallback: primeiro usuário STUDENT do seed
        return repo.findByRole(User.Role.STUDENT).stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("Nenhum usuário seed encontrado"));
    }
}
