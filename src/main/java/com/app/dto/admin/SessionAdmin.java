package com.app.dto.admin;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionAdmin implements Serializable {
    private Long id;
    private String email;
    private String username;
    private String role;
}
