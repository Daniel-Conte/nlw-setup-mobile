import "./src/lib/dayjs";
import { Button, StatusBar } from "react-native";
import * as Notifications from "expo-notifications";
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import Loading from "./src/components/Loading";
import Routes from "./src/routes";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  async function scheduleNotification() {
    const trigger = new Date(Date.now());
    trigger.setMinutes(trigger.getMinutes() + 1);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Habits 🤩",
        body: "Você praticou seus hábitos hoje?",
      },
      trigger,
    });
  }

  async function getScheduledNotifications() {
    const schedules = await Notifications.getAllScheduledNotificationsAsync();

    console.log(schedules);
  }

  async function cancelScheduledNotification() {
    const schedules = await Notifications.getAllScheduledNotificationsAsync();

    await Notifications.cancelScheduledNotificationAsync(
      schedules[0].identifier
    );
  }

  if (!fontsLoaded) return <Loading />;

  return (
    <>
      {/* <Button title="Enviar notificação" onPress={scheduleNotification} />
      <Button title="Agendadas" onPress={getScheduledNotifications} />
      <Button title="Cancelar" onPress={cancelScheduledNotification} /> */}
      <Routes />
      <StatusBar barStyle="light-content" translucent />
    </>
  );
}
