package org.itcen.domain.employee.entity;

import org.itcen.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 직원 엔티티
 * 직원 정보를 관리하는 엔티티
 */
@Entity
@Table(name = "employee")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Employee extends BaseTimeEntity {

    @Id
    @Column(name = "emp_no", length = 20)
    private String empNo;           // 사번 (Primary Key)

    @Column(name = "emp_name", length = 50, nullable = false)
    private String empName;         // 성명

    @Column(name = "dept_code", length = 20)
    private String deptCode;        // 부서코드

    @Column(name = "dept_name", length = 100)
    private String deptName;        // 부서명

    @Column(name = "position_code", length = 20)
    private String positionCode;    // 직급코드

    @Column(name = "position_name", length = 50)
    private String positionName;    // 직급명

    @Column(name = "email", length = 100)
    private String email;           // 이메일

    @Column(name = "phone_no", length = 20)
    private String phoneNo;         // 전화번호

    @Column(name = "use_yn", length = 1, nullable = false)
    private String useYn;           // 사용여부

    @Builder
    public Employee(String empNo, String empName, String deptCode, String deptName,
                   String positionCode, String positionName, String email, 
                   String phoneNo, String useYn) {
        this.empNo = empNo;
        this.empName = empName;
        this.deptCode = deptCode;
        this.deptName = deptName;
        this.positionCode = positionCode;
        this.positionName = positionName;
        this.email = email;
        this.phoneNo = phoneNo;
        this.useYn = useYn != null ? useYn : "Y";
    }

    /**
     * 사용 가능한 직원인지 확인
     */
    public boolean isUsable() {
        return "Y".equals(this.useYn);
    }
}