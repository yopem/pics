import { mergeProps } from "@base-ui-components/react/merge-props"
import { useRender } from "@base-ui-components/react/use-render"

import { cn } from "@/lib/utils/style"

type CardProps = useRender.ComponentProps<"div">

function Card({ className, render, ...props }: CardProps) {
  const defaultProps = {
    className: cn(
      "border-border bg-card text-card-foreground rounded-lg border shadow-sm",
      className,
    ),
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

type CardHeaderProps = useRender.ComponentProps<"div">

function CardHeader({ className, render, ...props }: CardHeaderProps) {
  const defaultProps = {
    className: cn("flex flex-col space-y-1.5 p-6", className),
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

type CardTitleProps = useRender.ComponentProps<"h3">

function CardTitle({ className, render, ...props }: CardTitleProps) {
  const defaultProps = {
    className: cn("leading-none font-semibold tracking-tight", className),
  }

  return useRender({
    defaultTagName: "h3",
    props: mergeProps<"h3">(defaultProps, props),
    render,
  })
}

type CardDescriptionProps = useRender.ComponentProps<"p">

function CardDescription({
  className,
  render,
  ...props
}: CardDescriptionProps) {
  const defaultProps = {
    className: cn("text-muted-foreground text-sm", className),
  }

  return useRender({
    defaultTagName: "p",
    props: mergeProps<"p">(defaultProps, props),
    render,
  })
}

type CardContentProps = useRender.ComponentProps<"div">

function CardContent({ className, render, ...props }: CardContentProps) {
  const defaultProps = {
    className: cn("p-6 pt-0", className),
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

type CardFooterProps = useRender.ComponentProps<"div">

function CardFooter({ className, render, ...props }: CardFooterProps) {
  const defaultProps = {
    className: cn("flex items-center p-6 pt-0", className),
  }

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  })
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
