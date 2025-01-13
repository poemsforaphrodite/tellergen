import Link from 'next/link';
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePageContent() {
  // Remove the unused isLoggedIn state
  const router = useRouter();

  const checkLoginStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      if (!data.isLoggedIn) {
        router.push('/login'); // Redirect to login if not logged in
      }
    } catch (error) {
      console.error("Error checking login status:", error);
    }
  }, [router]);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  return (
    <div>
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-white text-2xl font-bold">Your App Name</h1>
          <Link href="/home" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Home
          </Link>
        </div>
      </nav>
      {/* Rest of your home page content */}
      <main className="container mx-auto mt-8">
        <h2 className="text-3xl font-bold mb-4">Welcome to Your App</h2>
        {/* Add more content here */}
      </main>
    </div>
  );
}
