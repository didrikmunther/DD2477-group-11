"use client";

import { KeyboardEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useParams } from "next/navigation";

type SearchFieldProps = {
  query: string;
  setQuery: (v: string) => void;
};

export default function SearchField({ query, setQuery }: SearchFieldProps) {
  const [value, setValue] = useState<string>(query);

  const handleOnKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      setQuery(value);
    }
  };
  return (
    <>
      <div className="relative mt-2 rounded-md shadow-sm flex-1 w-96">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </div>
        <input
          type="text"
          name="search"
          id="search"
          className="block w-full rounded-2xl border-0 py-4 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm  sm:leading-6"
          placeholder="The Godfather Part 2"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleOnKeyDown}
        />
      </div>
    </>
  );
}
