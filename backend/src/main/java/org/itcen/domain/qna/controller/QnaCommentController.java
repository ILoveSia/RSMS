package org.itcen.domain.qna.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.itcen.common.dto.ApiResponse;
import org.itcen.domain.qna.dto.QnaCommentDto;
import org.itcen.domain.qna.dto.QnaCommentCreateRequest;
import org.itcen.domain.qna.service.QnaCommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/qna")
@RequiredArgsConstructor
public class QnaCommentController {

    private final QnaCommentService qnaCommentService;

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<QnaCommentDto>>> getComments(@PathVariable("id") Long qnaId) {
        List<QnaCommentDto> comments = qnaCommentService.getComments(qnaId);
        return ResponseEntity.ok(ApiResponse.success("댓글 조회가 완료되었습니다.", comments));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<Long>> addComment(
            @PathVariable("id") Long qnaId,
            @Valid @RequestBody QnaCommentCreateRequest request,
            @RequestHeader(value = "X-User-Id", defaultValue = "anonymous") String currentUserId
    ) {
        Long commentId = qnaCommentService.addComment(qnaId, request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("댓글이 등록되었습니다.", commentId));
    }
}


