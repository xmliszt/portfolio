type FloatingNavigationBarHeaderProps = {
  children: React.ReactNode;
};

export function FloatingNavigationBarHeader(
  props: FloatingNavigationBarHeaderProps
) {
  return (
    <div className='absolute left-4 right-4 top-3 z-10 grid grid-cols-[1fr_auto_1fr] pt-3'>
      {props.children}
    </div>
  );
}
