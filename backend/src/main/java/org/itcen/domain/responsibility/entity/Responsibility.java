package org.itcen.domain.responsibility.entity;

import jakarta.persistence.*;
import lombok.*;
import org.itcen.common.entity.BaseTimeEntity;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "responsibility")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Responsibility extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "responsibility_id")
    private Long id;

    @Column(name = "responsibility_content", columnDefinition = "TEXT")
    private String responsibilityContent;

    @Column(name = "ledger_order")
    private Long ledgerOrder; // 원장차수 ID (신규 등록시 사용)

    @OneToMany(mappedBy = "responsibility", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ResponsibilityDetail> details = new ArrayList<>();

    public void addDetail(ResponsibilityDetail detail) {
        details.add(detail);
        detail.setResponsibility(this);
    }

}