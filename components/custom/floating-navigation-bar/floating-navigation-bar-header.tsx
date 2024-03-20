type FloatingNavigationBarHeaderProps = {
  children: React.ReactNode;
};

export function FloatingNavigationBarHeader(
  props: FloatingNavigationBarHeaderProps
) {
  return (
    <div className='absolute left-4 right-4 top-3 z-10 flex flex-row items-center justify-between'>
      {props.children}
    </div>
  );
}
