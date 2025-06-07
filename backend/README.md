# Resume AI Backend

Backend Java Spring Boot cho ứng dụng Resume AI - phân tích CV và tạo câu hỏi phỏng vấn bằng Gemini AI.

## Tính năng

- **Upload và phân tích CV**: Hỗ trợ file PDF, DOC, DOCX
- **Trích xuất text**: Sử dụng Apache POI và PDFBox
- **Phân tích CV**: Tích hợp Gemini AI để phân tích và đưa ra gợi ý cải thiện
- **Tạo câu hỏi phỏng vấn**: Sinh câu hỏi phỏng vấn dựa trên CV và mô tả công việc
- **So sánh Job Match**: Tính điểm phù hợp giữa CV và công việc

## Công nghệ sử dụng

- **Java 17**
- **Spring Boot 3.2.0**
- **Apache POI** - xử lý file DOC/DOCX
- **Apache PDFBox** - xử lý file PDF
- **Google Gemini AI** - phân tích và tạo nội dung
- **Maven** - quản lý dependencies

## Cài đặt và chạy

### 1. Cài đặt Java 17

Đảm bảo đã cài đặt Java 17 trên máy:

```bash
java -version
```

### 2. Cài đặt Maven

Cài đặt Apache Maven hoặc sử dụng Maven wrapper đi kèm.

### 3. Cấu hình Gemini API Key

Tạo file `.env` hoặc set environment variable:

```bash
export GEMINI_API_KEY="your-gemini-api-key-here"
```

Hoặc sửa trong `src/main/resources/application.properties`:

```properties
gemini.api.key=your-gemini-api-key-here
```

### 4. Build và chạy

```bash
# Build project
mvn clean compile

# Chạy ứng dụng
mvn spring-boot:run
```

Hoặc sử dụng Maven wrapper:

```bash
# Windows
./mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

Backend sẽ chạy tại: `http://localhost:8080`

## API Endpoints

### 1. Health Check
```
GET /api/resume/health
```

### 2. Upload và phân tích CV
```
POST /api/resume/upload
Content-Type: multipart/form-data
Body: file (PDF/DOC/DOCX)
```

### 3. Phân tích CV từ text
```
POST /api/resume/analyze-text
Content-Type: application/json
Body: { "text": "nội dung CV" }
```

### 4. So sánh Job Match
```
POST /api/resume/job-match
Content-Type: application/json
Body: {
  "jobDescription": "mô tả công việc",
  "resumeText": "nội dung CV"
}
```

### 5. Tạo câu hỏi phỏng vấn
```
POST /api/resume/interview-questions
Content-Type: application/json
Body: {
  "jobDescription": "mô tả công việc",
  "resumeText": "nội dung CV"
}
```

## Cấu trúc dự án

```
backend/
├── src/main/java/com/resumeai/
│   ├── ResumeAiApplication.java          # Main application
│   ├── config/
│   │   └── WebConfig.java                # CORS configuration
│   ├── controller/
│   │   └── ResumeController.java         # REST API endpoints
│   ├── model/
│   │   ├── ResumeData.java              # Resume data model
│   │   ├── InterviewQuestion.java        # Interview question model
│   │   └── JobMatchResult.java          # Job match result model
│   └── service/
│       ├── DocumentParserService.java    # File parsing service
│       └── GeminiService.java           # Gemini AI integration
├── src/main/resources/
│   └── application.properties           # Application configuration
├── pom.xml                             # Maven dependencies
└── README.md                           # This file
```

## Lưu ý

1. **API Key**: Cần có Gemini API key hợp lệ để sử dụng
2. **File size**: Giới hạn upload file tối đa 10MB
3. **CORS**: Đã cấu hình cho frontend chạy trên port 5173 và 3000
4. **Error handling**: Tất cả API đều có xử lý lỗi và trả về message tiếng Việt

## Troubleshooting

### Lỗi Maven dependencies
```bash
mvn clean install -U
```

### Lỗi Gemini API
- Kiểm tra API key có đúng không
- Kiểm tra quota và billing của Google Cloud

### Lỗi CORS
- Đảm bảo frontend URL đã được thêm vào CORS configuration

## Development

Để phát triển thêm tính năng:

1. Thêm model mới trong `model/`
2. Tạo service trong `service/`
3. Thêm endpoint trong `controller/`
4. Update CORS nếu cần thiết