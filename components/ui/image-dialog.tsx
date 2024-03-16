import Image from 'next/image';

import { Dialog, DialogContent, DialogTrigger } from './dialog';
import { HoverPerspectiveContainer } from './hover-perspective-container';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

type ImageDialogProps = {
  src: string;
  alt: string;
};

export function ImageDialog(props: ImageDialogProps) {
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger>
            <HoverPerspectiveContainer className='flex max-h-[160px] grow items-center'>
              <Image
                src={props.src}
                alt={props.alt}
                width={200}
                height={300}
                className='m-0 h-full w-full rounded-lg object-cover'
              />
            </HoverPerspectiveContainer>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Zoom in to the photo</TooltipContent>
      </Tooltip>
      <DialogContent className='z-[999] p-12'>
        <Image
          src={props.src}
          alt={props.alt}
          width={400}
          height={600}
          className='m-0 h-auto w-full rounded-lg object-cover'
          unoptimized
        />
      </DialogContent>
    </Dialog>
  );
}
