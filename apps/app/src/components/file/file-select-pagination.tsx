// "use client"

// import React from "react"

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@nzc/ui/components/select"
// import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
// import type { ListFilesMinimalFilterInput } from "~/lib/validators/file"
// import { Button } from "../ui/button"

// interface FileSelectModalProps {
//   pageCount: number
//   searchParams: ListFilesMinimalFilterInput
//   updateSearchParams: <K extends keyof ListFilesMinimalFilterInput>(
//     key: K,
//     value: ListFilesMinimalFilterInput[K]
//   ) => void
// }

// export const FileSelectPagination: React.FC<FileSelectModalProps> = ({
//   pageCount,
//   searchParams,
//   updateSearchParams,
// }) => {
//   const pageSizeOptions = [10, 20, 30, 40, 50]

//   return (
//     <div className="flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8">
//       <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
//         <div className="flex items-center space-x-2">
//           <p className="whitespace-nowrap text-xs font-medium lg:text-sm">
//             Rows per page
//           </p>
//           <Select
//             value={`${searchParams.perPage}`}
//             onValueChange={(value) => {
//               updateSearchParams("perPage", Number(value))
//             }}
//           >
//             <SelectTrigger className="h-8 w-[4.5rem]">
//               <SelectValue placeholder={searchParams.perPage} />
//             </SelectTrigger>
//             <SelectContent side="top">
//               {pageSizeOptions.map((pageSize) => (
//                 <SelectItem key={pageSize} value={`${pageSize}`}>
//                   {pageSize}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//         <div className="flex items-center justify-center text-xs font-medium lg:text-sm">
//           Page {searchParams.page} of {pageCount}
//         </div>
//         <div className="flex items-center space-x-2">
//           <Button
//             aria-label="Go to first page"
//             variant="outline"
//             className="hidden size-8 p-0 lg:flex"
//             onClick={() => updateSearchParams("page", 1)}
//             disabled={searchParams.page <= 1}
//           >
//             <ChevronsLeft className="size-4" aria-hidden="true" />
//           </Button>
//           <Button
//             aria-label="Go to previous page"
//             variant="outline"
//             size="icon"
//             className="size-8"
//             onClick={() => updateSearchParams("page", searchParams.page - 1)}
//             disabled={searchParams.page <= 1}
//           >
//             <ChevronLeft className="size-4" aria-hidden="true" />
//           </Button>
//           <Button
//             aria-label="Go to next page"
//             variant="outline"
//             size="icon"
//             className="size-8"
//             onClick={() => updateSearchParams("page", searchParams.page + 1)}
//             disabled={searchParams.page >= pageCount}
//           >
//             <ChevronRight className="size-4" aria-hidden="true" />
//           </Button>
//           <Button
//             aria-label="Go to last page"
//             variant="outline"
//             size="icon"
//             className="hidden size-8 lg:flex"
//             onClick={() => updateSearchParams("page", pageCount)}
//             disabled={searchParams.page >= pageCount}
//           >
//             <ChevronsRight className="size-4" aria-hidden="true" />
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }
