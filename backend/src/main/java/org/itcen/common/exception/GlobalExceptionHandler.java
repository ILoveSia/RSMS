package org.itcen.common.exception;

import lombok.extern.slf4j.Slf4j;
import org.itcen.common.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * 전역 예외 처리 핸들러
 * 애플리케이션에서 발생하는 모든 예외를 처리
 * 
 * SOLID 원칙:
 * - Single Responsibility: 예외 처리만 담당
 * - Open/Closed: 새로운 예외 타입 추가 시 확장 가능
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 일반적인 예외 처리
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleException(Exception e) {
        log.error("Unexpected error occurred", e);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("서버 내부 오류가 발생했습니다."));
    }

    /**
     * 런타임 예외 처리
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> handleRuntimeException(RuntimeException e) {
        log.error("Runtime error occurred", e);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
    }

    /**
     * 유효성 검증 실패 예외 처리 (@Valid)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(
            MethodArgumentNotValidException e) {
        log.warn("Validation error occurred", e);
        
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Map<String, String>>builder()
                        .success(false)
                        .message("입력값 검증에 실패했습니다.")
                        .data(errors)
                        .error(ApiResponse.ErrorInfo.builder()
                                .code("VALIDATION_ERROR")
                                .message("입력값 검증에 실패했습니다.")
                                .build())
                        .build());
    }

    /**
     * 바인딩 예외 처리
     */
    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleBindException(BindException e) {
        log.warn("Binding error occurred", e);
        
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Map<String, String>>builder()
                        .success(false)
                        .message("데이터 바인딩에 실패했습니다.")
                        .data(errors)
                        .error(ApiResponse.ErrorInfo.builder()
                                .code("BINDING_ERROR")
                                .message("데이터 바인딩에 실패했습니다.")
                                .build())
                        .build());
    }

    /**
     * 잘못된 인수 예외 처리
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgumentException(IllegalArgumentException e) {
        log.warn("Illegal argument error occurred", e);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage(), "INVALID_ARGUMENT"));
    }

    /**
     * 잘못된 상태 예외 처리
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalStateException(IllegalStateException e) {
        log.warn("Illegal state error occurred", e);
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(e.getMessage(), "INVALID_STATE"));
    }
} 