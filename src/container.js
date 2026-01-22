const HabitAdapter = require('./adapters/habitAdapter');
const FileHabitRepo = require('./infrastructure/fileHabitRepo');

const createContainer = () => {
  let instances = new Map();

  const createInstance = (type, config = {}) => {
    const key = `${type}:${JSON.stringify(config)}`;
    if (instances.has(key)) {
      return instances.get(key);
    }

    const factoryMap = {
      fileHabitRepo: () => {
        const filePath = config.filePath || './data/habits.json';
        return new FileHabitRepo(filePath);
      },

      habitAdapter: () => {
        let repo = config.habitRepository;
        if (!repo) {
          if (config.repoType === 'file' || config.filePath) {
            repo = createInstance('fileHabitRepo', { filePath: config.filePath });
          } else {
            repo = createInstance('fileHabitRepo', {});
          }
        }
        return new HabitAdapter(repo);
      },
    };

    const factory = factoryMap[type];
    if (!factory) {
      throw new Error(`No factory registered for type: ${type}`);
    }

    const instance = factory();
    instances.set(key, instance);
    return instance;
  };

  // Public API
  return {
    getInstance: (type, config = {}) => createInstance(type, config),
    reset: () => instances.clear(),
  };
};

module.exports = createContainer();
