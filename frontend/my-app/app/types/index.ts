export interface User {
  id: string
  email: string
  createdAt: string
}

export interface Trade {
  id: string
  title: string
  amount: number
  status: "OPEN" | "COMPLETED" | "CANCELLED"
  createdAt: string
}