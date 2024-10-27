import { Badge } from './badge';

type BadgeGroupProps = {
  tags: string[];
};

export function BadgeGroup({ tags }: BadgeGroupProps) {
  return (
    <div className='my-2 flex flex-row flex-wrap gap-2'>
      {tags.map((tag) => (
        <Badge
          key={tag}
          className='rounded-full border-border px-1.5 py-0.5 text-[10px] font-normal transition-transform  hover:scale-105'
          variant='secondary'
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
