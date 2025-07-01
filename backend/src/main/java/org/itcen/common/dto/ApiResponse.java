package org.itcen.common.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 공통 API 응답 DTO
 * 
 * 모든 API 응답에서 사용되는 공통 형식을 정의합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: API 응답 형식 정의만 담당
 * - Open/Closed: 확장에는 열려있고 수정에는 닫혀있음
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    /**
     * 응답 성공 여부
     */
    private boolean success;

    /**
     * 응답 메시지
     */
    private String message;

    /**
     * 응답 데이터
     */
    private T data;

    /**
     * 오류 정보
     */
    private ErrorInfo error;

    /**
     * 응답 시간
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    /**
     * 성공 응답 생성 (메시지와 데이터 포함)
     * 
     * @param message 응답 메시지
     * @param data 응답 데이터
     * @param <T> 데이터 타입
     * @return 성공 응답
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    /**
     * 성공 응답 생성 (데이터만)
     * 
     * @param data 응답 데이터
     * @param <T> 데이터 타입
     * @return 성공 응답
     */
    public static <T> ApiResponse<T> success(T data) {
        return success("요청이 성공적으로 처리되었습니다.", data);
    }

    /**
     * 성공 응답 생성 (메시지만)
     * 
     * @param message 응답 메시지
     * @return 성공 응답
     */
    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .build();
    }

    /**
     * 실패 응답 생성
     * 
     * @param message 오류 메시지
     * @param errorCode 오류 코드
     * @param <T> 데이터 타입
     * @return 실패 응답
     */
    public static <T> ApiResponse<T> error(String message, String errorCode) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .error(ErrorInfo.builder()
                        .code(errorCode)
                        .message(message)
                        .build())
                .build();
    }

    /**
     * 실패 응답 생성 (메시지만)
     * 
     * @param message 오류 메시지
     * @param <T> 데이터 타입
     * @return 실패 응답
     */
    public static <T> ApiResponse<T> error(String message) {
        return error(message, "INTERNAL_ERROR");
    }

    /**
     * 오류 정보 내부 클래스
     */
    @Getter
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ErrorInfo {
        private String code;
        private String message;
        private String details;
    }
} 