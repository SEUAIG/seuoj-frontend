import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "../ui/pagination";
import { setCurrent } from "@/features/ProblemList/problemListSlice";
export default function ProblemListPageChoose({
  pages,
  current,
  dispatch,
  refetch,
}) {
  const currentPage = Number(current);
  const handlePageChange = (newPage: number) => {
    dispatch(setCurrent(newPage));
    setTimeout(() => {
      refetch();
    }, 100);
  };
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages =8; 
    items.push(
      <PaginationItem key={1}>
        <PaginationLink
          onClick={() => handlePageChange(1)}
          isActive={currentPage === 1}
          className="cursor-pointer"
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pages - 1, startPage + maxVisiblePages - 1);
    if (endPage === pages - 1) {
      startPage = Math.max(2, endPage - maxVisiblePages + 1);
    }
    if (startPage > 2) {
      items.push(
        <PaginationItem key="start-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    if (endPage < pages - 1) {
      items.push(
        <PaginationItem key="end-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    if (pages > 1) {
      items.push(
        <PaginationItem key={pages}>
          <PaginationLink
            onClick={() => handlePageChange(pages)}
            isActive={currentPage === pages}
            className="cursor-pointer"
          >
            {pages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return items;
  };
  return (
    <div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => {
                if (currentPage > 1) {
                  handlePageChange(currentPage - 1);
                }
              }}
              className={
                currentPage <= 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
          {renderPaginationItems()}
          <PaginationItem>
            <PaginationNext
              onClick={() => {
                if (currentPage < pages) {
                  handlePageChange(currentPage + 1);
                }
              }}
              className={
                currentPage >= pages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
