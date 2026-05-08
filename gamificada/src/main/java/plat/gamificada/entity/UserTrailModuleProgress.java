package plat.gamificada.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_trail_module_progress",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "trail_module_id"}))
@Getter @Setter @NoArgsConstructor
public class UserTrailModuleProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trail_module_id", nullable = false)
    private TrailModule trailModule;

    private boolean completed = false;
    private int correctAnswers;
    private int totalQuestions;
    private LocalDateTime completedAt;
}
