"use client";
import { useEffect, useState } from "react";
import SearchField from "./SearchField";
import { Movie } from "../types";
import LoadingSkeleton from "./LoadingSkeleton";

import { StarIcon } from "@heroicons/react/24/solid";

const headers = {
  "Content-Type": "application/json",
};

export default function MovieResult() {
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [query, setQuery] = useState<string>("");
  const [movies, setMovies] = useState<Movie[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [starred, setStarred] = useState<Record<number, boolean>>({});

  const getMovies = async (page: number) => {
    const res = await fetch("http://localhost:3000/search", {
      method: "POST",
      body: JSON.stringify({
        query: query,
        page: page,
      }),
      headers,
    });

    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }

    setMovies((await res.json()).hits.hits);
    setPageIndex(page);
  };

  const getStarred = async () =>
    Object.fromEntries(
      (
        (await fetch("http://localhost:3000/get_stars", {
          method: "GET",
          headers,
        }).then((r) => r.json())) as number[]
      ).map((v) => [v, true])
    );

  const starMovie = async (id: number) => {
    const res: number[] = await fetch("http://localhost:3000/log_star", {
      method: "POST",
      headers,
      body: JSON.stringify({
        movie: id,
        value: !starred[id],
      }),
    }).then((r) => r.json());

    console.log(res);
    setStarred(Object.fromEntries(res.map((v) => [v, true])));
  };

  useEffect(() => {
    (async () => setStarred(await getStarred()))();
  }, [setStarred]);

  useEffect(() => {
    if (query === "") {
      setMovies(undefined);
      return;
    }

    setLoading(true);

    (async () => {
      await getMovies(0);
      setLoading(false);
    })();
  }, [query, setLoading]);

  return (
    <>
      <SearchField query={query} setQuery={setQuery} />
      {loading
        ? [...Array(5)].map((e, i) => <LoadingSkeleton key={i} />)
        : movies && (
            <>
              {movies.map((m: Movie, idx: number) => {
                return (
                  <div
                    key={m._source.title}
                    className="bg-indigo-50 border rounded-xl flex flex-col mt-4 p-3 "
                  >
                    <div className="text-lg font-bold">
                      <StarIcon
                        onClick={() => starMovie(parseInt(m._id))}
                        className={`h-5 w-5 inline cursor-pointer ${
                          starred[parseInt(m._id)]
                            ? "text-yellow-400"
                            : "text-gray-400"
                        }`}
                      />
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
                    Showing page{" "}
                    <span className="font-medium">{pageIndex}</span>
                  </p>
                </div>
                <div className="flex flex-1 justify-between sm:justify-end">
                  {pageIndex > 0 && (
                    <button
                      onClick={() => getMovies(pageIndex - 1)}
                      type="button"
                      className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
                    >
                      Previous
                    </button>
                  )}
                  {movies.length === 10 && (
                    <button
                      onClick={() => getMovies(pageIndex + 1)}
                      type="button"
                      className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
                    >
                      Next
                    </button>
                  )}
                </div>
              </nav>
            </>
          )}
    </>
  );
}