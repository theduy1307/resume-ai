package com.resumeai.service;

import com.google.common.collect.ImmutableList;
import com.google.genai.Client;
import com.google.genai.ResponseStream;
import com.google.genai.types.*;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.resumeai.model.ResumeData;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model}")
    private String model;

    private final Gson gson = new Gson();

    public ResumeData analyzeResume(String resumeText) {
        try {
            Client client = Client.builder().apiKey(apiKey).build();

            String prompt = String.format("""
                Phân tích CV sau và trả về kết quả theo định dạng JSON:
                
                CV Content:
                %s
                
                Hãy trích xuất thông tin cá nhân và phân tích từng phần của CV, đưa ra những cải thiện cụ thể cho từng phần.
                """, resumeText);

            List<Content> contents = ImmutableList.of(
                Content.builder()
                    .role("user")
                    .parts(ImmutableList.of(Part.fromText(prompt)))
                    .build()
            );

            GenerateContentConfig config = GenerateContentConfig
                .builder()
                .responseMimeType("application/json")
                .responseSchema(Schema.fromJson("""
                    {
                      "type": "object",
                      "properties": {
                        "personalInfo": {
                          "type": "object",
                          "properties": {
                            "name": { "type": "string" },
                            "email": { "type": "string" },
                            "phone": { "type": "string" },
                            "address": { "type": "string" }
                          }
                        },
                        "sections": {
                          "type": "array",
                          "items": {
                            "type": "object",
                            "properties": {
                              "title": { "type": "string" },
                              "content": { "type": "string" },
                              "improvements": {
                                "type": "array",
                                "items": { "type": "string" }
                              }
                            }
                          }
                        }
                      }
                    }
                """))
                .build();

            ResponseStream<GenerateContentResponse> responseStream = 
                client.models.generateContentStream(model, contents, config);

            StringBuilder responseBuilder = new StringBuilder();
            for (GenerateContentResponse res : responseStream) {
                if (res.candidates().isEmpty() || 
                    res.candidates().get().get(0).content().isEmpty() || 
                    res.candidates().get().get(0).content().get().parts().isEmpty()) {
                    continue;
                }

                List<Part> parts = res.candidates().get().get(0).content().get().parts().get();
                for (Part part : parts) {
                    responseBuilder.append(part.text());
                }
            }

            responseStream.close();

            // Parse JSON response to ResumeData
            String jsonString = responseBuilder.toString().trim();
            System.out.println("Gemini response: " + jsonString); // Debug log
            
            try {
                JsonObject jsonResponse = gson.fromJson(jsonString, JsonObject.class);
                ResumeData resumeData = gson.fromJson(jsonResponse, ResumeData.class);
                resumeData.setExtractedText(resumeText);
                return resumeData;
            } catch (Exception e) {
                // If parsing fails, create a basic ResumeData structure
                ResumeData resumeData = new ResumeData();
                resumeData.setExtractedText(resumeText);
                
                // Create basic personal info
                ResumeData.PersonalInfo personalInfo = new ResumeData.PersonalInfo();
                personalInfo.setName("Chưa xác định");
                personalInfo.setEmail("Chưa xác định");
                personalInfo.setPhone("Chưa xác định");
                personalInfo.setAddress("Chưa xác định");
                resumeData.setPersonalInfo(personalInfo);
                
                // Create basic sections
                List<ResumeData.ResumeSection> sections = new ArrayList<>();
                ResumeData.ResumeSection section = new ResumeData.ResumeSection();
                section.setTitle("Thông tin CV");
                section.setContent(resumeText);
                section.setImprovements(List.of("Cần phân tích thêm để đưa ra gợi ý cải thiện"));
                sections.add(section);
                resumeData.setSections(sections);
                
                return resumeData;
            }

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi phân tích CV với Gemini API: " + e.getMessage(), e);
        }
    }

    public List<String> generateInterviewQuestions(String jobDescription, String resumeText) {
        try {
            Client client = Client.builder().apiKey(apiKey).build();

            String prompt = String.format("""
                Dựa trên mô tả công việc và CV dưới đây, hãy tạo 5 câu hỏi phỏng vấn phù hợp:
                
                Mô tả công việc:
                %s
                
                CV:
                %s
                
                Trả về danh sách câu hỏi theo định dạng JSON.
                """, jobDescription != null ? jobDescription : "Không có mô tả công việc cụ thể", 
                resumeText != null ? resumeText : "Không có CV");

            List<Content> contents = ImmutableList.of(
                Content.builder()
                    .role("user")
                    .parts(ImmutableList.of(Part.fromText(prompt)))
                    .build()
            );

            GenerateContentConfig config = GenerateContentConfig
                .builder()
                .responseMimeType("application/json")
                .responseSchema(Schema.fromJson("""
                    {
                      "type": "object",
                      "properties": {
                        "questions": {
                          "type": "array",
                          "items": { "type": "string" }
                        }
                      }
                    }
                """))
                .build();

            ResponseStream<GenerateContentResponse> responseStream = 
                client.models.generateContentStream(model, contents, config);

            StringBuilder responseBuilder = new StringBuilder();
            for (GenerateContentResponse res : responseStream) {
                if (res.candidates().isEmpty() || 
                    res.candidates().get().get(0).content().isEmpty() || 
                    res.candidates().get().get(0).content().get().parts().isEmpty()) {
                    continue;
                }

                List<Part> parts = res.candidates().get().get(0).content().get().parts().get();
                for (Part part : parts) {
                    responseBuilder.append(part.text());
                }
            }

            responseStream.close();

            JsonObject jsonResponse = gson.fromJson(responseBuilder.toString(), JsonObject.class);
            List<String> questions = new ArrayList<>();
            
            if (jsonResponse.has("questions")) {
                jsonResponse.getAsJsonArray("questions").forEach(element -> 
                    questions.add(element.getAsString()));
            }
            
            return questions;

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo câu hỏi phỏng vấn với Gemini API: " + e.getMessage(), e);
        }
    }

    public double calculateJobMatch(String jobDescription, String resumeText) {
        try {
            Client client = Client.builder().apiKey(apiKey).build();

            String prompt = String.format("""
                So sánh độ phù hợp giữa CV và mô tả công việc sau, trả về điểm từ 0-100:
                
                Mô tả công việc:
                %s
                
                CV:
                %s
                
                Trả về điểm số phù hợp theo định dạng JSON.
                """, jobDescription, resumeText);

            List<Content> contents = ImmutableList.of(
                Content.builder()
                    .role("user")
                    .parts(ImmutableList.of(Part.fromText(prompt)))
                    .build()
            );

            GenerateContentConfig config = GenerateContentConfig
                .builder()
                .responseMimeType("application/json")
                .responseSchema(Schema.fromJson("""
                    {
                      "type": "object",
                      "properties": {
                        "score": { "type": "number" }
                      }
                    }
                """))
                .build();

            ResponseStream<GenerateContentResponse> responseStream = 
                client.models.generateContentStream(model, contents, config);

            StringBuilder responseBuilder = new StringBuilder();
            for (GenerateContentResponse res : responseStream) {
                if (res.candidates().isEmpty() || 
                    res.candidates().get().get(0).content().isEmpty() || 
                    res.candidates().get().get(0).content().get().parts().isEmpty()) {
                    continue;
                }

                List<Part> parts = res.candidates().get().get(0).content().get().parts().get();
                for (Part part : parts) {
                    responseBuilder.append(part.text());
                }
            }

            responseStream.close();

            JsonObject jsonResponse = gson.fromJson(responseBuilder.toString(), JsonObject.class);
            return jsonResponse.has("score") ? jsonResponse.get("score").getAsDouble() : 0.0;

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tính điểm phù hợp với Gemini API: " + e.getMessage(), e);
        }
    }
}