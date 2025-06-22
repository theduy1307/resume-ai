package com.resumeai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO cho kết quả phân tích hồ sơ xin việc
 */
public class ResumeAnalysisDTO {
    
    @JsonProperty("kinh_nghiem_lam_viec")
    private SectionAnalysisDTO kinhNghiemLamViec;
    
    @JsonProperty("hoc_van")
    private SectionAnalysisDTO hocVan;
    
    @JsonProperty("ky_nang")
    private SectionAnalysisDTO kyNang;

    @JsonProperty("phu_hop")
    private String phuHop;

    // Constructors
    public ResumeAnalysisDTO() {}

    public ResumeAnalysisDTO(
        SectionAnalysisDTO kinhNghiemLamViec, 
        SectionAnalysisDTO hocVan, 
        SectionAnalysisDTO kyNang, 
        String phuHop) {
        this.kinhNghiemLamViec = kinhNghiemLamViec;
        this.hocVan = hocVan;
        this.kyNang = kyNang;
        this.phuHop = phuHop;
    }

    // Getters and Setters
    public SectionAnalysisDTO getKinhNghiemLamViec() {
        return kinhNghiemLamViec;
    }

    public void setKinhNghiemLamViec(SectionAnalysisDTO kinhNghiemLamViec) {
        this.kinhNghiemLamViec = kinhNghiemLamViec;
    }

    public SectionAnalysisDTO getHocVan() {
        return hocVan;
    }

    public void setHocVan(SectionAnalysisDTO hocVan) {
        this.hocVan = hocVan;
    }

    public SectionAnalysisDTO getKyNang() {
        return kyNang;
    }

    public void setKyNang(SectionAnalysisDTO kyNang) {
        this.kyNang = kyNang;
    }

    public String getPhuHop() {
        return phuHop;
    }

    public void setPhuHop(String phuHop) {
        this.phuHop = phuHop;
    }
}

/**
 * DTO cho từng phần phân tích (kinh nghiệm, học vấn, kỹ năng)
 */
class SectionAnalysisDTO {

    @JsonProperty("noi_dung")
    private String noiDung;

    @JsonProperty("noi_dung_cai_thien")
    private String noiDungCaiThien;

    @JsonProperty("ly_do")
    private String lyDo;

    @JsonProperty("phu_hop")
    private String phuHop;

    // Constructors
    public SectionAnalysisDTO() {}

    public SectionAnalysisDTO(String noiDung, String noiDungCaiThien, String lyDo) {
        this.noiDung = noiDung;
        this.noiDungCaiThien = noiDungCaiThien;
        this.lyDo = lyDo;
    }

    // Getters and Setters
    public String getNoiDung() {
        return noiDung;
    }

    public void setNoiDung(String noiDung) {
        this.noiDung = noiDung;
    }

    public String getNoiDungCaiThien() {
        return noiDungCaiThien;
    }

    public void setNoiDungCaiThien(String noiDungCaiThien) {
        this.noiDungCaiThien = noiDungCaiThien;
    }

    public String getLyDo() {
        return lyDo;
    }

    public void setLyDo(String lyDo) {
        this.lyDo = lyDo;
    }

    public String getPhuHop() {
        return phuHop;
    }

    public void setPhuHop(String phuHop) {
        this.phuHop = phuHop;
    }
}