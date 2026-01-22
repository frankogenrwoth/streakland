const fs = require('fs');

class FileHabitRepo {
    constructor(filePath) {
        this.filePath = filePath || './data/habits.json';
        if (!fs.existsSync(this.filePath)) {
            fs.mkdirSync(require('path').dirname(this.filePath), { recursive: true });
            fs.writeFileSync(this.filePath, JSON.stringify([]));
        }
    }
    async addHabit(habit) {
        const habits = await this.getHabits();
        habits.push(habit);
        await this._saveHabits(habits);
        return habit;
    }
    async getHabits() {
        const fsPromise = fs.promises;
        const data = await fsPromise.readFile(this.filePath, 'utf-8');
        return JSON.parse(data || '[]');
    }
    async updateHabit(updatedHabit) {
        const habits = await this.getHabits();
        const index = habits.findIndex(habit => habit.id === updatedHabit.id);
        if (index !== -1) {
            habits[index] = updatedHabit;
            await this._saveHabits(habits);
            return updatedHabit;
        }
        return null;
    }
    async deleteHabit(habitId) {
        const habits = await this.getHabits();
        const filteredHabits = habits.filter(habit => habit.id !== habitId);
        await this._saveHabits(filteredHabits);
    }
    async _saveHabits(habits) {
        const fsP = require('fs').promises;
        await fsP.writeFile(this.filePath, JSON.stringify(habits, null, 2));
    }
}

module.exports = FileHabitRepo;
