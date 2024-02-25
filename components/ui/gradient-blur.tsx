import { cn } from '@/lib/utils';

type GradientBlurProps = {
  placement: 'top' | 'bottom';
};

export function GradientBlur(props: GradientBlurProps) {
  return (
    <div
      className={cn(
        'w-full h-16 backdrop-blur-md fixed z-50',
        props.placement === 'top'
          ? 'top-0 [mask:linear-gradient(black_20%,transparent_80%)]'
          : 'bottom-0 [mask:linear-gradient(transparent_20%,black_80%)]'
      )}
    ></div>
  );
}
