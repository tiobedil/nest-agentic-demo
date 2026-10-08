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
}

export function Thinking({ title = "Thinking", steps = defaultSteps, ...props }: ThinkingProps) {
  return <Processing {...props} title={title} steps={steps} stages={stages} doneTitle="Thought for 1 second" />
}
