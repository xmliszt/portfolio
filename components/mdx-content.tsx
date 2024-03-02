import * as runtime from 'react/jsx-runtime';
import Image from 'next/image';

import { CustomLink } from './ui/custom-link';

interface MdxProps {
  code: string;
  components?: Record<string, React.ComponentType>;
}

const useMDXComponent = (code: string) => {
  const fn = new Function(code);
  return fn({ ...runtime }).default;
};

export function MDXContent({ code, components }: MdxProps) {
  const Component = useMDXComponent(code);
  return (
    <Component
      components={{
        ...components,
        img: Image,
        a: (props: any) => (
          <CustomLink href={props.href} {...props}>
            {props.children}
          </CustomLink>
        ),
      }}
    />
  );
}
