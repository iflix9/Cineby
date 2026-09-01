import Link from 'next/link';



export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-6xl font-bold text-red-600 mb-4">404</h2>
      <h3 className="text-2xl font-semibold mb-6">Page Not Found</h3>
      <Link href="/" className="px-6 py-3 bg-white text-black font-medium rounded-full">Return Home</Link>
    </div>
  );
}
