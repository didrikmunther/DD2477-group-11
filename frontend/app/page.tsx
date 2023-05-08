"use client";

import { useEffect, useState } from "react";
import SearchField from "./SearchField";

import { StarIcon } from "@heroicons/react/24/solid";

const headers = {
  "Content-Type": "application/json",
};

async function getMovies(query: string, pageIndex: number) {
  const res = await fetch("http://localhost:3000/search", {
    method: "POST",
    body: JSON.stringify({
      query: decodeURIComponent(query),
      page: pageIndex,
    }),
    headers,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

const getStarred = async () =>
  Object.fromEntries(
    (
      (await fetch("http://localhost:3000/get_stars", {
        method: "GET",
        headers,
      }).then((r) => r.json())) as number[]
    ).map((v) => [v, true])
  );

function MovieResult() {
  const [pageIndex] = useState<number>(0);
  const [query, setQuery] = useState<string>("");
  const [movies, setMovies] = useState(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [starred, setStarred] = useState<Record<number, boolean>>({});

  useEffect(() => {
    (async () => setStarred(await getStarred()))();
  }, [setStarred]);

  const starMovie = async (id: number) => {
    const res: number[] = await fetch("http://localhost:3000/log_star", {
      method: "POST",
      headers,
      body: JSON.stringify({
        movie: id,
        value: !starred[id]
      }),
    }).then((r) => r.json());

    console.log(res);
    setStarred(Object.fromEntries(res.map((v) => [v, true])));
  };

  useEffect(() => {
    if (query === "") {
      setMovies(undefined);
      return;
    }

    setLoading(true);

    (async () => {
      setMovies(await getMovies(query, pageIndex));
      setLoading(false);
    })();
  }, [pageIndex, query, setLoading]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">
      <div>
        <SearchField query={query} setQuery={setQuery} />
      </div>
      {loading ? (
        <>Loading ...</>
      ) : movies ? (
        <>
          {(movies as any).hits.hits.map((m: any, idx: number) => {
            return (
              <div
                key={m._source.title}
                className="bg-indigo-50 border rounded-xl flex flex-col mt-4 p-3 "
              >
                <div className="text-lg font-bold">
                  <StarIcon
                    onClick={() => starMovie(m._id)}
                    className={`h-5 w-5 inline cursor-pointer ${
                      starred[m._id as number]
                        ? "text-yellow-400"
                        : "text-gray-400"
                    }`}
                  />{" "}
                  {pageIndex * 10 + idx + 1 + "."} {m._source.title}
                </div>
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
          <nav
            className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-5"
            aria-label="Pagination"
          >
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{pageIndex}</span>
              </p>
            </div>
            <div className="flex flex-1 justify-between sm:justify-end">
              {pageIndex > 0 && (
                <div className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0">
                  Previous
                </div>
              )}
              {(movies as any).hits.hits.length === 10 && (
                <div className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0">
                  Next
                </div>
              )}
            </div>
          </nav>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <>
      <main className="h-screen">
        <MovieResult />
      </main>
    </>
  );
}
