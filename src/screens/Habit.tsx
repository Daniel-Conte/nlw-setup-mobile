import { useRoute } from "@react-navigation/native";
import clsx from "clsx";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import BackButton from "../components/BackButton";
import Checkbox from "../components/Checkbox";
import HabitsEmpty from "../components/HabitsEmpty";
import Loading from "../components/Loading";
import ProgressBar from "../components/ProgressBar";
import { api } from "../lib/axios";
import generateProgressPercentage from "../utils/generate-progress-percentage";

interface Params {
  date: string;
}

interface DayInfo {
  completedHabits: string[];
  possibleHabits: {
    id: string;
    title: string;
    created_at: string;
  }[];
}

function Habit() {
  const [loading, setLoading] = useState(true);
  const [dayInfo, setDayInfo] = useState<DayInfo | null>(null);
  const route = useRoute();
  const { date } = route.params as Params;

  const parsedDate = dayjs(date);
  const dayOfWeek = parsedDate.format("dddd");
  const dayAndMonth = parsedDate.format("DD/MM");
  const isDateInPast = parsedDate.endOf("day").isBefore(new Date());

  const habitsProgress = dayInfo?.possibleHabits.length
    ? generateProgressPercentage(
        dayInfo.possibleHabits.length,
        dayInfo.completedHabits.length
      )
    : 0;

  useEffect(() => {
    fetchHabits();
  }, []);

  async function fetchHabits() {
    try {
      setLoading(true);

      const response = await api.get("/day", { params: { date } });

      setDayInfo(response.data);
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Ops",
        "Não foi possível carregar as informações dos hábitos"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleHabit(habitId: string) {
    try {
      await api.patch(`/habits/${habitId}/toggle`);

      if (dayInfo?.completedHabits.includes(habitId)) {
        setDayInfo((prev) => ({
          ...prev!,
          completedHabits: prev!.completedHabits.filter((id) => id !== habitId),
        }));
      } else {
        setDayInfo((prev) => ({
          ...prev!,
          completedHabits: [...prev!.completedHabits, habitId],
        }));
      }
    } catch (error) {
      console.log(error);

      Alert.alert("Ops", "Não foi possível atualizar o status do hábito");
    }
  }

  if (loading) return <Loading />;

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <BackButton />

        <Text className="mt-6 text-zinc-400 font-semibold text-base lowercase">
          {dayOfWeek}
        </Text>
        <Text className="text-white font-extrabold text-3xl">
          {dayAndMonth}
        </Text>

        <ProgressBar progress={habitsProgress} />

        <View className={clsx("mt-6", { "opacity-50": isDateInPast })}>
          {dayInfo?.possibleHabits.length ? (
            dayInfo.possibleHabits.map((habit) => (
              <Checkbox
                key={habit.id}
                title={habit.title}
                checked={dayInfo.completedHabits.includes(habit.id)}
                disabled={isDateInPast}
                onPress={() => handleToggleHabit(habit.id)}
              />
            ))
          ) : (
            <HabitsEmpty />
          )}
        </View>

        {isDateInPast && (
          <Text className="text-white mt-10 text-center">
            Você não pode editar hábitos de uma data passada
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

export default Habit;
