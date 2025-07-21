// UserDTO.java
package com.backend.datadrop.dto;

public record UserDto(
        Long id,
        String name,
        String email
) {}
