'use client'

import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel, SortingState, getSortedRowModel } from '@tanstack/react-table'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { Skeleton } from '@/components/ui/skeleton'
import { GetPoolsQuery } from '@/lib/generated/graphql'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: GetPoolsQuery | undefined
  isLoading: boolean
  pageSize?: number
  currentPage?: number
  totalCount?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  onSortingChange?: (sorting: SortingState) => void
  sorting: SortingState
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  pageSize = 20,
  currentPage = 1,
  totalCount = 0,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
  sorting,
}: DataTableProps<TData, TValue>) {
  const poolsData = (data?.pools || []) as unknown as TData[]
  const [localSorting, setLocalSorting] = useState<SortingState>(sorting)

  useEffect(() => {
    setLocalSorting(sorting)
  }, [sorting])

  const handleSortingChange = (updatedSorting: SortingState | ((old: SortingState) => SortingState)) => {
    if (typeof updatedSorting === 'function') {
      const newSorting = updatedSorting(localSorting)
      setLocalSorting(newSorting)
      if (onSortingChange) {
        onSortingChange(newSorting)
      }
      return
    }
    if (!updatedSorting || !Array.isArray(updatedSorting)) {
      console.error('wrong updatedSorting:', updatedSorting)
      return
    }
  }

  const table = useReactTable<TData>({
    data: poolsData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    onSortingChange: handleSortingChange,
    pageCount: Math.ceil(totalCount / pageSize),
    state: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
      sorting: localSorting,
    },
    defaultColumn: {
      minSize: 60,
    },
  })

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="rounded-md border border-purple-300/30 bg-white/5 backdrop-blur-sm">
      <div className="relative w-full">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-t border-purple-300/30">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-purple-100 font-medium" style={{ width: header.column.getSize() }}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(pageSize)
                .fill(0)
                .map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    {table.getHeaderGroups()[0]?.headers.map((header) => (
                      <TableCell key={`loading-cell-${header.id}`} style={{ width: header.column.getSize() }}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="hover:cursor-pointer hover:bg-purple-900/20 transition-colors duration-200 border-b border-purple-300/20"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-purple-100" style={{ width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-purple-200">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && totalCount > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-purple-300/30">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange?.(1)}
              disabled={currentPage <= 1}
              className="text-purple-100 hover:bg-purple-900/20 hover:text-purple-50 w-8 h-8 p-0 rounded-full hover:cursor-pointer"
            >
              <ChevronsLeft />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className="text-purple-100 hover:bg-purple-900/20 hover:text-purple-50 w-8 h-8 p-0 rounded-full hover:cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm text-purple-200 px-2 bg-purple-900/20 rounded-md min-w-[80px] text-center py-1">
              {currentPage} / {totalPages}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="text-purple-100 hover:bg-purple-900/20 hover:text-purple-50 w-8 h-8 p-0 rounded-full hover:cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange?.(totalPages)}
              disabled={currentPage >= totalPages}
              className="text-purple-100 hover:bg-purple-900/20 hover:text-purple-50 w-8 h-8 p-0 rounded-full hover:cursor-pointer"
            >
              <ChevronsRight />
            </Button>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-100 hover:bg-purple-900/20 hover:text-purple-50 h-8 px-2 rounded-md flex items-center gap-1 hover:cursor-pointer focus-visible:ring-0"
                >
                  Show {pageSize}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white/1 backdrop-blur-md border border-purple-300/30 text-purple-100">
                {[10, 20, 30, 40, 50].map((size) => (
                  <DropdownMenuItem
                    key={size}
                    className={`focus:bg-indigo-900/10 focus:text-purple-50 cursor-pointer ${pageSize === size ? 'bg-white/20 font-medium' : ''}`}
                    onClick={() => onPageSizeChange?.(size)}
                  >
                    Show {size}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  )
}
