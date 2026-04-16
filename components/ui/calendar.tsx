/**
 * ARCHIVE: components/ui/calendar.tsx
 * VERSION: 1.1 (NicePod UI Kit - Tactical Calendar Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * MISSION: Provide a high-fidelity date picker component based on react-day-picker,
 * ensuring nominal sovereignty and industrial-grade User Experience.
 * INTEGRITY LEVEL: 100% (Soberano / No abbreviations / Production-Ready)
 */

'use client'

import * as React from 'react'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react'
import { DayButton, DayPicker, getDefaultClassNames } from 'react-day-picker'

import { classNamesUtility } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'

/**
 * INTERFACE: CalendarComponentProperties
 */
export type CalendarComponentProperties = React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant']
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  formatters,
  components,
  ...componentProperties
}: CalendarComponentProperties) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={classNamesUtility(
        'bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: date =>
          date.toLocaleString('default', { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: classNamesUtility('w-fit', defaultClassNames.root),
        months: classNamesUtility(
          'flex gap-4 flex-col md:flex-row relative',
          defaultClassNames.months
        ),
        month: classNamesUtility('flex flex-col w-full gap-4', defaultClassNames.month),
        nav: classNamesUtility(
          'flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between',
          defaultClassNames.nav
        ),
        button_previous: classNamesUtility(
          buttonVariants({ variant: buttonVariant }),
          'size-[--cell-size] aria-disabled:opacity-50 p-0 select-none',
          defaultClassNames.button_previous
        ),
        button_next: classNamesUtility(
          buttonVariants({ variant: buttonVariant }),
          'size-[--cell-size] aria-disabled:opacity-50 p-0 select-none',
          defaultClassNames.button_next
        ),
        month_caption: classNamesUtility(
          'flex items-center justify-center h-[--cell-size] w-full px-[--cell-size]',
          defaultClassNames.month_caption
        ),
        dropdowns: classNamesUtility(
          'w-full flex items-center text-sm font-medium justify-center h-[--cell-size] gap-1.5',
          defaultClassNames.dropdowns
        ),
        dropdown_root: classNamesUtility(
          'relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md',
          defaultClassNames.dropdown_root
        ),
        dropdown: classNamesUtility(
          'absolute bg-popover inset-0 opacity-0',
          defaultClassNames.dropdown
        ),
        caption_label: classNamesUtility(
          'select-none font-medium',
          captionLayout === 'label'
            ? 'text-sm'
            : 'rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5',
          defaultClassNames.caption_label
        ),
        table: 'w-full border-collapse',
        weekdays: classNamesUtility('flex', defaultClassNames.weekdays),
        weekday: classNamesUtility(
          'text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none',
          defaultClassNames.weekday
        ),
        week: classNamesUtility('flex w-full mt-2', defaultClassNames.week),
        week_number_header: classNamesUtility(
          'select-none w-[--cell-size]',
          defaultClassNames.week_number_header
        ),
        week_number: classNamesUtility(
          'text-[0.8rem] select-none text-muted-foreground',
          defaultClassNames.week_number
        ),
        day: classNamesUtility(
          'relative w-full h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none',
          defaultClassNames.day
        ),
        range_start: classNamesUtility(
          'rounded-l-md bg-accent',
          defaultClassNames.range_start
        ),
        range_middle: classNamesUtility('rounded-none', defaultClassNames.range_middle),
        range_end: classNamesUtility('rounded-r-md bg-accent', defaultClassNames.range_end),
        today: classNamesUtility(
          'bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none',
          defaultClassNames.today
        ),
        outside: classNamesUtility(
          'text-muted-foreground aria-selected:text-muted-foreground',
          defaultClassNames.outside
        ),
        disabled: classNamesUtility(
          'text-muted-foreground opacity-50',
          defaultClassNames.disabled
        ),
        hidden: classNamesUtility('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...rootProperties }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={classNamesUtility(className)}
              {...rootProperties}
            />
          )
        },
        Chevron: ({ className, orientation, ...chevronProperties }) => {
          if (orientation === 'left') {
            return (
              <ChevronLeftIcon className={classNamesUtility('size-4', className)} {...chevronProperties} />
            )
          }

          if (orientation === 'right') {
            return (
              <ChevronRightIcon
                className={classNamesUtility('size-4', className)}
                {...chevronProperties}
              />
            )
          }

          return (
            <ChevronDownIcon className={classNamesUtility('size-4', className)} {...chevronProperties} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...weekNumberProperties }) => {
          return (
            <td {...weekNumberProperties}>
              <div className="flex size-[--cell-size] items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...componentProperties}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...dayButtonProperties
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const elementReference = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) {
        elementReference.current?.focus()
    }
  }, [modifiers.focused])

  return (
    <Button
      ref={elementReference}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={classNamesUtility(
        'data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square w-full min-w-[--cell-size] flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70',
        defaultClassNames.day,
        className
      )}
      {...dayButtonProperties}
    />
  )
}

export { Calendar, CalendarDayButton }
