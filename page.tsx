"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { toast, Toaster } from "react-hot-toast"
import {
  Moon,
  Sun,
  Flame,
  Beef,
  Wheat,
  Target,
  Trophy,
  Star,
  Zap,
  Heart,
  Timer,
  Shuffle,
  Gift,
  TrendingUp,
  User,
} from "lucide-react"

// Types
interface NutritionData {
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface WorkoutPlan {
  type: string
  exercises: string[]
  duration: number
  intensity: string
}

interface UserData {
  name: string
  dailyCalorieGoal: number
  currentStreak: number
  totalMealsLogged: number
  achievements: string[]
  frequentMeals: string[]
}

interface MealEntry {
  meal: string
  nutrition: NutritionData
  timestamp: Date
}

// Utility functions
const calculateNutrition = (meal: string): NutritionData => {
  // Simplified nutrition calculation based on common foods
  const mealLower = meal.toLowerCase()
  let calories = 0,
    protein = 0,
    carbs = 0,
    fat = 0

  // Basic food database
  const foods = {
    chicken: { cal: 165, prot: 31, carb: 0, fat: 3.6 },
    rice: { cal: 130, prot: 2.7, carb: 28, fat: 0.3 },
    broccoli: { cal: 34, prot: 2.8, carb: 7, fat: 0.4 },
    salmon: { cal: 208, prot: 22, carb: 0, fat: 12 },
    pasta: { cal: 131, prot: 5, carb: 25, fat: 1.1 },
    egg: { cal: 155, prot: 13, carb: 1.1, fat: 11 },
    bread: { cal: 265, prot: 9, carb: 49, fat: 3.2 },
    banana: { cal: 89, prot: 1.1, carb: 23, fat: 0.3 },
    apple: { cal: 52, prot: 0.3, carb: 14, fat: 0.2 },
    cheese: { cal: 113, prot: 7, carb: 1, fat: 9 },
    yogurt: { cal: 59, prot: 10, carb: 3.6, fat: 0.4 },
    oatmeal: { cal: 68, prot: 2.4, carb: 12, fat: 1.4 },
  }

  Object.entries(foods).forEach(([food, nutrition]) => {
    if (mealLower.includes(food)) {
      calories += nutrition.cal
      protein += nutrition.prot
      carbs += nutrition.carb
      fat += nutrition.fat
    }
  })

  // Default values if no matches
  if (calories === 0) {
    calories = 300 + Math.random() * 200
    protein = 15 + Math.random() * 10
    carbs = 30 + Math.random() * 20
    fat = 10 + Math.random() * 8
  }

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
  }
}

const generateWorkout = (nutrition: NutritionData, goal: string): WorkoutPlan => {
  const workouts = {
    Balance: {
      type: "Balanced Training",
      exercises: ["20 Push-ups", "30 Squats", "1-minute Plank", "15 Burpees", "20 Mountain Climbers"],
      duration: 25,
      intensity: "Moderate",
    },
    "Burn Fat": {
      type: "Fat Burning HIIT",
      exercises: ["30 Jumping Jacks", "20 High Knees", "15 Burpees", "30 Mountain Climbers", "20 Jump Squats"],
      duration: 30,
      intensity: "High",
    },
    "Build Muscle": {
      type: "Strength Training",
      exercises: ["25 Push-ups", "20 Pike Push-ups", "30 Squats", "15 Diamond Push-ups", "20 Lunges (each leg)"],
      duration: 35,
      intensity: "High",
    },
  }

  return workouts[goal as keyof typeof workouts] || workouts["Balance"]
}

const getCoachMessage = (goal: string, nutrition: NutritionData): string => {
  const messages = {
    Balance: [
      "Perfect! Let's maintain that beautiful balance! 🌟",
      "Your body is a temple - let's keep it strong and balanced! 💪",
      "Balanced nutrition calls for balanced movement! Let's go! 🎯",
    ],
    "Burn Fat": [
      "Time to turn up the heat and melt those calories! 🔥",
      "Let's torch those calories with some high-intensity fun! ⚡",
      "Your fat-burning journey starts now - let's ignite it! 🚀",
    ],
    "Build Muscle": [
      "Time to build that strength and sculpt those muscles! 💪",
      "Let's turn that protein into pure power! 🏋️‍♂️",
      "Muscle-building mode activated - let's get swole! 💥",
    ],
  }

  const goalMessages = messages[goal as keyof typeof messages] || messages["Balance"]
  return goalMessages[Math.floor(Math.random() * goalMessages.length)]
}

const getBadges = (nutrition: NutritionData, totalMeals: number): string[] => {
  const badges = []

  if (nutrition.protein > 25) badges.push("Protein Champ 🥩")
  if (nutrition.carbs > 40) badges.push("Carb Overlord 🍞")
  if (nutrition.fat > 15) badges.push("Fat Fighter 🥑")
  if (nutrition.calories > 500) badges.push("Calorie Crusher 🔥")
  if (totalMeals >= 10) badges.push("Meal Master 🍽️")
  if (totalMeals >= 50) badges.push("Nutrition Ninja 🥷")

  return badges
}

const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

const fitnessTips = [
  "💡 Drink water before, during, and after your workout!",
  "🌟 Consistency beats perfection - small steps lead to big changes!",
  "🔥 Your body can do it - it's your mind you need to convince!",
  "💪 Progress, not perfection, is the goal!",
  "⚡ The best workout is the one you actually do!",
  "🎯 Set small, achievable goals and celebrate every victory!",
  "🌈 Mix up your workouts to keep things fun and engaging!",
  "🧘‍♀️ Rest days are just as important as workout days!",
]

// Skeleton components
const NutritionSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
    </div>
  </div>
)

const WorkoutSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
      ))}
    </div>
  </div>
)

export default function MealWorkoutApp() {
  // State management
  const [darkMode, setDarkMode] = useState(false)
  const [meal, setMeal] = useState("")
  const [fitnessGoal, setFitnessGoal] = useState("Balance")
  const [nutrition, setNutrition] = useState<NutritionData | null>(null)
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null)
  const [coachMessage, setCoachMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isCountdownActive, setIsCountdownActive] = useState(false)
  const [userData, setUserData] = useState<UserData>({
    name: "",
    dailyCalorieGoal: 2000,
    currentStreak: 0,
    totalMealsLogged: 0,
    achievements: [],
    frequentMeals: [],
  })
  const [dailyIntake, setDailyIntake] = useState(0)
  const [currentTip, setCurrentTip] = useState(0)
  const [cheatMeal, setCheatMeal] = useState("")
  const [cheatWorkout, setCheatWorkout] = useState<WorkoutPlan | null>(null)
  const [isRoulette, setIsRoulette] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Declare fitnessTypes variable
  const fitnessTypes = fitnessTips

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUserData = localStorage.getItem("mealWorkoutUserData")
    const savedDailyIntake = localStorage.getItem("dailyIntake")
    const savedDarkMode = localStorage.getItem("darkMode")

    if (savedUserData) {
      setUserData(JSON.parse(savedUserData))
    }
    if (savedDailyIntake) {
      setDailyIntake(Number.parseInt(savedDailyIntake))
    }
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode))
    }
  }, [])

  // Save data to localStorage
  const saveUserData = useCallback((data: UserData) => {
    localStorage.setItem("mealWorkoutUserData", JSON.stringify(data))
    setUserData(data)
  }, [])

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode))
  }, [darkMode])

  // Fitness tip rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % fitnessTips.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // Countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isCountdownActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    } else if (countdown === 0 && isCountdownActive) {
      setIsCountdownActive(false)
      setShowConfetti(true)
      toast.success("🎉 Workout completed! Great job!")
      setTimeout(() => setShowConfetti(false), 3000)
    }
    return () => clearInterval(interval)
  }, [countdown, isCountdownActive])

  // Handle meal analysis
  const analyzeMeal = async () => {
    if (!meal.trim()) {
      toast.error("Please enter a meal first!")
      return
    }

    setIsLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const nutritionData = calculateNutrition(meal)
    const workoutPlan = generateWorkout(nutritionData, fitnessGoal)
    const message = getCoachMessage(fitnessGoal, nutritionData)

    setNutrition(nutritionData)
    setWorkout(workoutPlan)
    setCoachMessage(message)
    setIsLoading(false)

    // Update user data
    const newTotalMeals = userData.totalMealsLogged + 1
    const newDailyIntake = dailyIntake + nutritionData.calories
    const newBadges = getBadges(nutritionData, newTotalMeals)
    const newFrequentMeals = [...userData.frequentMeals]

    if (!newFrequentMeals.includes(meal) && newFrequentMeals.length < 5) {
      newFrequentMeals.push(meal)
    }

    const updatedUserData = {
      ...userData,
      totalMealsLogged: newTotalMeals,
      achievements: [...new Set([...userData.achievements, ...newBadges])],
      frequentMeals: newFrequentMeals,
      currentStreak: newTotalMeals % 3 === 0 ? userData.currentStreak + 1 : userData.currentStreak,
    }

    saveUserData(updatedUserData)
    setDailyIntake(newDailyIntake)
    localStorage.setItem("dailyIntake", newDailyIntake.toString())

    toast.success("Meal analyzed successfully! 🍽️")
  }

  // Handle workout roulette
  const spinWorkoutRoulette = () => {
    setIsRoulette(true)
    const goals = ["Balance", "Burn Fat", "Build Muscle"]
    const randomGoal = goals[Math.floor(Math.random() * goals.length)]

    setTimeout(() => {
      setFitnessGoal(randomGoal)
      if (nutrition) {
        const newWorkout = generateWorkout(nutrition, randomGoal)
        const newMessage = getCoachMessage(randomGoal, nutrition)
        setWorkout(newWorkout)
        setCoachMessage(newMessage)
      }
      setIsRoulette(false)
      toast.success(`🎰 Roulette selected: ${randomGoal}!`)
    }, 2000)
  }

  // Handle cheat meal calculation
  const calculateCheatWorkout = () => {
    if (!cheatMeal.trim()) {
      toast.error("Please enter a cheat meal first!")
      return
    }

    const cheatNutrition = calculateNutrition(cheatMeal)
    const burnWorkout = generateWorkout(cheatNutrition, "Burn Fat")
    setCheatWorkout(burnWorkout)
    toast.success("Cheat meal workout calculated! 🔥")
  }

  // Handle burn this meal
  const burnThisMeal = () => {
    if (!workout) {
      toast.error("Please analyze a meal first!")
      return
    }

    setCountdown(workout.duration * 60) // Convert minutes to seconds
    setIsCountdownActive(true)

    // Save to localStorage
    const workoutEntry = {
      meal,
      workout,
      timestamp: new Date().toISOString(),
    }
    const savedWorkouts = JSON.parse(localStorage.getItem("completedWorkouts") || "[]")
    savedWorkouts.push(workoutEntry)
    localStorage.setItem("completedWorkouts", JSON.stringify(savedWorkouts))

    toast.success("Workout timer started! 🔥")
  }

  // Pie chart data
  const pieData = nutrition
    ? [
        { name: "Protein", value: nutrition.protein, color: "#E6A85C" },
        { name: "Carbs", value: nutrition.carbs, color: "#007BA7" },
        { name: "Fat", value: nutrition.fat, color: "#A67B8A" },
      ]
    : []

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-cerulean-50 via-marigold-50 to-dusty-mauve-50"
      }`}
    >
      <Toaster position="top-right" />

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 bg-gradient-to-r from-marigold-400 to-cerulean-400 opacity-20 animate-pulse"></div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cerulean-600 to-marigold-500 bg-clip-text text-transparent">
              FitFuel Coach
            </h1>
            <p className="text-olive-smoke-600 dark:text-olive-smoke-300 mt-1">
              {getTimeBasedGreeting()}
              {userData.name && `, ${userData.name}`}! Transform meals into movement 🚀
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Streak Counter */}
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2">
              <Star className="w-4 h-4 text-marigold-500" />
              <span className="text-sm font-medium">{userData.currentStreak} day streak</span>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-2">
              <Sun className="w-4 h-4" />
              <Switch checked={darkMode} onCheckedChange={setDarkMode} aria-label="Toggle dark mode" />
              <Moon className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* User Setup */}
        {!userData.name && (
          <Card className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg animate-bounce-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Welcome! Let's get you set up
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={userData.name}
                    onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="calorie-goal">Daily Calorie Goal</Label>
                  <Input
                    id="calorie-goal"
                    type="number"
                    placeholder="2000"
                    value={userData.dailyCalorieGoal}
                    onChange={(e) =>
                      setUserData((prev) => ({ ...prev, dailyCalorieGoal: Number.parseInt(e.target.value) || 2000 }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <Button
                onClick={() => saveUserData(userData)}
                className="w-full bg-gradient-to-r from-cerulean-500 to-marigold-500 hover:from-cerulean-600 hover:to-marigold-600"
                disabled={!userData.name.trim()}
              >
                Get Started! 🚀
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Daily Progress */}
        {userData.name && (
          <Card className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg animate-slide-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Daily Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>
                      Calories: {dailyIntake} / {userData.dailyCalorieGoal}
                    </span>
                    <span>{Math.round((dailyIntake / userData.dailyCalorieGoal) * 100)}%</span>
                  </div>
                  <Progress value={(dailyIntake / userData.dailyCalorieGoal) * 100} className="h-2" />
                </div>

                <div className="flex justify-between text-sm">
                  <span>Meals logged today: {userData.totalMealsLogged % 3}/3</span>
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (userData.totalMealsLogged % 3) ? "text-marigold-500 fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Meal Input */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Meal Analysis
                </CardTitle>
                <CardDescription>Tell us what you ate and we'll create the perfect workout!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Fitness Goal Selection */}
                <div>
                  <Label htmlFor="fitness-goal">Fitness Goal</Label>
                  <Select value={fitnessGoal} onValueChange={setFitnessGoal}>
                    <SelectTrigger id="fitness-goal" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Balance">⚖️ Balance</SelectItem>
                      <SelectItem value="Burn Fat">🔥 Burn Fat</SelectItem>
                      <SelectItem value="Build Muscle">💪 Build Muscle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Meal Input */}
                <div>
                  <Label htmlFor="meal">What did you eat?</Label>
                  <Textarea
                    id="meal"
                    placeholder="e.g., Grilled chicken with rice and broccoli"
                    value={meal}
                    onChange={(e) => setMeal(e.target.value)}
                    className="mt-1 min-h-[100px]"
                    aria-describedby="meal-help"
                  />
                  <p id="meal-help" className="text-xs text-olive-smoke-600 dark:text-olive-smoke-400 mt-1">
                    Be as detailed as possible for better recommendations
                  </p>
                </div>

                {/* Frequent Meals Suggestions */}
                {userData.frequentMeals.length > 0 && (
                  <div>
                    <Label>Quick Suggestions</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {userData.frequentMeals.map((frequentMeal, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setMeal(frequentMeal)}
                          className="text-xs bg-white/50 hover:bg-white/80"
                        >
                          {frequentMeal}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={analyzeMeal}
                  disabled={isLoading || !meal.trim()}
                  className="w-full bg-gradient-to-r from-cerulean-500 to-marigold-500 hover:from-cerulean-600 hover:to-marigold-600 transition-all duration-300 hover:scale-105"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Analyze Meal
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Nutrition Info */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Nutrition Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <NutritionSkeleton />
                ) : nutrition ? (
                  <div className="space-y-4 animate-fade-in">
                    {/* Macros Display */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gradient-to-br from-marigold-100 to-marigold-200 dark:from-marigold-800 dark:to-marigold-900 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Flame className="w-4 h-4 text-marigold-600" />
                          <span className="text-xs font-medium">Calories</span>
                        </div>
                        <div className="text-lg font-bold text-marigold-700 dark:text-marigold-300">
                          {nutrition.calories}
                        </div>
                      </div>

                      <div className="text-center p-3 bg-gradient-to-br from-cerulean-100 to-cerulean-200 dark:from-cerulean-800 dark:to-cerulean-900 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Beef className="w-4 h-4 text-cerulean-600" />
                          <span className="text-xs font-medium">Protein</span>
                        </div>
                        <div className="text-lg font-bold text-cerulean-700 dark:text-cerulean-300">
                          {nutrition.protein}g
                        </div>
                      </div>

                      <div className="text-center p-3 bg-gradient-to-br from-dusty-mauve-100 to-dusty-mauve-200 dark:from-dusty-mauve-800 dark:to-dusty-mauve-900 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Wheat className="w-4 h-4 text-dusty-mauve-600" />
                          <span className="text-xs font-medium">Carbs</span>
                        </div>
                        <div className="text-lg font-bold text-dusty-mauve-700 dark:text-dusty-mauve-300">
                          {nutrition.carbs}g
                        </div>
                      </div>

                      <div className="text-center p-3 bg-gradient-to-br from-olive-smoke-100 to-olive-smoke-200 dark:from-olive-smoke-800 dark:to-olive-smoke-900 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <span className="text-sm">🥑</span>
                          <span className="text-xs font-medium">Fat</span>
                        </div>
                        <div className="text-lg font-bold text-olive-smoke-700 dark:text-olive-smoke-300">
                          {nutrition.fat}g
                        </div>
                      </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) => [`${value}g`, name]}
                            contentStyle={{
                              backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                              border: "none",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-olive-smoke-500">
                    <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Enter a meal to see nutrition breakdown</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Achievements */}
            {userData.achievements.length > 0 && (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg animate-bounce-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {userData.achievements.map((achievement, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-gradient-to-r from-marigold-200 to-cerulean-200 text-gray-800 hover:scale-105 transition-transform"
                      >
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Workout Plan */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Workout Plan
                    </CardTitle>
                    {workout && (
                      <CardDescription>
                        {workout.type} • {workout.duration} min • {workout.intensity} intensity
                      </CardDescription>
                    )}
                  </div>

                  {nutrition && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={spinWorkoutRoulette}
                      disabled={isRoulette}
                      className="bg-white/50 hover:bg-white/80"
                    >
                      {isRoulette ? (
                        <div className="animate-spin-slow">
                          <Shuffle className="w-4 h-4" />
                        </div>
                      ) : (
                        <>
                          <Shuffle className="w-4 h-4 mr-1" />
                          Roulette
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <WorkoutSkeleton />
                ) : workout ? (
                  <div className="space-y-4 animate-fade-in">
                    {/* Workout Animation Placeholder */}
                    <div className="bg-gradient-to-br from-cerulean-100 to-marigold-100 dark:from-cerulean-900 dark:to-marigold-900 rounded-lg p-6 text-center">
                      <div className="text-4xl mb-2">
                        {fitnessGoal === "Burn Fat" ? "🏃‍♂️" : fitnessGoal === "Build Muscle" ? "🏋️‍♂️" : "🧘‍♂️"}
                      </div>
                      <p className="text-sm text-olive-smoke-600 dark:text-olive-smoke-400">{workout.type}</p>
                    </div>

                    {/* Exercise List */}
                    <div className="space-y-2">
                      {workout.exercises.map((exercise, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-700/50 dark:to-gray-700/30 rounded-lg hover:scale-105 transition-transform"
                        >
                          <div className="w-6 h-6 bg-cerulean-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="flex-1">{exercise}</span>
                        </div>
                      ))}
                    </div>

                    {/* Coach Message */}
                    {coachMessage && (
                      <div className="bg-gradient-to-r from-marigold-100 to-dusty-mauve-100 dark:from-marigold-900 dark:to-dusty-mauve-900 p-4 rounded-lg border-l-4 border-marigold-500">
                        <p className="text-sm font-medium text-marigold-800 dark:text-marigold-200">
                          💬 Coach says: {coachMessage}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        onClick={burnThisMeal}
                        disabled={isCountdownActive}
                        className="bg-gradient-to-r from-marigold-500 to-cerulean-500 hover:from-marigold-600 hover:to-cerulean-600 transition-all duration-300 hover:scale-105"
                      >
                        {isCountdownActive ? (
                          <>
                            <Timer className="w-4 h-4 mr-2" />
                            {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                          </>
                        ) : (
                          <>
                            <Flame className="w-4 h-4 mr-2" />
                            Burn This Meal
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowConfetti(true)
                          toast.success("🎉 Workout completed! Amazing work!")
                          setTimeout(() => setShowConfetti(false), 3000)
                        }}
                        className="bg-white/50 hover:bg-white/80"
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        Complete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-olive-smoke-500">
                    <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Analyze a meal to get your personalized workout</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cheat Meal Calculator */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Cheat Meal Calculator
                </CardTitle>
                <CardDescription>Had a cheat meal? Let's burn it off! 🔥</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cheat-meal">What was your cheat meal?</Label>
                  <Input
                    id="cheat-meal"
                    placeholder="e.g., Large pizza slice"
                    value={cheatMeal}
                    onChange={(e) => setCheatMeal(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={calculateCheatWorkout}
                  disabled={!cheatMeal.trim()}
                  className="w-full bg-gradient-to-r from-dusty-mauve-500 to-olive-smoke-500 hover:from-dusty-mauve-600 hover:to-olive-smoke-600"
                >
                  Calculate Burn Workout
                </Button>

                {cheatWorkout && (
                  <div className="space-y-2 animate-fade-in">
                    <Separator />
                    <h4 className="font-semibold text-sm">Recommended Burn Workout:</h4>
                    {cheatWorkout.exercises.map((exercise, index) => (
                      <div key={index} className="text-sm p-2 bg-dusty-mauve-50 dark:bg-dusty-mauve-900 rounded">
                        • {exercise}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Daily Fitness Tip */}
        <Card className="mt-6 bg-gradient-to-r from-cerulean-100 to-marigold-100 dark:from-cerulean-900 dark:to-marigold-900 border-0 shadow-lg animate-fade-in">
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="font-semibold text-cerulean-800 dark:text-cerulean-200 mb-2">💡 Daily Fitness Tip</h3>
              <p className="text-sm text-cerulean-700 dark:text-cerulean-300 transition-all duration-500">
                {fitnessTypes[currentTip]}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
