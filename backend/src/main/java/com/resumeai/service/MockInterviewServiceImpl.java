package com.resumeai.service;

import com.google.common.collect.ImmutableMap;
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.google.genai.types.Schema;
import com.google.genai.types.Type;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.resumeai.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MockInterviewServiceImpl implements MockInterviewService {

    private static final Logger logger = LoggerFactory.getLogger(MockInterviewServiceImpl.class);

    @Autowired
    private GeminiClient geminiClient;

    private final Gson gson = new Gson();

    @Override
    public List<InterviewQuestionDTO> generateQuestions(InterviewRequestDTO request) {
        if (request == null || request.getPosition() == null || request.getField() == null || request.getLevel() == null) {
            logger.error("Invalid InterviewRequestDTO: null or missing fields");
            return new ArrayList<>();
        }

        try {
            // Create prompt for Gemini
            String prompt = buildQuestionGenerationPrompt(request);

            // Create schema for structured output
            Schema questionSchema = createQuestionSchema();

            // Create content for Gemini
            List<Content> contents = List.of(
                    Content.builder()
                            .parts(List.of(Part.fromText(prompt)))
                            .build()
            );

            // Call Gemini API
            GenerateContentResponse response = geminiClient.generateContent(contents, questionSchema);

            // Extract JSON from response
            String jsonResponse = response.text();

            // Parse JSON response into List<InterviewQuestionDTO>
            java.lang.reflect.Type listType = new TypeToken<List<InterviewQuestionDTO>>(){}.getType();
            List<InterviewQuestionDTO> questions = gson.fromJson(jsonResponse, listType);

            return questions != null ? questions : new ArrayList<>();
        } catch (Exception e) {
            logger.error("Error generating questions: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    @Override
    public GradingResultDTO gradeAnswers(AnswerSubmitDTO submission) {
        if (submission == null || submission.getAnswers() == null || submission.getAnswers().isEmpty() ||
                submission.getPosition() == null || submission.getField() == null || submission.getLevel() == null) {
            logger.error("Invalid AnswerSubmitDTO: null or missing fields/answers");
            return new GradingResultDTO(0, new ArrayList<>(), "Dữ liệu đầu vào không hợp lệ", "Vui lòng cung cấp đầy đủ thông tin và câu trả lời.");
        }

        try {
            // Create prompt for grading answers
            String prompt = buildGradingPrompt(submission);

            // Create schema for structured output
            Schema gradingSchema = createGradingSchema();

            // Create content for Gemini
            List<Content> contents = List.of(
                    Content.builder()
                            .parts(List.of(Part.fromText(prompt)))
                            .build()
            );

            // Call Gemini API
            GenerateContentResponse response = geminiClient.generateContent(contents, gradingSchema);

            // Extract JSON from response
            String jsonResponse = response.text();

            // Parse JSON response into GradingResultDTO
            java.lang.reflect.Type gradingType = new TypeToken<GradingResultDTO>(){}.getType();
            GradingResultDTO result = gson.fromJson(jsonResponse, gradingType);

            return result != null ? result : new GradingResultDTO(0, new ArrayList<>(), "Không thể chấm điểm", "Vui lòng thử lại sau.");
        } catch (Exception e) {
            logger.error("Error grading answers: {}", e.getMessage(), e);
            return new GradingResultDTO(0, new ArrayList<>(), "Lỗi khi chấm điểm", "Vui lòng thử lại sau.");
        }
    }

    private Schema createQuestionSchema() {
        return Schema.builder()
                .type(Type.Known.ARRAY)
                .items(Schema.builder()
                        .type(Type.Known.OBJECT)
                        .properties(ImmutableMap.of(
                                "questionId", Schema.builder().type(Type.Known.INTEGER).build(),
                                "questionText", Schema.builder().type(Type.Known.STRING).build(),
                                "hint", Schema.builder().type(Type.Known.STRING).build()
                        ))
                        .required(List.of("questionId", "questionText", "hint"))
                        .build())
                .build();
    }

    private Schema createGradingSchema() {
        return Schema.builder()
                .type(Type.Known.OBJECT)
                .properties(ImmutableMap.of(
                        "totalScore", Schema.builder().type(Type.Known.INTEGER).build(),
                        "questionScores", Schema.builder()
                                .type(Type.Known.ARRAY)
                                .items(Schema.builder()
                                        .type(Type.Known.OBJECT)
                                        .properties(ImmutableMap.of(
                                                "questionId", Schema.builder().type(Type.Known.INTEGER).build(),
                                                "score", Schema.builder().type(Type.Known.INTEGER).build(),
                                                "feedback", Schema.builder().type(Type.Known.STRING).build()
                                        ))
                                        .required(List.of("questionId", "score", "feedback"))
                                        .build())
                                .build(),
                        "generalFeedback", Schema.builder().type(Type.Known.STRING).build(),
                        "improvementSuggestions", Schema.builder().type(Type.Known.STRING).build()
                ))
                .required(List.of("totalScore", "questionScores", "generalFeedback", "improvementSuggestions"))
                .build();
    }

    private String buildQuestionGenerationPrompt(InterviewRequestDTO request) {
        return "Bạn là một chuyên gia tuyển dụng và phỏng vấn. " +
                "Hãy tạo 10 câu hỏi phỏng vấn phù hợp cho ứng viên với thông tin sau:\n\n" +
                "- Vị trí ứng tuyển: " + request.getPosition() + "\n" +
                "- Lĩnh vực công việc: " + request.getField() + "\n" +
                "- Cấp độ kinh nghiệm: " + request.getLevel() + "\n\n" +
                "Yêu cầu:\n" +
                "1. Tạo mix các loại câu hỏi: Technical (40%), Behavioral (40%), Situational (20%)\n" +
                "2. Câu hỏi phù hợp với level kinh nghiệm được chỉ định\n" +
                "3. Câu hỏi bằng tiếng Việt, rõ ràng và dễ hiểu\n" +
                "4. Mỗi câu hỏi cần có hint (gợi ý trả lời) ngắn gọn\n\n" +
                "Hãy trả về kết quả theo định dạng JSON array như mẫu sau:\n" +
                "[\n" +
                "  {\n" +
                "    \"questionId\": 1,\n" +
                "    \"questionText\": \"Câu hỏi phỏng vấn...\",\n" +
                "    \"hint\": \"Gợi ý trả lời...\"\n" +
                "  }\n" +
                "]\n";
    }


    private String buildGradingPrompt(AnswerSubmitDTO submission) {
        String answersText = submission.getAnswers().stream()
                .map(answer -> String.format(
                        "- Câu hỏi ID: %d\n  Nội dung câu hỏi: %s\n  Câu trả lời: %s",
                        answer.getQuestionId(),
                        answer.getQuestionText(),
                        answer.getAnswerText()))
                .collect(Collectors.joining("\n\n"));

        return "Bạn là một chuyên gia phỏng vấn. Hãy chấm điểm các câu trả lời phỏng vấn của ứng viên dựa trên thông tin sau:\n\n" +
                "Thông tin ứng viên:\n" +
                "- Vị trí ứng tuyển: " + submission.getPosition() + "\n" +
                "- Lĩnh vực công việc: " + submission.getField() + "\n" +
                "- Cấp độ kinh nghiệm: " + submission.getLevel() + "\n\n" +
                "Danh sách câu hỏi và câu trả lời:\n" + answersText + "\n\n" +
                "Yêu cầu:\n" +
                "1. Chấm điểm từng câu trả lời trên thang điểm 0-100 dựa trên tính chính xác, rõ ràng và phù hợp với vị trí, lĩnh vực và cấp độ kinh nghiệm.\n" +
                "2. Cung cấp phản hồi cụ thể (feedback) cho từng câu trả lời, giải thích điểm mạnh và điểm cần cải thiện.\n" +
                "3. Tính tổng điểm (totalScore) bằng cách lấy trung bình điểm của các câu trả lời (làm tròn đến số nguyên).\n" +
                "4. Đưa ra nhận xét tổng quan (generalFeedback) về màn thể hiện của ứng viên.\n" +
                "5. Đưa ra gợi ý cải thiện (improvementSuggestions) để ứng viên làm tốt hơn.\n" +
                "6. Kết quả trả về bằng tiếng Việt, rõ ràng và dễ hiểu.\n\n" +
                "Hãy trả về kết quả theo định dạng JSON như mẫu sau:\n" +
                "{\n" +
                "  \"totalScore\": 85,\n" +
                "  \"questionScores\": [\n" +
                "    {\n" +
                "      \"questionId\": 1,\n" +
                "      \"score\": 80,\n" +
                "      \"feedback\": \"Câu trả lời tốt, nhưng cần chi tiết hơn về...\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"generalFeedback\": \"Ứng viên thể hiện tốt, nhưng cần cải thiện...\",\n" +
                "  \"improvementSuggestions\": \"Tập trung vào việc cung cấp ví dụ cụ thể hơn...\"\n" +
                "}\n";
    }
}