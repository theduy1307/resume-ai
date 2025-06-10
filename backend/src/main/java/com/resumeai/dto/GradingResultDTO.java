package com.resumeai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class GradingResultDTO {
    @JsonProperty("totalScore")
    private int totalScore;

    @JsonProperty("questionScores")
    private List<QuestionScoreDTO> questionScores;

    @JsonProperty("generalFeedback")
    private String generalFeedback;

    @JsonProperty("improvementSuggestions")
    private String improvementSuggestions;

    public GradingResultDTO() {}

    public GradingResultDTO(int totalScore, List<QuestionScoreDTO> questionScores, String generalFeedback, String improvementSuggestions) {
        this.totalScore = totalScore;
        this.questionScores = questionScores;
        this.generalFeedback = generalFeedback;
        this.improvementSuggestions = improvementSuggestions;
    }

    public int getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(int totalScore) {
        this.totalScore = totalScore;
    }

    public List<QuestionScoreDTO> getQuestionScores() {
        return questionScores;
    }

    public void setQuestionScores(List<QuestionScoreDTO> questionScores) {
        this.questionScores = questionScores;
    }

    public String getGeneralFeedback() {
        return generalFeedback;
    }

    public void setGeneralFeedback(String generalFeedback) {
        this.generalFeedback = generalFeedback;
    }

    public String getImprovementSuggestions() {
        return improvementSuggestions;
    }

    public void setImprovementSuggestions(String improvementSuggestions) {
        this.improvementSuggestions = improvementSuggestions;
    }
}
