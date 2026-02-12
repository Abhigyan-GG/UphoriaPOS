import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("text-center", className)}>
      <h1 className="font-headline text-2xl font-bold text-primary">
        Guns
      </h1>
      <span className="text-sm tracking-[0.4em] text-accent font-semibold">AND</span>
      <h1 className="font-headline text-2xl font-bold text-primary">
        Gulab
      </h1>
    </div>
  );
}
