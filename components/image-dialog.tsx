import Image from 'next/image';

import { HoverPerspectiveContainer } from './custom/hover-perspective-container';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';

type ImageDialogProps = {
  src: string;
  alt: string;
};

export function ImageDialog(props: ImageDialogProps) {
  return (
    <Dialog>
      <DialogTrigger>
        <HoverPerspectiveContainer className='row-span-1 h-fit max-w-[240px] shrink-0 grow'>
          <Image
            src={props.src}
            alt={props.alt}
            width={200}
            height={300}
            className='m-0 h-auto w-full rounded-lg object-cover'
          />
        </HoverPerspectiveContainer>
      </DialogTrigger>
      <DialogContent className='z-[999] p-12'>
        <Image
          src={props.src}
          alt={props.alt}
          width={200}
          height={300}
          className='m-0 h-auto w-full rounded-lg object-cover'
        />
      </DialogContent>
    </Dialog>
  );
}
