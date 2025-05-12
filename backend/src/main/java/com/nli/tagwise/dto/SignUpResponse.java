package com.nli.tagwise.dto;

import com.nli.tagwise.models.Gender;
import com.nli.tagwise.models.Role;
import com.nli.tagwise.models.User;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignUpResponse {
    private Long Id;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
    private Gender gender;
    private String password;
    private Boolean enabled;
    private String verificationCode;

    public SignUpResponse(User user, String verificationCode) {
        this.Id = user.getId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.gender = user.getGender();
        this.password = user.getPassword();
        this.enabled = user.isEnabled();
        this.verificationCode = verificationCode;
    }

}
