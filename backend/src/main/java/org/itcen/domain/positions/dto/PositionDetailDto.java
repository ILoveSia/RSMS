package org.itcen.domain.positions.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionDetailDto {

    private Long positionsId;
    private String positionName;
    private String writeDeptCd;
    private List<OwnerDeptInfo> ownerDepts;
    private List<MeetingInfo> meetings;
    private List<ManagerInfo> managers;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OwnerDeptInfo {
        private String deptCode;
        private String deptName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MeetingInfo {
        private String meetingBodyId;
        private String meetingBodyName;
        private String memberGubun;
        private String meetingPeriod;
        private String deliberationContent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ManagerInfo {
        private String empNo;
        private String empName;
        private String position;
    }
}
