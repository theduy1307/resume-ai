package com.resumeai.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class InterviewQuestion {
    @JsonProperty("id")
    private int id;
    
    @JsonProperty("question")
    private String question;
    
    @JsonProperty("expectedDuration")
    private int expectedDuration; // in seconds

    // Constructors
    public InterviewQuestion() {}

    public InterviewQuestion(int id, String question, int expectedDuration) {
        this.id = id;
        this.question = question;
        this.expectedDuration = expectedDuration;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public int getExpectedDuration() {
        return expectedDuration;
    }

    public void setExpectedDuration(int expectedDuration) {
        this.expectedDuration = expectedDuration;
    }
}