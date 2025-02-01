import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { z } from "zod";

import { files } from "@nzc/db/schema";
import {
  getFiltersStateParser,
  getSortingStateParser,
} from "@nzc/ui/utils/parsers";

import type { FileEntity } from "../common";

export const filesSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<FileEntity>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  name: parseAsString.withDefault(""),
  type: parseAsArrayOf(z.enum(files.type.enumValues)).withDefault([]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
  filters: getFiltersStateParser().withDefault([]),
};

export type ListFilesInput = typeof filesSearchParams;
