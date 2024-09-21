type FloatingNavigationBarContentProps = {
  children: React.ReactNode;
};

export function FloatingNavigationBarContent(
  props: FloatingNavigationBarContentProps
) {
  return <nav className='flex flex-col gap-1 p-3'>{props.children}</nav>;
}
