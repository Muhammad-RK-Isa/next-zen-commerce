export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type StringKeyOf<TData> = Extract<keyof TData, string>
