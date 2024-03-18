// LIBS
import { useEffect, useRef, useState } from "react"
import { View, Keyboard } from "react-native"
import Bottom from "@gorhom/bottom-sheet"
import { router } from "expo-router"
import dayjs from "dayjs"

// COMPONENTS
import { Input } from "@/components/Input"
import { Header } from "@/components/Header"
import { Button } from "@/components/Button"
import { BottomSheet } from "@/components/BottomSheet"
import { Goals, GoalsProps } from "@/components/Goals"
import { Transactions, TransactionsProps } from "@/components/Transactions"
import { Alert } from "@/components/Alert"
import { colors } from "@/styles/colors"
import { alertStyle } from "@/utils/alertStyles"

// DATABASE
import { useGoalRepository } from "@/database/useGoalRepository"
import { useTransactionRepository } from "@/database/useTransactionRepository"

export default function Home() {
  // LISTS
  const [transactions, setTransactions] = useState<TransactionsProps>([])
  const [goals, setGoals] = useState<GoalsProps>([])

  // FORM
  const [name, setName] = useState("")
  const [total, setTotal] = useState("")

  // DATABASE
  const useGoal = useGoalRepository();
  const useTransaction = useTransactionRepository();

  // BOTTOM SHEET
  const bottomSheetRef = useRef<Bottom>(null)
  const handleBottomSheetOpen = () => bottomSheetRef.current?.expand()
  const handleBottomSheetClose = () => bottomSheetRef.current?.snapToIndex(0)

  // SHOW TOAST NOTIFICATION
  const [showToast, setShowToast] = useState(false)
  const [showToastError, setShowToastError] = useState(false)
  const [showToastError2, setShowToastError2] = useState(false)

  function handleDetails(id: string) {
    router.navigate("/details/" + id)
  }

  async function handleCreate() {
    try {
      const totalAsNumber = Number(total.toString().replace(",", "."))

      if (isNaN(totalAsNumber) || totalAsNumber <= 0) {
        // return Alert.alert("Erro", "Valor inválido.")
        return [
          setShowToastError(!showToastError),
          setTimeout(() => {
            setShowToastError(showToastError)
          }, 3000)
        ]
      }

      useGoal.create({ name, total: totalAsNumber })

      Keyboard.dismiss()
      handleBottomSheetClose()
      // Alert.alert("Sucesso", "Meta cadastrada!")
      setShowToast(!showToast)

      setTimeout(() => {
        setShowToast(showToast)
      }, 3000)

      setName("")
      setTotal("")

      fetchGoals()
    } catch (error) {
      // Alert.alert("Erro", "Não foi possível cadastrar.")
      console.log(error)
      
      setShowToastError2(!showToastError2),
      setTimeout(() => {
        setShowToastError2(showToastError2)
      }, 3000)
    }
  }

  async function fetchGoals() {
    try {
      const response = useGoal.all()
      setGoals(response)
    } catch (error) {
      console.log(error)
    }
  }

  async function fetchTransactions() {
    try {
      const response = useTransaction.findLatest()

      setTransactions(
        response.map((item) => ({
          ...item,
          date: dayjs(item.created_at).format("DD/MM/YYYY [às] HH:mm"),
        }))
      )
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchGoals()
    fetchTransactions()
  }, [])

  return (
    <View className="flex-1 p-8">
      <Header
        title="Suas metas"
        subtitle="Poupe hoje para colher os frutos amanhã."
      />

      <Goals
        goals={goals}
        onAdd={handleBottomSheetOpen}
        onPress={handleDetails}
      />

      <Transactions transactions={transactions} />

      <BottomSheet
        ref={bottomSheetRef}
        title="Nova meta"
        snapPoints={[0.01, 284]}
        onClose={handleBottomSheetClose}
      >
        <Input placeholder="Nome da meta" onChangeText={setName} value={name} />

        <Input
          placeholder="Valor"
          keyboardType="numeric"
          onChangeText={setTotal}
          value={total}
        />

        <Button title="Criar" onPress={handleCreate} />
      </BottomSheet>
      { showToast && <Alert closeAlert={async () => setShowToast(!showToast)} title={"Sucesso"} content={"Meta cadastrada!"} styleBg={alertStyle.green.body} styleTitle={alertStyle.green.title} styleContent={alertStyle.green.content} colorButton={colors.green[500]} />}
      { showToastError && <Alert closeAlert={async () => setShowToastError(!showToastError)} title={"Erro"} content={"Valor inválido."} styleBg={alertStyle.red.body} styleTitle={alertStyle.red.title} styleContent={alertStyle.red.content} colorButton={colors.red[500]} />}
      { showToastError2 && <Alert closeAlert={async () => setShowToastError2(!showToastError2)} title={"Erro"} content={"Não foi possível cadastrar."} styleBg={alertStyle.red.body} styleTitle={alertStyle.red.title} styleContent={alertStyle.red.content} colorButton={colors.red[500]} />}
    </View>
  )
}
