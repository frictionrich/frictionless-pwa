import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tint-5 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-h1 font-semibold mb-6 text-neutral-black">
          Frictionless
        </h1>
        <p className="text-h3 mb-8 text-neutral-dark-grey">
          Startup Funding, Reimagined
        </p>
        <p className="text-body-1 mb-12 text-neutral-grey max-w-2xl mx-auto">
          Instant Alignment for Founders and Investors. Matched. Measured. Monitored.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/auth/signup?role=startup" className="btn btn-primary btn-normal">
            I'm a Startup
          </Link>
          <Link href="/auth/signup?role=investor" className="btn btn-secondary btn-normal">
            I'm an Investor
          </Link>
        </div>
      </div>
    </main>
  );
}
