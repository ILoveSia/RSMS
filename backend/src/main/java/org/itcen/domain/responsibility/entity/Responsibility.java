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

    @OneToMany(mappedBy = "responsibility", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ResponsibilityDetail> details = new ArrayList<>();

    public void addDetail(ResponsibilityDetail detail) {
        details.add(detail);
        detail.setResponsibility(this);
    }
} 