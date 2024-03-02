import * as runtime from 'react/jsx-runtime';
import Image from 'next/image';

import { HoverPerspectiveContainer } from './custom/hover-perspective-container';
import { CustomLink } from './ui/custom-link';
import { BadgeGroup } from './badge-group';
import { WavingAvatar } from './waving-avatar';

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
        img: (props: any) => (
          <HoverPerspectiveContainer>
            <Image
              className='rounded-lg shadow-lg'
              layout='responsive'
              src={props.src}
              alt={props.alt}
              width={300}
              height={300}
              unoptimized
              {...props}
            />
          </HoverPerspectiveContainer>
        ),
        a: (props: any) => (
          <CustomLink href={props.href} {...props}>
            {props.children}
          </CustomLink>
        ),
        WavingAvatar,
        BadgeGroup,
      }}
    />
  );
}
