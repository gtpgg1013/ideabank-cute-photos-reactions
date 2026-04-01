const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

process.chdir(path.join(__dirname, ".."));

const { DATA_FILE, addReaction, buildPhotoPayload, buildRankings, ensureDataFile, writeStore } = require("../src/reaction-store");
const { photos, reactionTypes } = require("../src/photos");

test.beforeEach(() => {
  ensureDataFile();
  const initial = photos.reduce((acc, photo) => {
    acc[photo.id] = reactionTypes.reduce((reactionAcc, reaction) => {
      reactionAcc[reaction.id] = 0;
      return reactionAcc;
    }, {});
    return acc;
  }, {});
  writeStore(initial);
});

test("addReaction increments a specific reaction counter", () => {
  addReaction("peach-cat", "heart");
  const snapshot = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  assert.equal(snapshot["peach-cat"].heart, 1);
});

test("buildPhotoPayload calculates total reactions", () => {
  addReaction("peach-cat", "heart");
  addReaction("peach-cat", "like");
  const target = buildPhotoPayload().find((photo) => photo.id === "peach-cat");
  assert.equal(target.totalReactions, 2);
});

test("buildRankings sorts photos by total reactions", () => {
  addReaction("mint-puppy", "like");
  addReaction("mint-puppy", "like");
  addReaction("peach-cat", "heart");
  const rankings = buildRankings();
  assert.equal(rankings.topPhotos[0].id, "mint-puppy");
  assert.equal(rankings.reactionTotals[0].id, "like");
});
