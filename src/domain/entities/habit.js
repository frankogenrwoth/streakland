class Habit {
    constructor(id, name, last_check = null, streak = 0) {
      this.id = id;
      this.name = name;
      this.last_check = last_check;
      this.streak = streak;
    }

}

module.exports = Habit;

