/**
 * ARCHIVO: components/ui/chart.tsx
 * VERSIÓN: 5.1 (Madrid Resonance)
 * PROTOCOLO: Nominal Sovereignty
 * MISIÓN: Terminal de visualización de datos de alta precisión (Crystal Layer).
 * [REFORMA V5.1]: Implementación de la Zero Abbreviations Policy (ZAP).
 * Sincronización nominal de descriptores técnicos (identification, configuration).
 * NIVEL DE INTEGRIDAD: 100%
 */

"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { classNamesUtility } from "@/lib/utils"

// Formato: { NOMBRE_TEMA: SELECTOR_CSS }
const THEMES_COLLECTION = { light: "", dark: ".dark" } as const

export type ChartConfiguration = {
  [key in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES_COLLECTION, string> }
  )
}

/**
 * ChartContextProperties: Definición del contrato del orquestador visual.
 */
interface ChartContextProperties {
  chartConfiguration: ChartConfiguration
}

const ChartContext = React.createContext<ChartContextProperties | null>(null)

/**
 * useChart: Hook de acceso al contexto de configuración del radar visual.
 */
function useChart() {
  const contextReference = React.useContext(ChartContext)

  if (!contextReference) {
    throw new Error("useChart debe ser utilizado dentro de un <ChartContainer />")
  }

  return contextReference
}

/**
 * ChartContainer: El motor de renderizado y orquestación para gráficas Recharts.
 */
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    chartConfiguration: ChartConfiguration
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id: identification, className, children, chartConfiguration, ...componentProperties }, elementReference) => {
  const uniqueIdentification = React.useId()
  const chartIdentification = `chart-${identification || uniqueIdentification.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ chartConfiguration }}>
      <div
        data-chart={chartIdentification}
        ref={elementReference}
        className={classNamesUtility(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...componentProperties}
      >
        <ChartStyle identification={chartIdentification} chartConfiguration={chartConfiguration} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

/**
 * ChartStyle: Generador dinámico de estilos CSS para la inyección de temas.
 */
const ChartStyle = ({ identification, chartConfiguration }: { identification: string; chartConfiguration: ChartConfiguration }) => {
  const colorConfigurationCollection = Object.entries(chartConfiguration).filter(
    ([_, configuration]) => configuration.theme || configuration.color
  )

  if (!colorConfigurationCollection.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES_COLLECTION)
          .map(
            ([themeName, themeSelectorPrefix]) => `
${themeSelectorPrefix} [data-chart=${identification}] {
${colorConfigurationCollection
  .map(([key, itemConfiguration]) => {
    const colorValue =
      itemConfiguration.theme?.[themeName as keyof typeof itemConfiguration.theme] ||
      itemConfiguration.color
    return colorValue ? `  --color-${key}: ${colorValue};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

/**
 * ChartTooltipContent: Componente de proyección de metadatos flotantes.
 */
const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    elementReference
  ) => {
    const { chartConfiguration } = useChart()

    const tooltipLabelMarkup = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [firstPayloadItem] = payload
      const configurationKey = `${labelKey || firstPayloadItem.dataKey || firstPayloadItem.name || "value"}`
      const itemConfiguration = getPayloadConfigurationFromPayload(chartConfiguration, firstPayloadItem, configurationKey)
      const labelValue =
        !labelKey && typeof label === "string"
          ? chartConfiguration[label as keyof typeof chartConfiguration]?.label || label
          : itemConfiguration?.label

      if (labelFormatter) {
        return (
          <div className={classNamesUtility("font-medium", labelClassName)}>
            {labelFormatter(labelValue, payload)}
          </div>
        )
      }

      if (!labelValue) {
        return null
      }

      return <div className={classNamesUtility("font-medium", labelClassName)}>{labelValue}</div>
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      chartConfiguration,
      labelKey,
    ])

    if (!active || !payload?.length) {
      return null
    }

    const isNestLabelActive = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={elementReference}
        className={classNamesUtility(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!isNestLabelActive ? tooltipLabelMarkup : null}
        <div className="grid gap-1.5">
          {payload.map((payloadItem, itemIndex) => {
            const configurationKey = `${nameKey || payloadItem.name || payloadItem.dataKey || "value"}`
            const itemConfiguration = getPayloadConfigurationFromPayload(chartConfiguration, payloadItem, configurationKey)
            const indicatorColorValue = color || payloadItem.payload.fill || payloadItem.color

            return (
              <div
                key={payloadItem.dataKey}
                className={classNamesUtility(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && payloadItem?.value !== undefined && payloadItem.name ? (
                  formatter(payloadItem.value, payloadItem.name, payloadItem, itemIndex, payloadItem.payload)
                ) : (
                  <>
                    {itemConfiguration?.icon ? (
                      <itemConfiguration.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={classNamesUtility(
                            "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": isNestLabelActive && indicator === "dashed",
                            }
                          )}
                          style={
                            {
                              "--color-bg": indicatorColorValue,
                              "--color-border": indicatorColorValue,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={classNamesUtility(
                        "flex flex-1 justify-between leading-none",
                        isNestLabelActive ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {isNestLabelActive ? tooltipLabelMarkup : null}
                        <span className="text-muted-foreground">
                          {itemConfiguration?.label || payloadItem.name}
                        </span>
                      </div>
                      {payloadItem.value && (
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {payloadItem.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltip"

const ChartLegend = RechartsPrimitive.Legend

/**
 * ChartLegendContent: Componente de visualización de leyendas taxonómicas.
 */
const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
    elementReference
  ) => {
    const { chartConfiguration } = useChart()

    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={elementReference}
        className={classNamesUtility(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
      >
        {payload.map((legendItem) => {
          const configurationKey = `${nameKey || legendItem.dataKey || "value"}`
          const itemConfiguration = getPayloadConfigurationFromPayload(chartConfiguration, legendItem, configurationKey)

          return (
            <div
              key={legendItem.value}
              className={classNamesUtility(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              {itemConfiguration?.icon && !hideIcon ? (
                <itemConfiguration.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: legendItem.color,
                  }}
                />
              )}
              {itemConfiguration?.label}
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegend"

/**
 * getPayloadConfigurationFromPayload:
 * Misión: Extraer la configuración del cristal basada en el payload del nodo de Recharts.
 */
function getPayloadConfigurationFromPayload(
  configurationReference: ChartConfiguration,
  payloadData: unknown,
  identificationKey: string
) {
  if (typeof payloadData !== "object" || payloadData === null) {
    return undefined
  }

  const payloadInternalData =
    "payload" in payloadData &&
    typeof payloadData.payload === "object" &&
    payloadData.payload !== null
      ? payloadData.payload
      : undefined

  let configurationLabelIdentificationKey: string = identificationKey

  if (
    identificationKey in payloadData &&
    typeof payloadData[identificationKey as keyof typeof payloadData] === "string"
  ) {
    configurationLabelIdentificationKey = payloadData[identificationKey as keyof typeof payloadData] as string
  } else if (
    payloadInternalData &&
    identificationKey in payloadInternalData &&
    typeof payloadInternalData[identificationKey as keyof typeof payloadInternalData] === "string"
  ) {
    configurationLabelIdentificationKey = payloadInternalData[
      identificationKey as keyof typeof payloadInternalData
    ] as string
  }

  return configurationLabelIdentificationKey in configurationReference
    ? configurationReference[configurationLabelIdentificationKey]
    : configurationReference[identificationKey as keyof typeof configurationReference]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
