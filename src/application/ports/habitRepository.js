class IHabit {
  constructor() {
    if (new.target === IHabit) {
      throw new TypeError("Cannot construct HabitRepository instances directly");
    }
  }
  
  async addHabit(habit) {
    throw new Error("Method 'addHabit(habit)' must be implemented.");
  }

  async getHabits() {
    throw new Error("Method 'getHabits()' must be implemented.");
  }

  async updateHabit(habit) {
    throw new Error("Method 'updateHabit(habit)' must be implemented.");
  }

  async deleteHabit(habitId) {
    throw new Error("Method 'deleteHabit(habitId)' must be implemented.");
  }
}

module.exports = IHabit;
