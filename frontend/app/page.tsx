import MovieResult from "./MovieResult";

export default function Page() {
  return (
    <>
      <main className="h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">
          <MovieResult />
        </div>
      </main>
    </>
  );
}
