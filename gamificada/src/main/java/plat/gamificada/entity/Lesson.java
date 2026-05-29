package plat.gamificada.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "lessons")
@Getter @Setter @NoArgsConstructor
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private CourseModule module;

    @Column(nullable = false)
    private String title;

    private String type; // VIDEO, QUIZ, TEXT

    private int durationMinutes;
    private int xpReward;
    private int lessonOrder;

    @Column(columnDefinition = "TEXT")
    private String questionsJson;

    @Column(columnDefinition = "TEXT")
    private String videoUrl;

    private boolean published = true;

    private String duration;
}
