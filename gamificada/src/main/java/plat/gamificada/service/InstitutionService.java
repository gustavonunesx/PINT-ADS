package plat.gamificada.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import plat.gamificada.dto.InstitutionStatsDto;
import plat.gamificada.entity.User;
import plat.gamificada.repository.CourseRepository;
import plat.gamificada.repository.UserLessonProgressRepository;
import plat.gamificada.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InstitutionService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final UserLessonProgressRepository lessonProgressRepo;

    public InstitutionStatsDto getStats(User institution) {
        int totalCourses = courseRepository.findByInstitution(institution).size();
        int totalStudents = (int) userRepository.findByRole(User.Role.STUDENT).size();

        List<plat.gamificada.entity.UserLessonProgress> allProgress = lessonProgressRepo.findAll();
        int totalCompleted = (int) allProgress.stream().filter(p -> p.isCompleted()).count();
        int totalXp = allProgress.stream()
                .filter(p -> p.isCompleted())
                .mapToInt(p -> p.getLesson().getXpReward())
                .sum();

        return new InstitutionStatsDto(totalCourses, totalStudents, totalCompleted, totalXp);
    }
}
