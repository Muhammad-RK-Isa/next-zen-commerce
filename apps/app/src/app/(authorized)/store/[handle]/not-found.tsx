import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex-1 space-y-4 text-center">
      <h1>This store does not exist</h1>
      <Link href="/">Go back home</Link>
    </div>
  );
}
