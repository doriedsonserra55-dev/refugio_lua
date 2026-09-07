import { Redirect } from "expo-router";

export default function MuralRoute() {
    return <Redirect href={"/(tabs)/index" as never} />;
}