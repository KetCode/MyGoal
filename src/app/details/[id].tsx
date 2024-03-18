// LIBS
import { useEffect, useRef, useState } from "react"
import { Keyboard, View, Text, TouchableOpacity } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import Bottom from "@gorhom/bottom-sheet"
import dayjs from "dayjs"

// DATABASE
import { useGoalRepository } from "@/database/useGoalRepository"
import { useTransactionRepository } from "@/database/useTransactionRepository"

// COMPONENTS
import { Input } from "@/components/Input"
import { Header } from "@/components/Header"
import { Button } from "@/components/Button"
import { Loading } from "@/components/Loading"
import { Progress } from "@/components/Progress"
import { BackButton } from "@/components/BackButton"
import { BottomSheet } from "@/components/BottomSheet"
import { Transactions } from "@/components/Transactions"
import { TransactionProps } from "@/components/Transaction"
import { TransactionTypeSelect } from "@/components/TransactionTypeSelect"

// UTILS
import { currencyFormat } from "@/utils/currencyFormat"
import { RemoveButton } from "@/components/RemoveButton"
import { Modal } from "@/components/Modal"
import { Alert } from "@/components/Alert"
import { colors } from "@/styles/colors"
import { alertStyle } from "@/utils/alertStyles"

type Details = {
  name: string
  total: string
  current: string
  percentage: number
  transactions: TransactionProps[]
}

export default function Details() {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [type, setType] = useState<"up" | "down">("up")
  const [goal, setGoal] = useState<Details>({} as Details)

  // PARAMS
  const routeParams = useLocalSearchParams()
  const goalId = Number(routeParams.id)

  // DATABASE
  const useGoal = useGoalRepository();
  const useTransaction = useTransactionRepository();

  // BOTTOM SHEET
  const bottomSheetRef = useRef<Bottom>(null)
  const handleBottomSheetOpen = () => bottomSheetRef.current?.expand()
  const handleBottomSheetClose = () => bottomSheetRef.current?.snapToIndex(0)

  // CONFIRM POPUP MODAL
  const [open, setOpen] = useState(false)
  const isOpen = () => {setOpen(!open)}

  // SHOW TOAST NOTIFICATION
  const [showToast, setShowToast] = useState(false)
  const [showToastError, setShowToastError] = useState(false)

  function fetchDetails() {
    try {
      if (goalId) {
        const goal = useGoal.show(goalId)
        const transactions = useTransaction.findByGoal(goalId)

        if (!goal || !transactions) {
          return router.back()
        }

        setGoal({
          name: goal.name,
          current: currencyFormat(goal.current),
          total: currencyFormat(goal.total),
          percentage: (goal.current / goal.total) * 100,
          transactions: transactions.map((item) => ({
            ...item,
            date: dayjs(item.created_at).format("DD/MM/YYYY [às] HH:mm"),
          })),
        })

        setIsLoading(false)
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function handleNewTransaction() {
    try {
      let amountAsNumber = Number(amount.replace(",", "."))

      if (isNaN(amountAsNumber) || amountAsNumber <= 0) {
        // return Alert.alert("Erro", "Valor inválido.")
        return [
          setShowToastError(!showToastError),
          setTimeout(() => {
            setShowToastError(showToastError)
          }, 3000)
        ]
      }

      if (type === "down") {
        amountAsNumber = amountAsNumber * -1
      }

      useTransaction.create({ goalId, amount: amountAsNumber })

      // Alert.alert("Sucesso", "Transação registrada!")
      setShowToast(!showToast)

      setTimeout(() => {
        setShowToast(showToast)
      }, 3000)

      handleBottomSheetClose()
      Keyboard.dismiss()

      setAmount("")
      setType("up")

      fetchDetails()
    } catch (error) {
      console.log(error)
    }
  }

  async function handleRemoveGoal() {
    try {
      useGoal.remove(goalId)
      useTransaction.remove(goalId)

      fetchDetails()
    } catch (error) {
      console.log(error)
    }
  }  

  useEffect(() => {
    fetchDetails()
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return (
    <View className="flex-1 p-8 pt-12">

      <Modal isOpen={open}>
          <View className="bg-white rounded-lg p-9 m-5">
            <Text className="font-bold text-lg mb-3">Atenção</Text>
            <Text className="font-regular text-lg mb-3">Tem certeza que deseja deletar?</Text>
            <View className="flex-row justify-end">
              <TouchableOpacity className="items-center justify-center rounded-sm p-2 border-zinc-900/40 border-2 px-4" onPress={isOpen}>
                <Text className="text-sm font-semiBold uppercase">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-blue-500 items-center justify-center rounded-sm p-2 ml-5 px-4" onPress={handleRemoveGoal}>
                <Text className="text-white text-sm font-semiBold uppercase">Sim</Text>
              </TouchableOpacity>
            </View>
          </View>
      </Modal>

      <View className="items-center justify-between flex-row">
        <BackButton />
        <RemoveButton onRemove={isOpen} />
      </View>

      <Header title={goal.name} subtitle={`${goal.current} de ${goal.total}`} />

      <Progress percentage={goal.percentage} />

      <Transactions transactions={goal.transactions} />

      <Button title="Nova transação" onPress={handleBottomSheetOpen} />

      <BottomSheet
        ref={bottomSheetRef}
        title="Nova transação"
        snapPoints={[0.01, 284]}
        onClose={handleBottomSheetClose}
      >
        <TransactionTypeSelect onChange={setType} selected={type} />

        <Input
          placeholder="Valor"
          keyboardType="numeric"
          onChangeText={setAmount}
          value={amount}
        />

        <Button title="Confirmar" onPress={handleNewTransaction} />
      </BottomSheet>
      { showToast && <Alert closeAlert={async () => setShowToast(!showToast)} title={"Sucesso"} content={"Transação registrada!"} styleBg={alertStyle.green.body} styleTitle={alertStyle.green.title} styleContent={alertStyle.green.content} colorButton={colors.green[500]} />}
      { showToastError && <Alert closeAlert={async () => setShowToastError(!showToastError)} title={"Erro"} content={"Valor inválido."} styleBg={alertStyle.red.body} styleTitle={alertStyle.red.title} styleContent={alertStyle.red.content} colorButton={colors.red[500]} />}
    </View>
  )
}
