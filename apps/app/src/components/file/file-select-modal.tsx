// import React from "react"
// import { FileUploader } from "./file-uploader"

// import { getFileType } from "@nzc/uploader/utils"
// import type { MinimalFile } from "@nzc/validators/common"
// import { useUploadFile } from "@nzc/uploader/use-upload-file"
// import { FileText, Music } from "lucide-react"
// import Image from "next/image"
// import { Button, buttonVariants } from "@nzc/ui/components/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@nzc/ui/components/card"
// import { Checkbox } from "@nzc/ui/components/checkbox"
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@nzc/ui/components/dialog"
// import { Input } from "@nzc/ui/components/input"
// import { ScrollArea } from "@nzc/ui/components/scroll-area"
// import { Skeleton } from "@nzc/ui/components/skeleton"
// import { cn } from "@nzc/ui/utils/cn"
// import { api } from "~/trpc/react"
// import { FileSelectPagination } from "./file-select-pagination"

// interface FileSelectModalProps<M extends boolean = true> {
//   open?: boolean
//   value: M extends true ? MinimalFile[] : MinimalFile | undefined
//   onOpenChange?: (value: boolean) => void
//   onValueChange: (value: M extends true ? MinimalFile[] : MinimalFile | undefined) => void
//   trigger?: React.ReactNode | null
//   multiple: M
//   types?: ListFilesMinimalFilterInput["type"]
// }

// export const FileSelectModal = <M extends boolean = false>({
//   open,
//   value,
//   onOpenChange,
//   onValueChange,
//   trigger,
//   multiple,
//   types = ["image", "video", "audio", "document"],
// }: FileSelectModalProps<M>) => {
//   const [selectedFiles, setSelectedFiles] = React.useState<M extends true ? MinimalFile[] : MinimalFile | undefined>(value)

//   const [searchParams, setSearchParams] = React.useState<ListFilesMinimalFilterInput>({
//     page: 1,
//     perPage: 10,
//     name: "",
//     from: "",
//     to: "",
//     type: types,
//     joinOperator: "and",
//   })

//   const updateSearchParams = async <K extends keyof ListFilesMinimalFilterInput>(
//     key: K,
//     value: ListFilesMinimalFilterInput[K]
//   ) => {
//     setSearchParams((prevParams) => ({
//       ...prevParams,
//       [key]: value,
//     }))
//     await refetch()
//   }

//   const { data: files, refetch, isPending } =
//     api.file.listByMinimalFilter.useQuery(searchParams);

//   const {
//     uploadFiles,
//     progresses,
//     uploadedFiles,
//     isUploading,
//     setUploadedFiles,
//   } = useUploadFile("adminUploader")

//   React.useEffect(() => {
//     setUploadedFiles(
//       files?.data.map((file) => ({
//         id: file.id,
//         name: file.name,
//         url: file.url,
//         alt: "",
//         type: getFileType(file.type),
//       })) ?? []
//     )
//   }, [setUploadedFiles, files?.data, files])

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       {!onOpenChange ? (
//         <DialogTrigger
//           className={cn(!trigger && buttonVariants({ variant: "outline" }))}
//           asChild={!!trigger}
//         >
//           {trigger ?? "Select Files"}
//         </DialogTrigger>
//       ) : null}
//       <DialogContent className="flex flex-col gap-4 p-0 sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg">
//         <DialogHeader className="p-4 lg:p-6">
//           <DialogTitle>Select Files</DialogTitle>
//           <DialogDescription>
//             Select from the list of images or upload new ones
//           </DialogDescription>
//         </DialogHeader>
//         <div className="-mt-8 flex h-full flex-1 flex-col">
//           <div className="flex flex-col space-y-4 p-4 lg:p-6">
//             <FileUploader
//               maxFiles={100}
//               maxSize={256 * 1024 * 1024}
//               progresses={progresses}
//               disabled={isUploading}
//               onUpload={uploadFiles}
//               isUploading={isUploading}
//               className="h-40 text-sm"
//               multiple={true}
//             />
//             <Files<M>
//               files={uploadedFiles}
//               selectedFiles={selectedFiles}
//               setSelectedFiles={setSelectedFiles}
//               multiple={multiple}
//               isLoading={isPending}
//               updateSearchParams={updateSearchParams}
//               searchParams={searchParams}
//             />
//           </div>
//           <div className="flex w-full flex-col space-y-2 rounded-b-lg border-t bg-card p-4 lg:space-y-4 lg:p-6">
//             <FileSelectPagination
//               pageCount={files?.pageCount ?? 0}
//               searchParams={searchParams}
//               updateSearchParams={updateSearchParams}
//             />
//             <div className="flex w-full flex-row justify-between gap-2">
//               <div className="ml-auto flex items-center space-x-2">
//                 <DialogClose asChild>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size={"sm"}
//                     onClick={() => {
//                       setSelectedFiles(value)
//                       onOpenChange?.(false)
//                     }}
//                   >
//                     Cancel
//                   </Button>
//                 </DialogClose>
//                 <DialogClose asChild>
//                   <Button
//                     type="button"
//                     size={"sm"}
//                     disabled={!uploadedFiles.length}
//                     onClick={() => {
//                       onValueChange(selectedFiles)
//                       onOpenChange?.(false)
//                     }}
//                   >
//                     Done
//                   </Button>
//                 </DialogClose>
//               </div>
//             </div>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }

// interface FilesProps<M extends boolean> {
//   files: MinimalFile[]
//   selectedFiles: M extends true ? MinimalFile[] : MinimalFile | undefined
//   setSelectedFiles: (files: M extends true ? MinimalFile[] : MinimalFile | undefined) => void
//   multiple: M
//   isLoading: boolean
//   updateSearchParams: <K extends keyof ListFilesMinimalFilterInput>(
//     key: K,
//     value: ListFilesMinimalFilterInput[K]
//   ) => void
//   searchParams: ListFilesMinimalFilterInput
// }

// const Files = <M extends boolean = false>({
//   files,
//   selectedFiles,
//   setSelectedFiles,
//   multiple,
//   isLoading,
//   updateSearchParams,
//   searchParams,
// }: FilesProps<M>) => {
//   const handleSelect = (file: MinimalFile) => {
//     if (multiple) {
//       const selectedArray = selectedFiles as MinimalFile[];
//       const isSelected = selectedArray.find((f) => f.id === file.id);

//       if (isSelected) {
//         // Remove file if already selected
//         setSelectedFiles(
//           selectedArray.filter((f) => f.id !== file.id) as M extends true ? MinimalFile[] : MinimalFile
//         );
//       } else {
//         // Add file to selection
//         setSelectedFiles(
//           [...selectedArray, file] as M extends true ? MinimalFile[] : MinimalFile
//         );
//       }
//     } else {
//       const currentSelected = selectedFiles as MinimalFile | undefined;

//       // Toggle selection for single file mode
//       setSelectedFiles(
//         currentSelected?.id === file.id
//           ? (undefined as unknown as M extends true ? MinimalFile[] : MinimalFile)
//           : (file as M extends true ? MinimalFile[] : MinimalFile)
//       );
//     }
//   };

//   return (
//     <Card>
//       <CardHeader className="md:flex-row md:justify-between">
//         <CardTitle className="flex items-center justify-between space-x-2">
//           Uploaded files
//         </CardTitle>
//         <div>
//           <Input
//             value={searchParams.name}
//             onChange={(e) => updateSearchParams("name", e.target.value)}
//           />
//         </div>
//       </CardHeader>
//       <CardContent className="p-4 py-3 md:py-4">
//         {isLoading ? (
//           <ScrollArea className="h-fit">
//             <div className="grid h-[40vh] grid-cols-2 gap-4 p-px sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
//               {Array.from({ length: 12 }, (_, i) => (
//                 <Skeleton
//                   key={i}
//                   className="h-[11.625rem] w-full rounded-md border"
//                 />
//               ))}
//             </div>
//           </ScrollArea>
//         ) : files.length ? (
//           <ScrollArea className="h-fit">
//             <div className="grid h-[40vh] grid-cols-2 gap-4 p-px sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
//               {files.map((file) => (
//                 <div
//                   key={file.id}
//                   className="group flex h-[11.625rem] flex-col items-center space-y-2 rounded-md border bg-secondary p-4 transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-secondary/40 cursor-pointer"
//                   onClick={() => handleSelect(file)}
//                 >
//                   <div className="relative size-28 rounded-md shadow-sm drop-shadow-sm">
//                     <RenderFilePreview file={file} />
//                     <Checkbox
//                       checked={
//                         multiple
//                           ? !!(selectedFiles as MinimalFile[]).find((f) => f.id === file.id)
//                           : (selectedFiles as MinimalFile | undefined)?.id === file.id
//                       }
//                       onCheckedChange={() => handleSelect(file)}
//                       className={cn(
//                         "absolute left-2 top-2 z-20 dark:border-background data-[state=checked]:dark:bg-background data-[state=checked]:dark:text-foreground",
//                         multiple
//                           ? (selectedFiles as MinimalFile[]).find((f) => f.id === file.id)
//                             ? "opacity-100"
//                             : "opacity-0 group-hover:opacity-100 group-focus:opacity-100"
//                           : (selectedFiles as MinimalFile | undefined)?.id === file.id
//                             ? "opacity-100"
//                             : "opacity-0 group-hover:opacity-100 group-focus:opacity-100"
//                       )}
//                     />
//                     <div className="absolute inset-y-0 z-10 size-full rounded-md bg-[#09090b] bg-opacity-0 transition-all duration-75 group-hover:dark:bg-opacity-30 group-hover:md:bg-opacity-10" />
//                   </div>
//                   <div className="line-clamp-2 cursor-default break-all text-center text-xs">
//                     {file.name}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </ScrollArea>
//         ) : (
//           "No files uploaded"
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// function RenderFilePreview({ file }: { file: MinimalFile }) {
//   switch (file.type) {
//     case "image":
//       return (
//         <Image
//           src={file.url}
//           alt={file.name}
//           fill
//           sizes="(min-width: 640px) 640px, 100vw"
//           className="rounded-md object-cover"
//         />
//       )
//     case "video":
//       return (
//         <video
//           src={file.url}
//           className="rounded-md object-cover size-full"
//           preload="metadata"
//           controls={false}
//         />
//       )
//     case "audio":
//       return <Music className="rounded-md object-cover size-full" />
//     case "document":
//     default:
//       return <FileText className="rounded-md object-cover size-full" />
//   }
// }
