class CheckInHabitUseCase {
    constructor(habitRepository) {
        this.habitRepository = habitRepository;
    }

    async execute(habitId) {
        const habits = await this.habitRepository.getHabits();
        const habit = habits.find(h => h.id === habitId);
        if (!habit) {
            throw new Error("Habit not found");
        }

        const today = new Date().toISOString().split('T')[0];
        const lastCheckDate = habit.last_check ? new Date(habit.last_check).toISOString().split('T')[0] : null;

        if (today === lastCheckDate) {
            throw new Error("Habit already checked in today");
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDate = yesterday.toISOString().split('T')[0];

        if (lastCheckDate === yesterdayDate) {
            habit.streak = (habit.streak || 0) + 1;
        } else {
            habit.streak = 1;
        }
        habit.last_check = today;

        await this.habitRepository.updateHabit(habit);
        return habit;
    }
}

module.exports = { CheckInHabitUseCase };
