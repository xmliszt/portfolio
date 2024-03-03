import { cn } from '@/lib/utils';

type GradientBlurProps = {
  placement: 'top' | 'bottom' | 'left' | 'right';
  position: 'absolute' | 'fixed' | 'sticky';
};

export function GradientBlur(props: GradientBlurProps) {
  return (
    <div
      className={cn(
        'pointer-events-none z-50 backdrop-blur-md',
        props.position,
        (() => {
          switch (props.placement) {
            case 'top':
              return 'top-0 h-28  w-full [mask:linear-gradient(black_20%,transparent_80%)]';
            case 'bottom':
              return 'bottom-0 h-28 w-full [mask:linear-gradient(transparent_20%,black_80%)]';
            case 'left':
              return 'left-0 h-full w-28 [mask:linear-gradient(to_right,black_20%,transparent_80%)]';
            case 'right':
              return 'right-0 h-full w-28 [mask:linear-gradient(to_left,black_20%,transparent_80%)]';
          }
        })()
      )}
    ></div>
  );
}
