"use client";
import { useCallback, useEffect, useState } from "react";
import SearchField from "./SearchField";
import { Movie, User } from "../types";
import LoadingSkeleton from "./LoadingSkeleton";
import MovieCard from "./MovieCard";
import UserSelect from "./UserSelect";

const headers = {
  "Content-Type": "application/json",
};

const users: User[] = [
  { id: 0, label: "Default" },
  { id: 1, label: "Japanese" },
  { id: 2, label: "Marvel fan" },
  { id: 3, label: "Drama fan" },
  { id: 4, label: "Disney fan" },
];

export default function MovieResult() {
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [query, setQuery] = useState<string>("");
  const [movies, setMovies] = useState<Movie[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [starred, setStarred] = useState<Record<number, boolean>>({});
  const [selectedUser, setSelectedUser] = useState(users[0]);

  const getMovies = useCallback(
    async (page: number, user_id: number) => {
      const res = await fetch("http://localhost:3000/search", {
        method: "POST",
        body: JSON.stringify({
          query: query,
          page: page,
          user_id,
        }),
        headers,
      });

      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }

      return res.json();
    },
    [query]
  );

  const getStarred = useCallback(
    async (user_id: number) =>
      Object.fromEntries(
        (
          (await fetch("http://localhost:3000/get_stars", {
            method: "POST",
            body: JSON.stringify({
              user_id,
            }),
            headers,
          }).then((r) => r.json())) as number[]
        ).map((v) => [v, true])
      ),
    []
  );

  const starMovie = async (id: number, user_id: number) => {
    const res: number[] = await fetch("http://localhost:3000/log_star", {
      method: "POST",
      headers,
      body: JSON.stringify({
        movie: id,
        value: !starred[id],
        user_id,
      }),
    }).then((r) => r.json());

    console.log(res);
    setStarred(Object.fromEntries(res.map((v) => [v, true])));
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
  };

  useEffect(() => {
    (async () => setStarred(await getStarred(selectedUser.id)))();
  }, [setStarred, selectedUser.id, getStarred]);

  useEffect(() => {
    if (query === "") {
      setMovies(undefined);
      return;
    }

    setLoading(true);

    (async () => {
      setMovies((await getMovies(pageIndex, selectedUser.id)).hits.hits);
      setLoading(false);
    })();
  }, [pageIndex, query, setLoading, getMovies, selectedUser.id]);

  return (
    <div className="divide-y space-y-5">
      <div className="flex justify-between">
        <SearchField query={query} setQuery={setQuery} />
        <div className="flex-1" />
        <UserSelect
          users={users}
          selected={selectedUser}
          onSelect={handleSelectUser}
        />
      </div>
      <div>
        {loading
          ? [...Array(5)].map((e, i) => <LoadingSkeleton key={i} />)
          : movies && (
              <>
                {movies.map((m: Movie, idx: number) => (
                  <MovieCard
                    key={m._id}
                    movie={m}
                    rank={pageIndex * 10 + idx + 1}
                    starred={starred[parseInt(m._id)]}
                    starMovie={() => starMovie(m._id as any as number, selectedUser.id)}
                  />
                ))}
                <nav
                  className="flex items-center justify-between border-t border-gray-200 bg-white px-4 pt-3 sm:px-6 mt-5"
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
                        onClick={() => setPageIndex(pageIndex - 1)}
                        type="button"
                        className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
                      >
                        Previous
                      </button>
                    )}
                    {movies.length === 10 && (
                      <button
                        onClick={() => setPageIndex(pageIndex + 1)}
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
      </div>
    </div>
  );
}
