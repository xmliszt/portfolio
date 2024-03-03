import { cn } from '@/lib/utils';

type GradientBlurProps = {
  placement: 'top' | 'bottom';
};

export function GradientBlur(props: GradientBlurProps) {
  return (
    <div
      className={cn(
        'pointer-events-none fixed z-50 h-28 w-full backdrop-blur-md',
        props.placement === 'top'
          ? 'top-0 [mask:linear-gradient(black_20%,transparent_80%)]'
          : 'bottom-0 [mask:linear-gradient(transparent_20%,black_80%)]'
      )}
    ></div>
  );
}
