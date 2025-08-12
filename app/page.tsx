import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: countries } = await supabase.from("countries").select();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-bold mb-4">AURA - Super Portfolio</h1>
      <p className="mb-8">Testing Supabase Connection:</p>
      <pre className="p-4 bg-gray-800 rounded-md text-white overflow-auto max-w-full">
        {JSON.stringify(countries, null, 2)}
      </pre>
    </main>
  );
}
