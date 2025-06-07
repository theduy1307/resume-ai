package com.resumeai.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class ResumeData {
    @JsonProperty("personalInfo")
    private PersonalInfo personalInfo;
    
    @JsonProperty("sections")
    private List<ResumeSection> sections;
    
    @JsonProperty("extractedText")
    private String extractedText;

    // Constructors
    public ResumeData() {}

    public ResumeData(PersonalInfo personalInfo, List<ResumeSection> sections, String extractedText) {
        this.personalInfo = personalInfo;
        this.sections = sections;
        this.extractedText = extractedText;
    }

    // Getters and Setters
    public PersonalInfo getPersonalInfo() {
        return personalInfo;
    }

    public void setPersonalInfo(PersonalInfo personalInfo) {
        this.personalInfo = personalInfo;
    }

    public List<ResumeSection> getSections() {
        return sections;
    }

    public void setSections(List<ResumeSection> sections) {
        this.sections = sections;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }

    // Nested classes
    public static class PersonalInfo {
        private String name;
        private String email;
        private String phone;
        private String address;

        // Constructors
        public PersonalInfo() {}

        public PersonalInfo(String name, String email, String phone, String address) {
            this.name = name;
            this.email = email;
            this.phone = phone;
            this.address = address;
        }

        // Getters and Setters
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }
    }

    public static class ResumeSection {
        private String title;
        private String content;
        private List<String> improvements;

        // Constructors
        public ResumeSection() {}

        public ResumeSection(String title, String content, List<String> improvements) {
            this.title = title;
            this.content = content;
            this.improvements = improvements;
        }

        // Getters and Setters
        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public List<String> getImprovements() {
            return improvements;
        }

        public void setImprovements(List<String> improvements) {
            this.improvements = improvements;
        }
    }
}