package com.resumeai.service;
// GeminiClient - Helper gọi Gemini API dùng chung
import com.google.genai.Client;
import com.google.genai.ResponseStream;
import com.google.genai.types.*;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.resumeai.dto.ResumeAnalysisDTO;

import autovalue.shaded.org.checkerframework.checker.nullness.qual.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.ArrayList;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.ImmutableMap;
import com.google.gson.reflect.TypeToken;
import com.resumeai.dto.InterviewQuestionDTO;

@Service
public class GeminiClient {
    private static final Logger logger = LoggerFactory.getLogger(GeminiClient.class);

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model}")
    private String modelName;

    private final Gson gson = new Gson();

    public GenerateContentResponse generateContent(List<Content> contents, Schema schema) {
        try (Client geminiClient = Client.builder().apiKey(apiKey).build()) {
            GenerateContentConfig.Builder configBuilder = GenerateContentConfig.builder();
            
            // Chỉ set schema nếu không null
            if (schema != null) {
                configBuilder.responseMimeType("application/json")
                           .responseSchema(schema);
            }
            
            GenerateContentConfig config = configBuilder.build();
            return geminiClient.models.generateContent(modelName, contents, config);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi gọi API Gemini: " + e.getMessage(), e);
        }
    }

    public ResumeAnalysisDTO analyzeResume(String rawResumeText, @Nullable String jobDescription) {
        try {
            logger.info("Starting resume analysis. Resume length: {}, Has job description: {}",
                rawResumeText.length(), jobDescription != null);

            // Tạo prompt chi tiết cho Gemini
            String prompt;
            
       if (jobDescription != null && !jobDescription.trim().isEmpty()) {
            prompt = String.format("""
                Bạn là một chuyên gia tuyển dụng và hướng nghiệp với nhiều năm kinh nghiệm.

                QUAN TRỌNG: Phân tích ngôn ngữ của CV gốc và sử dụng CHÍNH XÁC cùng ngôn ngữ đó trong tất cả nội dung cải thiện.

                Đây là một đoạn văn bản hồ sơ xin việc chưa được định dạng:
                ---
                %s
                ---

                Đây là mô tả công việc tương ứng:
                ---
                %s
                ---

                Hãy phân tích hồ sơ dựa trên MÔ TẢ CÔNG VIỆC và trích xuất các phần: "Kinh nghiệm làm việc", "Học vấn", và "Kỹ năng".
                Với mỗi phần, hãy:
                1. Trích xuất và tóm tắt nội dung hiện tại từ hồ sơ (noi_dung)
                2. Viết lại nội dung đã được cải thiện hoàn chỉnh, phù hợp với mô tả công việc. Nội dung này phải được viết như một phần hoàn chỉnh của CV, không phải dạng gợi ý hay nhận xét. QUAN TRỌNG: Sử dụng cùng ngôn ngữ với CV gốc (noi_dung_cai_thien)
                3. Giải thích lý do tại sao cần cải thiện và những thay đổi đã được thực hiện (ly_do)

                Nếu phần nào bị thiếu trong hồ sơ gốc, hãy ghi "Không có thông tin" trong noi_dung và tạo nội dung mẫu phù hợp với mô tả công việc trong noi_dung_cai_thien. Nội dung mẫu phải sử dụng cùng ngôn ngữ với phần còn lại của CV.

                Trả kết quả theo định dạng JSON sau:
                {
                  "kinh_nghiem_lam_viec": {
                    "noi_dung": string,
                    "noi_dung_cai_thien": string,
                    "ly_do": string
                  },
                  "hoc_van": {
                    "noi_dung": string,
                    "noi_dung_cai_thien": string,
                    "ly_do": string
                  },
                  "ky_nang": {
                    "noi_dung": string,
                    "noi_dung_cai_thien": string,
                    "ly_do": string
                  }
                }
                """, rawResumeText, jobDescription);
        } else {
            // Logic cho trường hợp không có job description
            prompt = String.format("""
                Bạn là một chuyên gia tuyển dụng và hướng nghiệp với nhiều năm kinh nghiệm.

                QUAN TRỌNG: Phân tích ngôn ngữ của CV gốc và sử dụng CHÍNH XÁC cùng ngôn ngữ đó trong tất cả nội dung cải thiện.

                Đây là một đoạn văn bản hồ sơ xin việc chưa được định dạng:
                ---
                %s
                ---

                Hãy phân tích đoạn văn này và trích xuất các phần: "Kinh nghiệm làm việc", "Học vấn", và "Kỹ năng".
                Với mỗi phần, hãy:
                1. Trích xuất và tóm tắt nội dung hiện tại từ văn bản gốc (noi_dung)
                2. Viết lại nội dung đã được cải thiện hoàn chỉnh với ngôn từ chuyên nghiệp, rõ ràng và có tác động mạnh hơn. Nội dung này phải được viết như một phần hoàn chỉnh của CV, không phải dạng gợi ý hay nhận xét. QUAN TRỌNG: Sử dụng cùng ngôn ngữ với CV gốc (noi_dung_cai_thien)
                3. Giải thích rõ ràng lý do tại sao cần cải thiện và những thay đổi đã được thực hiện (ly_do)

                Nếu phần nào thiếu hoàn toàn trong hồ sơ gốc, hãy ghi "Không có thông tin" trong noi_dung và tạo nội dung mẫu chuyên nghiệp trong noi_dung_cai_thien. Nội dung mẫu phải sử dụng cùng ngôn ngữ với phần còn lại của CV.

                Trả kết quả theo định dạng JSON sau:
                {
                  "kinh_nghiem_lam_viec": {
                    "noi_dung": string,
                    "noi_dung_cai_thien": string,
                    "ly_do": string
                  },
                  "hoc_van": {
                    "noi_dung": string,
                    "noi_dung_cai_thien": string,
                    "ly_do": string
                  },
                  "ky_nang": {
                    "noi_dung": string,
                    "noi_dung_cai_thien": string,
                    "ly_do": string
                  }
                }
                """, rawResumeText);
        }
            

            // Tạo Content với builder pattern
            Content content = Content.builder()
                .role("user")
                .parts(List.of(Part.fromText(prompt)))
                .build();
            
            // Gọi API Gemini với schema null (để Gemini tự format JSON)
            logger.info("Calling Gemini API for resume analysis");
            GenerateContentResponse response = generateContent(List.of(content), null);

            // Trích xuất JSON từ response
            String responseText = response.text();
            logger.debug("Raw response from Gemini: {}", responseText);

            if (responseText.contains("```json")) {
                responseText = responseText.replace("```json", "").trim();
            }
            if (responseText.contains("```")) {
                responseText = responseText.replace("```", "").trim();
            }

            logger.info("Cleaned response text length: {}", responseText.length());

            ObjectMapper mapper = new ObjectMapper();
            ResumeAnalysisDTO dto = mapper.readValue(responseText, ResumeAnalysisDTO.class);

            logger.info("Successfully parsed response to DTO");
            return dto;
            
        } catch (Exception e) {
            logger.error("Error analyzing resume with Gemini: {}", e.getMessage(), e);

            // Provide more specific error messages
            if (e.getMessage().contains("API key")) {
                throw new RuntimeException("Lỗi xác thực API Gemini. Vui lòng kiểm tra cấu hình.", e);
            } else if (e.getMessage().contains("timeout")) {
                throw new RuntimeException("Timeout khi gọi API Gemini. Vui lòng thử lại.", e);
            } else if (e.getMessage().contains("JSON")) {
                throw new RuntimeException("Lỗi xử lý dữ liệu từ Gemini. Vui lòng thử lại.", e);
            } else {
                throw new RuntimeException("Lỗi khi phân tích hồ sơ với Gemini: " + e.getMessage(), e);
            }
        }
    }

    public List<InterviewQuestionDTO> generateInterviewQuestionsFromResume(String resumeText, @Nullable String jobDescription) {
        try {
            logger.info("Starting interview questions generation from resume. Resume length: {}, Has job description: {}",
                resumeText.length(), jobDescription != null);

            // Create prompt for Gemini
            String prompt = buildInterviewQuestionPromptFromResume(resumeText, jobDescription);
            logger.debug("Generated prompt length: {}", prompt.length());

            // Create schema for structured output (same as MockInterviewServiceImpl)
            Schema questionSchema = createQuestionSchema();

            // Create content for Gemini
            List<Content> contents = List.of(
                Content.builder()
                    .parts(List.of(Part.fromText(prompt)))
                    .build()
            );

            // Call Gemini API
            logger.info("Calling Gemini API for interview questions generation");
            GenerateContentResponse response = generateContent(contents, questionSchema);

            // Extract JSON from response
            String jsonResponse = response.text();
            logger.debug("Raw response from Gemini: {}", jsonResponse);

            // Parse JSON response into List<InterviewQuestionDTO>
            java.lang.reflect.Type listType = new TypeToken<List<InterviewQuestionDTO>>(){}.getType();
            List<InterviewQuestionDTO> questions = gson.fromJson(jsonResponse, listType);

            logger.info("Successfully generated {} interview questions", questions != null ? questions.size() : 0);
            return questions != null ? questions : new ArrayList<>();

        } catch (Exception e) {
            logger.error("Error generating interview questions from resume: {}", e.getMessage(), e);

            // Provide more specific error messages
            if (e.getMessage().contains("API key")) {
                throw new RuntimeException("Lỗi xác thực API Gemini. Vui lòng kiểm tra cấu hình.", e);
            } else if (e.getMessage().contains("timeout")) {
                throw new RuntimeException("Timeout khi gọi API Gemini. Vui lòng thử lại.", e);
            } else if (e.getMessage().contains("JSON")) {
                throw new RuntimeException("Lỗi xử lý dữ liệu từ Gemini. Vui lòng thử lại.", e);
            } else {
                throw new RuntimeException("Lỗi khi tạo câu hỏi phỏng vấn từ CV: " + e.getMessage(), e);
            }
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

    private String buildInterviewQuestionPromptFromResume(String resumeText, @Nullable String jobDescription) {
        if (jobDescription != null && !jobDescription.trim().isEmpty()) {
            // Case: CV + Job Description
            return String.format("""
                Bạn là một chuyên gia tuyển dụng và phỏng vấn kỹ thuật hàng đầu, có kinh nghiệm sâu sắc về các tiêu chuẩn nhân sự trong ngành.

                **THÔNG TIN ỨNG VIÊN:**

                **CV của ứng viên:**
                ---
                %s
                ---

                **Mô tả công việc:**
                ---
                %s
                ---

                **YÊU CẦU CHI TIẾT:**

                1. **Phân tích CV và JD:** Dựa vào CV và mô tả công việc, hãy tạo ra 10 câu hỏi phỏng vấn để đánh giá chính xác mức độ phù hợp của ứng viên với vị trí này.

                2. **Mục tiêu cốt lõi:** Các câu hỏi phải giúp đánh giá:
                   - Kinh nghiệm và kỹ năng cụ thể từ CV có phù hợp với yêu cầu công việc không
                   - Khả năng thực hiện các trách nhiệm trong JD
                   - Động lực và sự hiểu biết về vị trí ứng tuyển

                3. **Kết hợp câu hỏi (Tỷ lệ gợi ý: 40%% Technical, 40%% Behavioral, 20%% Situational):** Tập trung vào việc tạo ra câu hỏi thực tế, đánh giá đúng năng lực dựa trên CV và yêu cầu JD.

                4. **Gợi ý trả lời (Hint):** Hint không được tiết lộ đáp án. Thay vào đó, hãy gợi ý cho ứng viên về *cách tiếp cận vấn đề* hoặc *cấu trúc một câu trả lời tốt* (ví dụ: 'Hãy trình bày theo mô hình STAR' hoặc 'Hãy cân nhắc các yếu tố về hiệu năng và khả năng mở rộng').

                5. **Ngôn ngữ:** Câu hỏi bằng tiếng Việt, chuyên nghiệp, rõ ràng.

                **ĐỊNH DẠNG ĐẦU RA:**

                Hãy trả về kết quả theo định dạng JSON array như mẫu sau. **Tuyệt đối không thêm bất kỳ trường nào khác ngoài `questionId`, `questionText`, và `hint`.**
                [
                  {
                    "questionId": 1,
                    "questionText": "Câu hỏi phỏng vấn...",
                    "hint": "Gợi ý trả lời..."
                  }
                ]
                """, resumeText, jobDescription);
        } else {
            // Case: CV only
            return String.format("""
                Bạn là một chuyên gia tuyển dụng và phỏng vấn kỹ thuật hàng đầu, có kinh nghiệm sâu sắc về các tiêu chuẩn nhân sự trong ngành.

                **THÔNG TIN ỨNG VIÊN:**

                **CV của ứng viên:**
                ---
                %s
                ---

                **YÊU CẦU CHI TIẾT:**

                1. **Phân tích CV:** Dựa vào CV này, hãy suy luận ra vị trí, lĩnh vực và cấp độ kinh nghiệm phù hợp của ứng viên, sau đó tạo ra 10 câu hỏi phỏng vấn phù hợp.

                2. **Mục tiêu cốt lõi:** Các câu hỏi phải giúp đánh giá:
                   - Kinh nghiệm và kỹ năng cụ thể từ CV
                   - Khả năng và tiềm năng phát triển
                   - Động lực và mục tiêu nghề nghiệp

                3. **Kết hợp câu hỏi (Tỷ lệ gợi ý: 40%% Technical, 40%% Behavioral, 20%% Situational):** Tập trung vào việc tạo ra câu hỏi thực tế, đánh giá đúng năng lực dựa trên background của ứng viên.

                4. **Gợi ý trả lời (Hint):** Hint không được tiết lộ đáp án. Thay vào đó, hãy gợi ý cho ứng viên về *cách tiếp cận vấn đề* hoặc *cấu trúc một câu trả lời tốt* (ví dụ: 'Hãy trình bày theo mô hình STAR' hoặc 'Hãy cân nhắc các yếu tố về hiệu năng và khả năng mở rộng').

                5. **Ngôn ngữ:** Câu hỏi bằng tiếng Việt, chuyên nghiệp, rõ ràng.

                **ĐỊNH DẠNG ĐẦU RA:**

                Hãy trả về kết quả theo định dạng JSON array như mẫu sau. **Tuyệt đối không thêm bất kỳ trường nào khác ngoài `questionId`, `questionText`, và `hint`.**
                [
                  {
                    "questionId": 1,
                    "questionText": "Câu hỏi phỏng vấn...",
                    "hint": "Gợi ý trả lời..."
                  }
                ]
                """, resumeText);
        }
    }
}