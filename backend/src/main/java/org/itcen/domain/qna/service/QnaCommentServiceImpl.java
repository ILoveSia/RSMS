package org.itcen.domain.qna.service;

import lombok.RequiredArgsConstructor;
import org.itcen.domain.qna.dto.QnaCommentDto;
import org.itcen.domain.qna.dto.QnaCommentCreateRequest;
import org.itcen.domain.qna.entity.QnaComment;
import org.itcen.domain.qna.entity.Qna;
import org.itcen.domain.qna.repository.QnaCommentRepository;
import org.itcen.domain.qna.repository.QnaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QnaCommentServiceImpl implements QnaCommentService {

    private final QnaCommentRepository qnaCommentRepository;
    private final QnaRepository qnaRepository;

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

    @Override
    public Long addComment(Long qnaId, QnaCommentCreateRequest req, String userId) {
        Qna qna = qnaRepository.findById(qnaId)
                .orElseThrow(() -> new IllegalArgumentException("QnA not found: " + qnaId));

        QnaComment parent = null;
        if (req.getParentId() != null) {
            parent = qnaCommentRepository.findById(req.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent comment not found: " + req.getParentId()));
        }

        QnaComment comment = QnaComment.builder()
                .qna(qna)
                .parent(parent)
                .content(req.getContent())
                .isDeleted(false)
                .build();
        comment.setCreatedId(userId);
        comment.setUpdatedId(userId);
        QnaComment saved = qnaCommentRepository.save(comment);
        return saved.getId();
    }
}


