package org.itcen.domain.responsibility.repository;

import org.itcen.domain.responsibility.entity.Responsibility;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResponsibilityRepository extends JpaRepository<Responsibility, Long> {
} 