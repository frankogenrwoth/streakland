class HabitAdapter {
  constructor(habitRepository) {
    this.habitRepository = habitRepository;
  }

  async addHabit(habit) {
    return this.habitRepository.addHabit(habit);
  }

  async getHabits() {
    return this.habitRepository.getHabits();
  }

  async updateHabit(habit) {
    return this.habitRepository.updateHabit(habit);
  }

  async deleteHabit(habitId) {
    return this.habitRepository.deleteHabit(habitId);
  }
}

module.exports = HabitAdapter;
