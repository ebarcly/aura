import LoginButton from "@/app/components/LoginButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">AURA</h1>
        <p className="text-xl text-gray-400 mb-8">
          Your AI-powered developer portfolio.
        </p>
        <LoginButton />
      </div>
    </main>
  );
}
