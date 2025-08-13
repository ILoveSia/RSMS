/**
 * 직책 검색 박스 컴포넌트
 * - 팝업을 통해 직책을 검색/선택
 * - 읽기전용 입력 + 검색/초기화 버튼
 */
import { positionApi, type PositionSearchRequest, type PositionSearchResult } from '@/domains/ledgermngt/api/positionApi';
import TextField from '@/shared/components/ui/data-display/TextField';
import IconButton from '@mui/material/IconButton';
import { PositionSearchPopup } from '@/domains/common/components';
import type { SxProps, Theme } from '@mui/material';
import Box from '@mui/material/Box';
import React, { useCallback, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';


export interface PositionSearchBoxProps {
	/** 선택된 직책 정보 */
	value?: PositionSearchResult | null;
	/** 값 변경 핸들러 */
	onChange: (value: PositionSearchResult | null) => void;
	/** 컴포넌트 크기 */
	size?: 'small' | 'medium';
	/** 커스텀 스타일 */
	sx?: SxProps<Theme>;
	/** 플레이스홀더 텍스트 */
	placeholder?: string;
	/** 비활성화 여부 */
	disabled?: boolean;
	/** 에러 상태 */
	error?: boolean;
	/** 도움말 텍스트 */
	helperText?: string;
	/** 최소 너비 */
	minWidth?: number | string;
	/** 최대 너비 */
	maxWidth?: number | string;
	/** 초기 검색 조건 */
	initialSearchParams?: PositionSearchRequest;
	/** 에러 발생 콜백 */
	searchParams?: PositionSearchRequest;
	onError?: (error: string) => void;
}

const PositionSearchBox: React.FC<PositionSearchBoxProps> = ({
	value = null,
	onChange,
	size = 'small',
	sx,
	placeholder = '직책을 선택하세요',
	disabled = false,
	error = false,
	helperText,
	minWidth = 200,
	maxWidth = 300,
	searchParams,
	initialSearchParams,
	onError,
}) => {
	const [positionSearchPopupOpen, setPositionSearchPopupOpen] = useState<boolean>(false);

	const handleSearch = useCallback(() => {
		setPositionSearchPopupOpen(true);
	}, []);

	// 직책 선택 핸들러
	const handleSelect = useCallback((position: PositionSearchResult) => {
		onChange(position);
		setPositionSearchPopupOpen(false);
	}, [onChange]);

	// 직책 선택 해제 핸들러
	const handleClear = useCallback(() => {
		onChange(null);
	}, [onChange]);

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...sx }}>
			<TextField
				label=""
				mode='editable'
				value={value?.positionsNm || ''}
				size={size}
				disabled={disabled}
				placeholder={placeholder}
				error={error}
				helperText={helperText}
				sx={{ minWidth, maxWidth }}
				InputProps={{
					readOnly: true,
					endAdornment: (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							{value && (
								<IconButton size="small" onClick={handleClear} disabled={disabled}>
									×
								</IconButton>
							)}
						<IconButton size="small" onClick={handleSearch} disabled={disabled}>
								<SearchIcon />
							</IconButton>
						</Box>
					),
				}}
			/>
			<PositionSearchPopup
				open={positionSearchPopupOpen}
				onClose={() => setPositionSearchPopupOpen(false)}
				onSelect={handleSelect}
			/>
		</Box>
	);
};

export default PositionSearchBox;


