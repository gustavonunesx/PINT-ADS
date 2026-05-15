package plat.gamificada.dto;

import jakarta.validation.constraints.NotBlank;

public record EnrollRequest(@NotBlank String code) {}
