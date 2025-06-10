package com.resumeai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class QuestionAnswerPairDTO {
    @JsonProperty("questionId")
    private int questionId;

    @JsonProperty("questionText")
    private String questionText;

    @JsonProperty("answerText")
    private String answerText;

    public QuestionAnswerPairDTO() {}

    public QuestionAnswerPairDTO(int questionId, String questionText, String answerText) {
        this.questionId = questionId;
        this.questionText = questionText;
        this.answerText = answerText;
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

    public String getAnswerText() {
        return answerText;
    }

    public void setAnswerText(String answerText) {
        this.answerText = answerText;
    }
}
