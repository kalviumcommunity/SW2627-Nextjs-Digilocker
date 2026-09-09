import Link from "next/link";
import { login } from "../actions.js";

export default function Login() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Sign in to your vault</h1>
        <p className="mt-2 text-foreground/70">Use your DigiLocker credentials to continue.</p>
      </div>
      <form action={login} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Email</span>
          <input className="w-full rounded border border-black/15 px-3 py-2 dark:border-white/20" type="email" name="email" autoComplete="email" required />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Password</span>
          <input className="w-full rounded border border-black/15 px-3 py-2 dark:border-white/20" type="password" name="password" autoComplete="current-password" required minLength={8} />
        </label>
        <button className="w-full rounded bg-foreground px-4 py-2 font-medium text-background" type="submit">Sign in</button>
      </form>
      <p className="text-sm text-foreground/70">
        New to DigiLocker? <Link className="font-medium underline" href="/register">Create an account</Link>
      </p>
    </section>
  );
}