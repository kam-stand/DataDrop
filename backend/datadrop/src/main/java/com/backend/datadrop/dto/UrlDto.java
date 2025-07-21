package com.backend.datadrop.dto;

public class UrlDto {
    private String url;
    private String file_type;

    public UrlDto() {

    }
    public UrlDto(String url, String file_type) {
        this.url = url;
        this.file_type = file_type;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getFile_type() {
        return file_type;
    }

    public void setFile_type(String file_type) {
        this.file_type = file_type;
    }
}
