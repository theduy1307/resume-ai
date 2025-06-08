package com.resumeai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class AnswerSubmitDTO {
    @JsonProperty("position")
    private String position;

    @JsonProperty("field")
    private String field;

    @JsonProperty("level")
    private String level;

    @JsonProperty("answers")
    List<QuestionAnswerPairDTO> answers;

    public AnswerSubmitDTO() {}

    public AnswerSubmitDTO(String position, String field, String level, List<QuestionAnswerPairDTO> answers) {
        this.position = position;
        this.field = field;
        this.level = level;
        this.answers = answers;
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

    public List<QuestionAnswerPairDTO> getAnswers() {
        return answers;
    }

    public void setAnswers(List<QuestionAnswerPairDTO> answers) {
        this.answers = answers;
    }
}
