package com.resumeai.service;
// GeminiClient - Helper gọi Gemini API dùng chung
import com.google.genai.Client;
import com.google.genai.ResponseStream;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Schema;
import com.google.gson.Gson;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.SocketTimeoutException;
import java.util.List;

@Service
public class GeminiClient {
    @Value("${gemini.api.key")
    private String apiKey;

    @Value("${gemini.api.model")
    private String modelName;

    private final Gson gson = new Gson();
    public ResponseStream<GenerateContentResponse> generateContentStream(List<Content> contents, Schema schema) {
        // Khởi tạo Client
        try (Client geminiClient = Client.builder().apiKey(apiKey).build()) {
            GenerateContentConfig config = GenerateContentConfig.builder()
                    .responseMimeType("application/json")
                    .responseSchema(schema)
                    .build();

            // các hàm controller sẽ truyền contents và schema vào sau

            return geminiClient.models.generateContentStream(modelName, contents, config);
        }
        catch (Exception e) {
            throw new RuntimeException("Lỗi khi gọi API Gemini" + e.getMessage(), e);
        }

    }

}