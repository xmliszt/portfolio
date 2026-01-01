type ChangelogsLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    app_id: string;
  }>;
};

export default async function ChangelogsLayout(props: ChangelogsLayoutProps) {
  return (
    <div className="flex flex-col items-start gap-6">{props.children}</div>
  );
}
