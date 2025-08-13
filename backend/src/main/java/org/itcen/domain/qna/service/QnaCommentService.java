package org.itcen.domain.qna.service;

import org.itcen.domain.qna.dto.QnaCommentDto;
import org.itcen.domain.qna.dto.QnaCommentCreateRequest;

import java.util.List;

public interface QnaCommentService {
    List<QnaCommentDto> getComments(Long qnaId);
    Long addComment(Long qnaId, QnaCommentCreateRequest req, String userId);
}


