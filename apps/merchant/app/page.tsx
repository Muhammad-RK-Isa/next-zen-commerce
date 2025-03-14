import { siteConfig } from '~/config/site';

export default function Page() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center">
      <h1 className="bg-gradient-to-r from-rose-500 via-pink-500 to-blue-500 bg-clip-text font-bold font-mono text-2xl text-transparent tracking-tighter sm:text-6xl lg:text-7xl">
        {siteConfig.name}
      </h1>
    </div>
  );
}
