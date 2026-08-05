import { PageHeaderSkeleton, StatGridSkeleton, TableSkeleton } from "@/components/admin/skeletons";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton />
      <StatGridSkeleton count={4} />
      <StatGridSkeleton count={4} />
      <TableSkeleton rows={5} cols={4} />
    </div>
  );
}
