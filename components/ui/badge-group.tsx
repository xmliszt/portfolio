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
          className='border-border rounded-full px-1.5 py-0.5 text-[10px] font-normal transition-transform select-none hover:scale-105'
          variant='secondary'
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
