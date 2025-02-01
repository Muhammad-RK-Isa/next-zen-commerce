// "use client"

// import * as React from "react"
// import type {
//   DropzoneProps,
//   FileRejection,
// } from "react-dropzone"
// import Dropzone from "react-dropzone"
// import { toast } from "sonner"

// import { Card, CardContent, CardHeader, CardTitle } from "@nzc/ui/components/card"
// import { Progress } from "@nzc/ui/components/progress"
// import { ScrollArea } from "@nzc/ui/components/scroll-area"
// import { Upload } from "lucide-react"
// import Image from "next/image"
// import { useControllableState } from "~/lib/hooks/use-controllable-state"
// import { cn, formatBytes, getErrorMessage } from "~/lib/utils"

// interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
//   /**
//    * Value of the uploader.
//    * @type File[]
//    * @default undefined
//    * @example value={files}
//    */
//   value?: File[]

//   /**
//    * Function to be called when the value changes.
//    * @type React.Dispatch<React.SetStateAction<File[]>>
//    * @default undefined
//    * @example onValueChange={(files) => setFiles(files)}
//    */
//   onValueChange?: React.Dispatch<React.SetStateAction<File[]>>

//   /**
//    * Function to be called when files are uploaded.
//    * @type (files: File[]) => Promise<void>
//    * @default undefined
//    * @example onUpload={(files) => uploadFiles(files)}
//    */
//   onUpload?: (files: File[]) => Promise<void>

//   /**
//    * Progress of the uploaded files.
//    * @type Record<string, number> | undefined
//    * @default undefined
//    * @example progresses={{ "file1.png": 50 }}
//    */
//   progresses?: Record<string, number>

//   /**
//    * Accepted file types for the uploader.
//    * @type { [key: string]: string[]}
//    * @default
//    * ```ts
//    * { "image/*": [] }
//    * ```
//    * @example accept={["image/png", "image/jpeg"]}
//    */
//   accept?: DropzoneProps["accept"]

//   /**
//    * Maximum file size for the uploader.
//    * @type number | undefined
//    * @default 1024 * 1024 * 2 // 2MB
//    * @example maxSize={1024 * 1024 * 2} // 2MB
//    */
//   maxSize?: DropzoneProps["maxSize"]

//   /**
//    * Maximum number of files for the uploader.
//    * @type number | undefined
//    * @default 1
//    * @example maxFiles={5}
//    */
//   maxFiles?: DropzoneProps["maxFiles"]

//   /**
//    * Whether the uploader should accept multiple files.
//    * @type boolean
//    * @default false
//    * @example multiple
//    */
//   multiple?: boolean

//   /**
//    * Whether the uploader is disabled.
//    * @type boolean
//    * @default false
//    * @example disabled
//    */
//   disabled?: boolean

//   /**
//    * Whether the files are being uploaded or not
//    * @type boolean
//    * @example isUploading
//    */
//   isUploading?: boolean

//   /**
//    * Whether the progress bars should be shown.
//    * @type boolean
//    * @default true
//    * @example showProgress
//    */
//   showProgress?: boolean

//   /**
//    * Callback function to be called when a file is dropped.
//    * @type () => void
//    * @default undefined
//    * @example onFilesDrop={() => console.log()}
//    */
// }

// export function FileUploader(props: FileUploaderProps) {
//   const {
//     value: valueProp,
//     onValueChange,
//     onUpload,
//     accept = {
//       "image/*": [],
//       "video/*": [],
//       "audio/*": [],
//       "text/*": [],
//       "text/csv": [],
//     },
//     maxSize = 1024 * 1024 * 4,
//     maxFiles = 1,
//     multiple = false,
//     disabled = false,
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     isUploading = false,
//     className,
//     progresses,
//     ...dropzoneProps
//   } = props

//   const [files, setFiles] = useControllableState({
//     prop: valueProp,
//     onChange: onValueChange,
//   })

//   const onDrop = React.useCallback(
//     async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
//       if (!multiple && maxFiles === 1 && acceptedFiles.length > 1) {
//         toast.error("Cannot upload more than 1 file at a time")
//         return
//       }

//       if ((files?.length ?? 0) + acceptedFiles.length > maxFiles) {
//         toast.error(`Cannot upload more than ${maxFiles} files`)
//         return
//       }

//       const newFiles = acceptedFiles.map((file) =>
//         Object.assign(file, {
//           preview: URL.createObjectURL(file),
//         })
//       )

//       const updatedFiles = files ? [...files, ...newFiles] : newFiles

//       setFiles(updatedFiles)

//       if (rejectedFiles.length > 0) {
//         rejectedFiles.forEach(({ file, errors }) => {
//           toast.error(
//             <div className="font-medium">
//               <span>{`File ${file.name} was rejected due to the following errors:`}</span>
//               <ul className="list-disc space-y-1 p-2 text-[0.8rem]">
//                 {errors.map((error) => (
//                   <li key={error.code} className="ml-4">
//                     {error.code === "file-too-large"
//                       ? error.message.replace(/(\d+) bytes/, (_, bytes) =>
//                         // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
//                         formatBytes(bytes)
//                       )
//                       : error.message}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )
//         })
//       }

//       if (
//         onUpload &&
//         updatedFiles.length > 0 &&
//         updatedFiles.length <= maxFiles
//       ) {
//         try {
//           await onUpload(updatedFiles)
//           setFiles([])
//           toast.success("Files uploaded")
//         } catch (error) {
//           toast.error(getErrorMessage(error))
//         }
//       }
//     },
//     [files, maxFiles, multiple, onUpload, setFiles]
//   )

//   // Revoke preview url when component unmounts
//   React.useEffect(() => {
//     return () => {
//       if (!files) return
//       files.forEach((file) => {
//         if (isFileWithPreview(file)) {
//           URL.revokeObjectURL(file.preview)
//         }
//       })
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [])

//   const isDisabled = disabled || (files?.length ?? 0) >= maxFiles

//   return (
//     <div className="relative flex flex-col gap-6 overflow-hidden">
//       <Dropzone
//         onDrop={onDrop}
//         accept={accept}
//         maxSize={maxSize}
//         maxFiles={maxFiles}
//         multiple={maxFiles > 1 || multiple}
//         disabled={isDisabled}
//       >
//         {({ getRootProps, getInputProps, isDragActive }) => (
//           <div
//             {...getRootProps()}
//             className={cn(
//               "group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition-all hover:bg-muted/25",
//               "focus-visible:border-primary focus-visible:outline-none",
//               isDragActive && "border-muted-foreground",
//               isDisabled && "pointer-events-none opacity-60",
//               className
//             )}
//             {...dropzoneProps}
//           >
//             <input {...getInputProps()} />
//             {isDragActive ? (
//               <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
//                 <div className="rounded-full border border-dashed p-3">
//                   <Upload
//                     className="size-7 text-muted-foreground"
//                     aria-hidden="true"
//                   />
//                 </div>
//                 <p className="font-medium text-muted-foreground">
//                   Drop the files here
//                 </p>
//               </div>
//             ) : (
//               <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
//                 <div className="rounded-full border border-dashed p-3">
//                   <Upload
//                     className="size-7 text-muted-foreground"
//                     aria-hidden="true"
//                   />
//                 </div>
//                 <div className="space-y-px">
//                   <p className="font-medium text-muted-foreground">
//                     Drag {`'n'`} drop files here, or click to select files
//                   </p>
//                   <p className="text-sm text-muted-foreground/70">
//                     You can upload
//                     {maxFiles > 1
//                       ? ` ${maxFiles === Infinity ? "multiple" : maxFiles}
//                       files (up to ${formatBytes(maxSize)} each)`
//                       : ` a file with ${formatBytes(maxSize)}`}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </Dropzone>
//       {files?.length ? (
//         <Card>
//           <CardHeader>
//             <CardTitle>Files to be uploaded</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ScrollArea className="h-fit w-full px-3">
//               <div className="max-h-48 space-y-4">
//                 {files.map((file, index) => (
//                   <FileCard
//                     key={index}
//                     file={file}
//                     progress={progresses?.[file.name]}
//                   />
//                 ))}
//               </div>
//             </ScrollArea>
//           </CardContent>
//         </Card>
//       ) : null}
//     </div>
//   )
// }

// interface FileCardProps {
//   file: File
//   progress?: number
// }

// function FileCard({ file, progress }: FileCardProps) {
//   return (
//     <div className="relative flex items-center space-x-4">
//       <div className="flex flex-1 space-x-4">
//         {isFileWithPreview(file) ? (
//           <Image
//             src={file.preview}
//             alt={file.name}
//             width={48}
//             height={48}
//             loading="lazy"
//             className="aspect-square shrink-0 rounded-md object-cover"
//           />
//         ) : null}
//         <div className="flex w-full flex-col gap-2">
//           <div className="space-y-px">
//             <p className="line-clamp-1 text-sm font-medium text-foreground/80">
//               {file.name}
//             </p>
//             <p className="text-xs text-muted-foreground">
//               {formatBytes(file.size)}
//             </p>
//           </div>
//           <Progress value={progress} />
//         </div>
//       </div>
//     </div>
//   )
// }

// function isFileWithPreview(file: File): file is File & { preview: string } {
//   return "preview" in file && typeof file.preview === "string"
// }
