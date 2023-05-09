"use client";

import { Movie } from "../types";
import { StarIcon } from "@heroicons/react/24/solid";

export default function MovieCard({
  movie,
  starred,
  rank,
  starMovie,
}: {
  movie: Movie;
  starred: boolean;
  rank: number;
  starMovie: (id: number) => void;
}) {
  return (
    <div
      key={movie._source.title}
      className="bg-indigo-50 border rounded-xl flex flex-col mt-4 p-3 "
    >
      <div className="text-lg font-bold flex items-center">
        <StarIcon
          onClick={() => starMovie(parseInt(movie._id))}
          className={`h-5 w-5 inline cursor-pointer mr-2 ${
            starred ? "text-yellow-400" : "text-gray-400"
          }`}
        />
        {rank + "."} {movie._source.title}
      </div>
      <div>
        <p className="font-semibold">Overview</p>
        <div className="text-sm">{movie._source.overview}</div>
      </div>
      <div>
        <p className="font-semibold">Keywords</p>
        {movie._source.keywords.map((keyword: string) => {
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
}
