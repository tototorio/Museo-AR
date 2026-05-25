import { computed } from 'vue'

export function useGreeting(username: string) {
  const greeting = computed(() => {
    const hour = new Date().getHours() // 0-23, already in local timezone

    if (hour >= 5 && hour < 12)  return `Buenos días, ${username}`
    if (hour >= 12 && hour < 19) return `Buenas tardes, ${username}`
    return `Buenas noches, ${username}`
  })

  return { greeting }
}