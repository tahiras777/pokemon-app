"use client";
import Image from "next/image";
import { getPokemonList } from "@/api";
import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PokemonGrid } from "@/components/pokemon-grid";
import { useIntersectionObserver } from "./hooks/useInfiniteScroll";
export default function Home() {
  const ref = useRef(null);
  const isBottomVisible = useIntersectionObserver(
    ref,
    {
      threshold: 0,
    },
    false
  );

  const {
    isLoading,
    error,
    data: pageData,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["fetch-all-pokemon"],
    queryFn: ({ pageParam = 0 }) => getPokemonList(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) {
        return undefined; // No more pages to fetch
      }
      const url = new URL(lastPage.next);
      const nextPageOffset = url.searchParams.get("offset");
      return nextPageOffset ? parseInt(nextPageOffset) : undefined;
    },
  });

  // Extracting results from pages
  const pokemonList = pageData?.pages.flatMap((page) => page.results) || [];

  useEffect(() => {
    if (isBottomVisible && hasNextPage) {
      fetchNextPage();
    }
  }, [isBottomVisible, fetchNextPage, hasNextPage]);

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error.message}</div>
      ) : (
        <PokemonGrid pokemonList={pokemonList} />
      )}
      <div ref={ref} style={{ width: "100%", height: "50px" }}></div>
    </div>
  );
}
