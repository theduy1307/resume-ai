package com.resumeai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.resumeai.model.InterviewQuestion;

public class InterviewQuestionDTO {
    @JsonProperty("questionId")
    private int questionId;

    @JsonProperty("questionText")
    private String questionText;

    @JsonProperty("hint")
    private String hint;

    public InterviewQuestionDTO() {}

    public InterviewQuestionDTO(int questionId, String questionText, String hint) {
        this.questionId = questionId;
        this.questionText = questionText;
        this.hint = hint;
    }

    public int getQuestionId() {
        return questionId;
    }

    public void setQuestionId(int questionId) {
        this.questionId = questionId;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getHint() {
        return hint;
    }

    public void setHint(String hint) {
        this.hint = hint;
    }
}
