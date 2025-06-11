package com.resumeai.service;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class SingleOrArrayDeserializer extends JsonDeserializer<List<String>> {
    @Override
    public List<String> deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonNode node = p.getCodec().readTree(p);
        List<String> result = new ArrayList<>();

        if (node.isArray()) {
            for (JsonNode item : node) {
                result.add(item.asText());
            }
        } else if (node.isTextual()) {
            result.add(node.asText()); // Chuỗi đơn → danh sách 1 phần tử
        }

        return result;
    }
}
