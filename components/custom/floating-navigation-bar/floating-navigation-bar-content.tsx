type FloatingNavigationBarContentProps = {
  children: React.ReactNode;
};

export function FloatingNavigationBarContent(
  props: FloatingNavigationBarContentProps
) {
  return <nav className='flex flex-col gap-2 p-3'>{props.children}</nav>;
}
