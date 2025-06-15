import { FilterIcon } from "lucide-react"
import { parseAsBoolean, useQueryState } from "nuqs"
import { Button } from "../button"
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip"

export function DataTableAdvancedFilterToggle() {
  const [advancedTable, setAdvancedTable] = useQueryState("advancedTable", {
    ...parseAsBoolean.withDefault(false),
    history: "replace",
  })

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={advancedTable ? "default" : "outline"}
          size="sm"
          onClick={() => setAdvancedTable(!advancedTable)}
          icon={<FilterIcon />}
        >
          Filters
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Toggle advanced filters</p>
      </TooltipContent>
    </Tooltip>
  )
}
