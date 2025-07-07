import { Check as CheckIcon, Warning as WarningIcon } from '@mui/icons-material';
import {
  Stepper as MuiStepper,
  Step,
  StepContent,
  StepLabel,
  Typography,
  styled,
  useTheme,
} from '@mui/material';
import { forwardRef } from 'react';
import { StepItem, StepperProps } from './types';

// 커스텀 StepIcon 컴포넌트
const CustomStepIcon = styled('div')<{
  ownerState: {
    completed?: boolean;
    error?: boolean;
    active?: boolean;
  };
}>(({ theme, ownerState }) => ({
  backgroundColor: ownerState.error
    ? theme.palette.error.main
    : ownerState.completed || ownerState.active
    ? theme.palette.primary.main
    : theme.palette.grey[300],
  color: '#fff',
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '1rem',
  fontWeight: 600,
  ...(ownerState.active &&
    !ownerState.completed && {
      boxShadow: theme.shadows[3],
    }),
}));

/**
 * Stepper 컴포넌트
 *
 * Material-UI Stepper를 기반으로 한 스테퍼 컴포넌트
 * 여러 단계의 프로세스를 시각적으로 표현
 *
 * @example
 * ```tsx
 * const steps = [
 *   {
 *     id: 'step1',
 *     label: '기본 정보 입력',
 *     description: '사용자의 기본 정보를 입력합니다.',
 *     completed: true
 *   },
 *   {
 *     id: 'step2',
 *     label: '상세 정보 입력',
 *     description: '추가 정보를 입력합니다.'
 *   },
 *   {
 *     id: 'step3',
 *     label: '확인',
 *     description: '입력된 정보를 확인합니다.',
 *     optional: true,
 *     optionalLabel: '선택사항'
 *   }
 * ];
 *
 * <Stepper
 *   steps={steps}
 *   activeStep={1}
 *   onStepClick={handleStepClick}
 * />
 *
 * // 세로 방향 스테퍼
 * <Stepper
 *   steps={steps}
 *   activeStep={1}
 *   orientation="vertical"
 * />
 * ```
 */
const Stepper = forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      steps,
      activeStep,
      orientation = 'horizontal',
      alternativeLabel = false,
      nonLinear = false,
      connector,
      onStepClick,
      completed = false,
      error = false,
      className,
      sx,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();

    // 스텝 아이콘 렌더링
    const renderStepIcon = (step: StepItem, stepIndex: number) => {
      const isActive = activeStep === stepIndex;
      const isCompleted = step.completed || stepIndex < activeStep;
      const hasError = step.error || (error && stepIndex === activeStep);

      if (step.icon) {
        return step.icon;
      }

      return (
        <CustomStepIcon
          ownerState={{
            completed: isCompleted,
            error: hasError,
            active: isActive,
          }}
        >
          {hasError ? (
            <WarningIcon fontSize='small' />
          ) : isCompleted ? (
            <CheckIcon fontSize='small' />
          ) : (
            stepIndex + 1
          )}
        </CustomStepIcon>
      );
    };

    // 스텝 라벨 렌더링
    const renderStepLabel = (step: StepItem, stepIndex: number) => {
      const isActive = activeStep === stepIndex;
      const hasError = step.error || (error && stepIndex === activeStep);

      return (
        <StepLabel
          optional={
            step.optional ? (
              <Typography variant='caption' color='text.secondary'>
                {step.optionalLabel || '선택사항'}
              </Typography>
            ) : null
          }
          error={hasError}
          StepIconComponent={() => renderStepIcon(step, stepIndex)}
        >
          <Typography
            variant={isActive ? 'subtitle1' : 'body2'}
            color={hasError ? 'error' : isActive ? 'primary' : 'text.secondary'}
            sx={{ fontWeight: isActive ? 600 : 400 }}
          >
            {step.label}
          </Typography>
        </StepLabel>
      );
    };

    // 스텝 클릭 핸들러
    const handleStepClick = (stepIndex: number) => {
      if (onStepClick && (nonLinear || stepIndex <= activeStep)) {
        onStepClick(stepIndex);
      }
    };

    return (
      <MuiStepper
        ref={ref}
        activeStep={activeStep}
        orientation={orientation}
        alternativeLabel={alternativeLabel}
        nonLinear={nonLinear}
        connector={connector}
        className={className}
        sx={{
          '& .MuiStepLabel-root': {
            cursor: nonLinear || onStepClick ? 'pointer' : 'default',
          },
          '& .MuiStepLabel-label': {
            fontSize: '0.875rem',
          },
          '& .MuiStepConnector-line': {
            borderColor: theme.palette.grey[300],
            borderTopWidth: 2,
          },
          '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
            borderColor: theme.palette.primary.main,
          },
          '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
            borderColor: theme.palette.primary.main,
          },
          ...sx,
        }}
        {...props}
      >
        {steps.map((step, index) => (
          <Step
            key={step.id}
            completed={step.completed || index < activeStep}
            disabled={step.disabled}
            onClick={() => handleStepClick(index)}
          >
            {renderStepLabel(step, index)}
            {orientation === 'vertical' && step.description && (
              <StepContent>
                <Typography variant='body2' color='text.secondary'>
                  {step.description}
                </Typography>
              </StepContent>
            )}
          </Step>
        ))}
      </MuiStepper>
    );
  }
);

Stepper.displayName = 'Stepper';

export default Stepper;
