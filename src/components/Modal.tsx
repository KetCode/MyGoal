import { Modal as RNModal, ModalProps, View } from 'react-native'

type Props = ModalProps & {
    isOpen: boolean
}

export function Modal({ isOpen, children, ...rest }: Props) {

    const content = (
        <View className='items-center justify-center flex-1 px-3 bg-zinc-900/40'>
            {children}
        </View>
    )

    return (
        <RNModal
            visible={isOpen}
            transparent
            animationType='fade'
            statusBarTranslucent
            {...rest}
        >
            {content}
        </RNModal>
    )
}