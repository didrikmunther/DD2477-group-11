import SearchField from "../SearchField";

async function getMovies(query: string) {
  const res = await fetch("http://localhost:3000/search", {
    method: "POST",
    body: JSON.stringify({
      query: decodeURIComponent(query),
      page: 0,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function Page({ params }: { params: { query: string } }) {
  const movies = await getMovies(params.query);
  if (movies)
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">
        <div>
          <SearchField />
        </div>
        {movies.hits.hits.map((m: any) => {
          return (
            <div
              key={m._source.title}
              className="bg-indigo-50 border rounded-xl flex flex-col mt-4 p-3 "
            >
              <div className="text-lg font-bold">{m._source.title}</div>
              <div>
                <p className="font-semibold">Overview</p>
                <div className="text-sm">{m._source.overview}</div>
              </div>

              <div>
                <p className="font-semibold">Keywords</p>
                {m._source.keywords.map((keyword: string) => {
                  return (
                    <span
                      className="inline-flex mr-1 items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
                      key={keyword}
                    >
                      {keyword}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  else return <></>;
}
