package com.resumeai.controller;

import com.resumeai.dto.AnswerSubmitDTO;
import com.resumeai.dto.GradingResultDTO;
import com.resumeai.dto.InterviewQuestionDTO;
import com.resumeai.dto.InterviewRequestDTO;
import com.resumeai.service.GeminiClient;
import com.resumeai.service.MockInterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/mock-interview")
public class MockInterviewController {

    @Autowired
    private MockInterviewService interviewService;

    @Autowired
    private GeminiClient geminiService;

    @PostMapping("/questions")
    public List<InterviewQuestionDTO> getQuestions(@RequestBody InterviewRequestDTO request) {
        return interviewService.generateQuestions(request);
    }

    @PostMapping("/submit")
    public GradingResultDTO submit(@RequestBody AnswerSubmitDTO submission) {
        return interviewService.gradeAnswers(submission);
    }
}
