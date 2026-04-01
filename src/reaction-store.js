const fs = require("node:fs");
const path = require("node:path");
const { photos, reactionTypes } = require("./photos");

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "reactions.json");

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    const initial = photos.reduce((acc, photo) => {
      acc[photo.id] = reactionTypes.reduce((reactionAcc, reaction) => {
        reactionAcc[reaction.id] = 0;
        return reactionAcc;
      }, {});
      return acc;
    }, {});

    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
  }
}

function readStore() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeStore(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function getReactionSnapshot() {
  return readStore();
}

function addReaction(photoId, reactionId) {
  const store = readStore();
  if (!store[photoId]) {
    throw new Error("Unknown photo ID");
  }
  if (typeof store[photoId][reactionId] !== "number") {
    throw new Error("Unknown reaction ID");
  }
  store[photoId][reactionId] += 1;
  writeStore(store);
  return store[photoId];
}

function buildPhotoPayload() {
  const store = readStore();
  return photos.map((photo) => {
    const reactions = store[photo.id];
    const totalReactions = Object.values(reactions).reduce((sum, value) => sum + value, 0);
    return {
      ...photo,
      reactions,
      totalReactions
    };
  });
}

function buildRankings() {
  const photoPayload = buildPhotoPayload();
  const topPhotos = [...photoPayload].sort((a, b) => b.totalReactions - a.totalReactions).slice(0, 3);
  const reactionTotals = reactionTypes.map((reaction) => ({
    ...reaction,
    count: photoPayload.reduce((sum, photo) => sum + photo.reactions[reaction.id], 0)
  })).sort((a, b) => b.count - a.count);

  return {
    topPhotos,
    reactionTotals
  };
}

module.exports = {
  DATA_FILE,
  addReaction,
  buildPhotoPayload,
  buildRankings,
  ensureDataFile,
  getReactionSnapshot,
  writeStore
};
