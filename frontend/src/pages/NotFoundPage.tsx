import { Logo } from "../components/brand/Logo";
import { Button } from "../components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="relative grid min-h-screen place-items-center px-5">
      <div className="absolute inset-0 soft-grid [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000,transparent)]" />
      <div className="relative text-center">
        <Logo className="mb-10" />
        <p className="font-mono text-[13px] text-paper-faint">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em]">This page doesn't exist.</h1>
        <p className="mt-3 text-paper-muted">The link may be old, or the address has a typo.</p>
        <div className="mt-8 flex justify-center gap-2">
          <Button to="/" variant="secondary">
            Back to home
          </Button>
          <Button to="/app">Open dashboard</Button>
        </div>
      </div>
    </div>
  );
}
