import { Processing } from "@/components/chat/Processing"

const stages = [1000, 1600, 1800]
const defaultSteps = ["Reading context", "Searching knowledge", "Composing answer"]

type ThinkingProps = {
  onDone?: () => void
  done?: boolean
  steps?: string[]
  completed?: number
  title?: string
  disabled?: boolean
  completedTitle?: string
}

export function Thinking({ title = "Thinking", steps = defaultSteps, completedTitle = "Reviewed request", ...props }: ThinkingProps) {
  return <Processing {...props} title={title} steps={steps} stages={stages} completedTitle={completedTitle} />
}
