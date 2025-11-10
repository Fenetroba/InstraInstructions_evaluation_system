import { Switch as UISwitch } from "@/components/ui/switch"
import { useState } from "react"

const Switch = ({ id, checked, onChange }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = async (isChecked) => {
    try {
      setIsLoading(true)
      await onChange(isChecked)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <UISwitch
      checked={checked}
      onCheckedChange={handleChange}
      disabled={isLoading}
      className="data-[state=checked]:bg-green-500 cursor-pointer shadow-lime-900"
    />
  )
}

export default Switch