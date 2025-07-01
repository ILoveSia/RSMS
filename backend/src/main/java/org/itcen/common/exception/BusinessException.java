package org.itcen.common.exception;

/**
 * 비즈니스 로직 예외
 * 
 * 비즈니스 규칙 위반이나 잘못된 요청 시 발생하는 예외입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 비즈니스 예외 처리만 담당
 * - Open/Closed: 새로운 예외 타입 추가 시 확장 가능
 */
public class BusinessException extends RuntimeException {

    private final String errorCode;

    /**
     * 기본 생성자
     * 
     * @param message 예외 메시지
     */
    public BusinessException(String message) {
        super(message);
        this.errorCode = "BUSINESS_ERROR";
    }

    /**
     * 오류 코드를 포함한 생성자
     * 
     * @param message 예외 메시지
     * @param errorCode 오류 코드
     */
    public BusinessException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    /**
     * 원인 예외를 포함한 생성자
     * 
     * @param message 예외 메시지
     * @param cause 원인 예외
     */
    public BusinessException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "BUSINESS_ERROR";
    }

    /**
     * 모든 정보를 포함한 생성자
     * 
     * @param message 예외 메시지
     * @param errorCode 오류 코드
     * @param cause 원인 예외
     */
    public BusinessException(String message, String errorCode, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    /**
     * 오류 코드 반환
     * 
     * @return 오류 코드
     */
    public String getErrorCode() {
        return errorCode;
    }
}