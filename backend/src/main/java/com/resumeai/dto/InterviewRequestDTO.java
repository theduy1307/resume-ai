package com.resumeai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class InterviewRequestDTO {
    @JsonProperty("position")
    private String position;

    @JsonProperty("field")
    private String field;

    @JsonProperty("level")
    private String level;

    public InterviewRequestDTO() {}

    public InterviewRequestDTO(String position, String field, String level) {
        this.position = position;
        this.field = field;
        this.level = level;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = field;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }
}
