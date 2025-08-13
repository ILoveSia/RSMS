package org.itcen.domain.qna.service;

import lombok.RequiredArgsConstructor;
import org.itcen.domain.qna.dto.QnaCommentDto;
import org.itcen.domain.qna.entity.QnaComment;
import org.itcen.domain.qna.repository.QnaCommentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QnaCommentServiceImpl implements QnaCommentService {

    private final QnaCommentRepository qnaCommentRepository;

    @Override
    public List<QnaCommentDto> getComments(Long qnaId) {
        List<QnaComment> list = qnaCommentRepository.findAllByQnaIdOrderByIdAsc(qnaId);
        return list.stream().map(c -> QnaCommentDto.of(
                c.getId(),
                c.getParent() == null ? null : c.getParent().getId(),
                c.getContent(),
                Boolean.TRUE.equals(c.getIsDeleted()),
                c.getCreatedId(),
                c.getCreatedAt()
        )).collect(Collectors.toList());
    }
}


