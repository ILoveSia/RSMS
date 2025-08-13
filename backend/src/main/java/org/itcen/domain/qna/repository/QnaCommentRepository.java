package org.itcen.domain.qna.repository;

import org.itcen.domain.qna.entity.QnaComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QnaCommentRepository extends JpaRepository<QnaComment, Long> {

    @Query("select c from QnaComment c where c.qna.id = :qnaId order by c.id asc")
    List<QnaComment> findAllByQnaIdOrderByIdAsc(@Param("qnaId") Long qnaId);
}


