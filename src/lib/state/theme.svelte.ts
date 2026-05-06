type Theme = "light" | "dark" | "system"

interface UserTheme {
    value: Theme
}

export const themeData = $state<UserTheme>({ value: "light" })

export function toggleTheme() {
    themeData.value = themeData.value === "light" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", themeData.value === "dark");
}