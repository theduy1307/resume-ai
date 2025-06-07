package com.resumeai.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class JobMatchResult {
    @JsonProperty("score")
    private double score;
    
    @JsonProperty("analysis")
    private String analysis;
    
    @JsonProperty("strengths")
    private String strengths;
    
    @JsonProperty("improvements")
    private String improvements;

    // Constructors
    public JobMatchResult() {}

    public JobMatchResult(double score, String analysis, String strengths, String improvements) {
        this.score = score;
        this.analysis = analysis;
        this.strengths = strengths;
        this.improvements = improvements;
    }

    // Getters and Setters
    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public String getAnalysis() {
        return analysis;
    }

    public void setAnalysis(String analysis) {
        this.analysis = analysis;
    }

    public String getStrengths() {
        return strengths;
    }

    public void setStrengths(String strengths) {
        this.strengths = strengths;
    }

    public String getImprovements() {
        return improvements;
    }

    public void setImprovements(String improvements) {
        this.improvements = improvements;
    }
}