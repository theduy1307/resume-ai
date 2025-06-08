package com.resumeai.service;

import com.resumeai.dto.*;
import com.resumeai.service.MockInterviewService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;

@Service
public class MockInterviewServiceImpl implements MockInterviewService {

    @Override
    public List<InterviewQuestionDTO> generateQuestions(InterviewRequestDTO request) {
        // Todo: Gọi Gemini để tạo câu hỏi
        return new ArrayList<>();
    }

    @Override
    public GradingResultDTO gradeAnswers(AnswerSubmitDTO submission) {
        // Todo: Gọi Gemini để chấm điểm + nhận xét
        return new GradingResultDTO();
    }


}
