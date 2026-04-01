const photos = [
  {
    id: "peach-cat",
    title: "복숭아 쿠션 위 고양이",
    category: "고양이",
    mood: "낮잠",
    credit: "IdeaBank Studio",
    description: "복숭아빛 쿠션에 파묻혀 졸고 있는 말랑한 고양이",
    svg: "cat-peach.svg"
  },
  {
    id: "mint-puppy",
    title: "민트 스카프 강아지",
    category: "강아지",
    mood: "산책 준비",
    credit: "IdeaBank Studio",
    description: "민트 스카프를 두르고 눈을 반짝이는 강아지",
    svg: "puppy-mint.svg"
  },
  {
    id: "berry-bunny",
    title: "딸기 바구니 토끼",
    category: "토끼",
    mood: "수확",
    credit: "IdeaBank Studio",
    description: "딸기 바구니에 기대 앉아 포즈를 잡는 토끼",
    svg: "bunny-berry.svg"
  },
  {
    id: "cloud-hamster",
    title: "구름 침대 햄스터",
    category: "햄스터",
    mood: "휴식",
    credit: "IdeaBank Studio",
    description: "구름 모양 쿠션에 동그랗게 말린 햄스터",
    svg: "hamster-cloud.svg"
  },
  {
    id: "sunset-duck",
    title: "노을 연못 오리",
    category: "오리",
    mood: "산책",
    credit: "IdeaBank Studio",
    description: "주황빛 물결 위를 둥실 떠다니는 작은 오리",
    svg: "duck-sunset.svg"
  },
  {
    id: "cocoa-bear",
    title: "코코아 머그 곰돌이",
    category: "곰",
    mood: "간식",
    credit: "IdeaBank Studio",
    description: "따뜻한 코코아 머그잔 옆에서 미소 짓는 곰돌이",
    svg: "bear-cocoa.svg"
  }
];

const reactionTypes = [
  { id: "like", label: "좋아요", emoji: "👍" },
  { id: "heart", label: "하트", emoji: "❤️" },
  { id: "laugh", label: "웃음", emoji: "😂" }
];

function listCategories() {
  return [...new Set(photos.map((photo) => photo.category))];
}

module.exports = {
  photos,
  reactionTypes,
  listCategories
};
