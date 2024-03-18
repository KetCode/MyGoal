import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { colors } from "@/styles/colors"
import { TouchableOpacity, TouchableOpacityProps } from "react-native"

type Props = TouchableOpacityProps & {
  onRemove: () => void
}

export function RemoveButton({ onRemove, ...rest }: Props) {
  return (
    <TouchableOpacity onPress={onRemove} {...rest}>
      <MaterialIcons name="highlight-remove" size={36} color={colors.red[500]} />
    </TouchableOpacity>
  )
}
