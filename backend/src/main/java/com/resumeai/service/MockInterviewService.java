package com.resumeai.service;

import com.resumeai.dto.AnswerSubmitDTO;
import com.resumeai.dto.GradingResultDTO;
import com.resumeai.dto.InterviewQuestionDTO;
import com.resumeai.dto.InterviewRequestDTO;

import java.util.List;

public interface MockInterviewService {
    List<InterviewQuestionDTO> generateQuestions(InterviewRequestDTO request);
    GradingResultDTO gradeAnswers(AnswerSubmitDTO submission);
}
