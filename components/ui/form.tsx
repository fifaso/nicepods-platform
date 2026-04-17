/**
 * ARCHIVO: components/ui/form.tsx
 * VERSIÓN: 5.1 (Madrid Resonance)
 * PROTOCOLO: Nominal Sovereignty
 * MISIÓN: Orquestador de validación y estructura para terminales de entrada (Crystal Layer).
 * [REFORMA V5.1]: Implementación integral de la Zero Abbreviations Policy (ZAP).
 * Sincronización nominal de identificadores técnicos y estados de validación.
 * NIVEL DE INTEGRIDAD: 100%
 */

"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form"

import { classNamesUtility } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

/**
 * FormFieldContextProperties: Contrato de identidad para campos individuales.
 */
interface FormFieldContextProperties<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextProperties>(
  {} as FormFieldContextProperties
)

/**
 * FormField: El átomo de control reactivo para campos de formulario.
 */
const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...componentProperties
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: componentProperties.name }}>
      <Controller {...componentProperties} />
    </FormFieldContext.Provider>
  )
}

/**
 * useFormField: Hook de extracción de metadatos y estados de validación del campo.
 */
const useFormField = () => {
  const fieldContextReference = React.useContext(FormFieldContext)
  const itemContextReference = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldStateSnapshot = getFieldState(fieldContextReference.name, formState)

  if (!fieldContextReference) {
    throw new Error("useFormField debe ser utilizado dentro de <FormField />")
  }

  const { identification } = itemContextReference

  return {
    identification,
    name: fieldContextReference.name,
    formItemIdentification: `${identification}-form-item`,
    formDescriptionIdentification: `${identification}-form-item-description`,
    formMessageIdentification: `${identification}-form-item-message`,
    ...fieldStateSnapshot,
  }
}

/**
 * FormItemContextProperties: Definición de identidad para el contenedor del ítem.
 */
interface FormItemContextProperties {
  identification: string
}

const FormItemContext = React.createContext<FormItemContextProperties>(
  {} as FormItemContextProperties
)

/**
 * FormItem: Contenedor estructural para etiquetas, controles y mensajes.
 */
const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...componentProperties }, elementReference) => {
  const identification = React.useId()

  return (
    <FormItemContext.Provider value={{ identification }}>
      <div
        ref={elementReference}
        className={classNamesUtility("space-y-2", className)}
        {...componentProperties}
      />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

/**
 * FormLabel: Descriptor nominal para el control del Voyager.
 */
const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...componentProperties }, elementReference) => {
  const { error, formItemIdentification } = useFormField()

  return (
    <Label
      ref={elementReference}
      className={classNamesUtility(error && "text-destructive", className)}
      htmlFor={formItemIdentification}
      {...componentProperties}
    />
  )
})
FormLabel.displayName = "FormLabel"

/**
 * FormControl: El wrapper de inyección para el elemento de entrada físico.
 */
const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...componentProperties }, elementReference) => {
  const { error, formItemIdentification, formDescriptionIdentification, formMessageIdentification } = useFormField()

  return (
    <Slot
      ref={elementReference}
      id={formItemIdentification}
      aria-describedby={
        !error
          ? `${formDescriptionIdentification}`
          : `${formDescriptionIdentification} ${formMessageIdentification}`
      }
      aria-invalid={!!error}
      {...componentProperties}
    />
  )
})
FormControl.displayName = "FormControl"

/**
 * FormDescription: Texto de apoyo y contexto para el Voyager.
 */
const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...componentProperties }, elementReference) => {
  const { formDescriptionIdentification } = useFormField()

  return (
    <p
      ref={elementReference}
      id={formDescriptionIdentification}
      className={classNamesUtility("text-sm text-muted-foreground", className)}
      {...componentProperties}
    />
  )
})
FormDescription.displayName = "FormDescription"

/**
 * FormMessage: Visualizador de excepciones de validación.
 */
const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...componentProperties }, elementReference) => {
  const { error, formMessageIdentification } = useFormField()
  const errorBodyContent = error ? String(error?.message) : children

  if (!errorBodyContent) {
    return null
  }

  return (
    <p
      ref={elementReference}
      id={formMessageIdentification}
      className={classNamesUtility("text-sm font-medium text-destructive", className)}
      {...componentProperties}
    >
      {errorBodyContent}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
