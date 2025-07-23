package com.backend.datadrop.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserDtoTest {

    @Test
    void testUserDtoValues() {
        UserDto userDto = new UserDto(1L, "Kamrul", "kamrul@example.com");

        assertEquals(1L, userDto.id());
        assertEquals("Kamrul", userDto.name());
        assertEquals("kamrul@example.com", userDto.email());
    }

    @Test
    void testUserDtoEquality() {
        UserDto dto1 = new UserDto(1L, "Kamrul", "kamrul@example.com");
        UserDto dto2 = new UserDto(1L, "Kamrul", "kamrul@example.com");

        assertEquals(dto1, dto2);
        assertEquals(dto1.hashCode(), dto2.hashCode());
    }

    @Test
    void testUserDtoToString() {
        UserDto dto = new UserDto(2L, "Alex", "alex@example.com");
        String output = dto.toString();

        assertTrue(output.contains("Alex"));
        assertTrue(output.contains("alex@example.com"));
    }
}
