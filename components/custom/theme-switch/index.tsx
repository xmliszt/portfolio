import { DuneLightDarkThemeToggle } from './dune-light-dark-theme-toggle';

type ThemeSwitchProps = {
  showRing?: boolean;
};

export function ThemeSwitch(props: ThemeSwitchProps) {
  return (
    <DuneLightDarkThemeToggle showRing={props.showRing} sizeInPixels={48} />
  );
}
