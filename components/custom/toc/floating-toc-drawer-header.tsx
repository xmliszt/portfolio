type FloatingTOCDrawerHeaderProps = {
  children: React.ReactNode;
};

export function FloatingTOCDrawerHeader(props: FloatingTOCDrawerHeaderProps) {
  return (
    <div className="absolute top-3 right-4 left-4 z-10 grid grid-cols-[1fr_auto_1fr] pt-3">
      {props.children}
    </div>
  );
}
