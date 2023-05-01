import SearchField from "./SearchField";

export default function Page() {
  return (
    <>
      <main className="h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
          <div className="mx-auto max-w-3xl flex items-center justify-center h-full">
            <div className="flex flex-col items-center space-y-4">
              <div>
                <label
                  htmlFor="search"
                  className=" block font-extrabold text-transparent text-4xl bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500"
                >
                  Find a movie
                </label>
              </div>

              <SearchField />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
