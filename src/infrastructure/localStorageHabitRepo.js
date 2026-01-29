const STORAGE_KEY_DEFAULT = 'streakland.habits';

class LocalStorageHabitRepo {
  constructor(storageKey) {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('LocalStorageHabitRepo requires a browser environment with localStorage');
    }
    this.storageKey = storageKey || STORAGE_KEY_DEFAULT;
  }

  async _read() {
    const raw = window.localStorage.getItem(this.storageKey);
    try {
      return JSON.parse(raw || '[]');
    } catch (e) {
      return [];
    }
  }

  async _write(habits) {
    window.localStorage.setItem(this.storageKey, JSON.stringify(habits));
  }

  async addHabit(habit) {
    const habits = await this.getHabits();
    habits.push(habit);
    await this._write(habits);
    return habit;
  }

  async getHabits() {
    return await this._read();
  }

  async updateHabit(updatedHabit) {
    const habits = await this.getHabits();
    const index = habits.findIndex(h => h.id === updatedHabit.id);
    if (index !== -1) {
      habits[index] = updatedHabit;
      await this._write(habits);
      return updatedHabit;
    }
    return null;
  }

  async deleteHabit(habitId) {
    const habits = await this.getHabits();
    const filtered = habits.filter(h => h.id !== habitId);
    await this._write(filtered);
  }
}

module.exports = LocalStorageHabitRepo;
