import { LoginButton } from "@/components/LoginButton";

export default function NotEligiblePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
          Login ditolak
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-950">
          Akun X kamu belum memenuhi syarat minimum usia akun 1 bulan.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Gunakan akun X lain yang sudah memenuhi batas usia minimum.
        </p>
        <div className="mt-6">
          <LoginButton />
        </div>
      </section>
    </main>
  );
}
