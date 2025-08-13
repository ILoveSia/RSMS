package org.itcen.domain.qna.service;

import org.itcen.domain.qna.dto.QnaCommentDto;

import java.util.List;

public interface QnaCommentService {
    List<QnaCommentDto> getComments(Long qnaId);
}


