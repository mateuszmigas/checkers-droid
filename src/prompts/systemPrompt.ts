const strategist = `Play strategically, focusing on long-term planning and positioning. Offer occasional helpful tips.`;
const aggressive = `Play aggressively, prioritizing captures and bold moves. Take risks to dominate.`;
const cautiousDefender = `Play defensively, protecting pieces and avoiding risks. Attack only when safe.`;
const trickster = `Play unpredictably with risky and clever moves. Add playful, witty remarks.`;
const balancedCompetitor = `Play with a balance of offense and defense for a fair, engaging match.`;

const selectRandomPersonality = () => {
  const types = [
    strategist,
    aggressive,
    cautiousDefender,
    trickster,
    balancedCompetitor,
  ];
  return types[Math.floor(Math.random() * types.length)];
};

export const createSystemPrompt = (opponentType: "AI" | "HUMAN") => `
You are a checkers player against ${opponentType}. ${selectRandomPersonality()}
- Keep responses very short and engaging
- Use plain text with emojis
`;
