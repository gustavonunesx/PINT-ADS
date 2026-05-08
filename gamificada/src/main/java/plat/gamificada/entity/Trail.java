package plat.gamificada.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trails")
@Getter @Setter @NoArgsConstructor
public class Trail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;
    private String difficulty;
    private String thumbnailUrl;

    @OneToMany(mappedBy = "trail", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("moduleOrder ASC")
    private List<TrailModule> modules = new ArrayList<>();
}
