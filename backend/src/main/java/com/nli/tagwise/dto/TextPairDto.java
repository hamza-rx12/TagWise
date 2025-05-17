package com.nli.tagwise.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TextPairDto {
    private Long id;
    private String text1;
    private String text2;

    public TextPairDto(Long id, String text1, String text2) {
        this.id = id;
        this.text1 = text1;
        this.text2 = text2;
    }
}
