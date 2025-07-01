package org.itcen.domain.common.entity;

import java.io.Serializable;
import java.util.Objects;

/**
 * CommonCode 복합키 클래스.
 * groupCode, code 두 컬럼을 복합키로 사용.
 * SOLID 원칙 중 단일 책임 원칙을 지키기 위해 별도 클래스로 분리.
 */
public class CommonCodeId implements Serializable {
    private String groupCode;
    private String code;

    public CommonCodeId() {}

    public CommonCodeId(String groupCode, String code) {
        this.groupCode = groupCode;
        this.code = code;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CommonCodeId)) return false;
        CommonCodeId that = (CommonCodeId) o;
        return Objects.equals(groupCode, that.groupCode) && Objects.equals(code, that.code);
    }

    @Override
    public int hashCode() {
        return Objects.hash(groupCode, code);
    }
}
