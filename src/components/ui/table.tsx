import { cn } from '@/lib/utils';

/** Minimal responsive table primitives for admin/data views. */
export function DataTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-border bg-muted/50 text-left text-muted-foreground">
      {children}
    </thead>
  );
}

export function TH({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <th className={cn('whitespace-nowrap px-4 py-3 font-medium', className)}>{children}</th>;
}

export function TR({ children }: { children: React.ReactNode }) {
  return <tr className="border-b border-border last:border-0">{children}</tr>;
}

export function TD({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <td className={cn('whitespace-nowrap px-4 py-3', className)}>{children}</td>;
}
