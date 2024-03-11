import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { colors } from "@/styles/colors"
import { TouchableOpacity } from "react-native"

type Props = {
  onRemove: () => void
}

export function RemoveButton({onRemove}: Props) {
  return (
    <TouchableOpacity onPress={onRemove}>
      <MaterialIcons name="highlight-remove" size={36} color={colors.red[500]} />
    </TouchableOpacity>
  )
}
