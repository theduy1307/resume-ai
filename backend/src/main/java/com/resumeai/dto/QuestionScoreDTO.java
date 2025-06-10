package com.resumeai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class QuestionScoreDTO {
    @JsonProperty("questionId")
    private int questionId;

    @JsonProperty("score")
    private int score;

    @JsonProperty("feedback")
    private String feedback;

    public QuestionScoreDTO() {}

    public QuestionScoreDTO(int questionId, int score, String feedback) {
        this.questionId = questionId;
        this.score = score;
        this.feedback = feedback;
    }

    public int getQuestionId() {
        return questionId;
    }

    public void setQuestionId(int questionId) {
        this.questionId = questionId;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}
