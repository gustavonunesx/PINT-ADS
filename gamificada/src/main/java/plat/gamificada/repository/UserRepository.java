package plat.gamificada.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import plat.gamificada.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(User.Role role);

    @Query("SELECT u FROM User u WHERE u.role = 'STUDENT' ORDER BY u.xp DESC")
    List<User> findAllStudentsOrderByXpDesc();
}
