import { Metadata } from "next";
import SearchField from "../../SearchField";
import Link from "next/link";

async function getMovies(query: string, pageIndex: number) {
  const res = await fetch("http://localhost:3000/search", {
    method: "POST",
    body: JSON.stringify({
      query: decodeURIComponent(query),
      page: pageIndex,
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

export default async function Page({
  params,
}: {
  params: { query: string; pageIndex: string };
}) {
  const pageIndex = parseInt(params.pageIndex);
  const query = params.query;
  const movies = await getMovies(query, pageIndex);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">
      <div>
        <SearchField />
      </div>
      {movies.hits.hits.map((m: any, idx: number) => {
        return (
          <div
            key={m._source.title}
            className="bg-indigo-50 border rounded-xl flex flex-col mt-4 p-3 "
          >
            <div className="text-lg font-bold">
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
            <Link
              href={`/${params.query}/${pageIndex - 1}`}
              className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
            >
              Previous
            </Link>
          )}
          {movies.hits.hits.length === 10 && (
            <Link
              href={`/${params.query}/${pageIndex + 1}`}
              className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
            >
              Next
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { query: string; pageIndex: string };
}) {
  return {
    title: `${decodeURIComponent(params.query)} | Page ${params.pageIndex}`,
    description: `Showing page ${
      params.pageIndex
    } results for search ${decodeURIComponent(params.query)}`,
  } as Metadata;
}
