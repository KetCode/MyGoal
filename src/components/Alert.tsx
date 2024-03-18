import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { View, Text, TouchableOpacity, ViewProps } from "react-native";
import Animated, { withTiming, useSharedValue, useAnimatedStyle, FadeInUp, FadeOutUp, FadeOutDown, FadeInDown } from 'react-native-reanimated';

type Props = ViewProps & {
    title: string
    content: string
    styleBg: string
    styleTitle: string
    styleContent: string
    colorButton: string
    closeAlert: () => {}
}



export function Alert({ title, content, styleBg, styleTitle, styleContent, colorButton, closeAlert }: Props) {
    return (
        <Animated.View
        entering={FadeInDown}
        exiting={FadeOutDown}
        >
            <View className={styleBg}>
                <View className="shrink-0 mr-3">
                    <MaterialIcons name="check-circle-outline" size={24} color={colorButton} />
                </View>
                <View className="flex-1 mr-3">
                    <Text className={styleTitle}>{title}</Text>
                    <Text className={styleContent}>{content}</Text>
                </View>
                <TouchableOpacity onPress={closeAlert} className="shrink-0">
                    <MaterialIcons name="close" size={24} color={colorButton} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    )
}