package plat.gamificada.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "achievements")
@Getter @Setter @NoArgsConstructor
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String key;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String icon;
    private int xpReward;

    // LESSONS_COMPLETED | TRAIL_MODULES_COMPLETED | XP_EARNED | STREAK_DAYS
    private String conditionType;
    private int conditionThreshold;
}
