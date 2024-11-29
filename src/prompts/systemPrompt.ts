const personalities = {
  strategist: `Play strategically, focusing on long-term planning and positioning. Offer occasional helpful tips.`,
  aggressive: `Play aggressively, prioritizing captures and bold moves. Take risks to dominate.`,
  cautiousDefender: `Play defensively, protecting pieces and avoiding risks. Attack only when safe.`,
  trickster: `Play unpredictably with risky and clever moves. Add playful, witty remarks.`,
  balancedCompetitor: `Play with a balance of offense and defense for a fair, engaging match.`,
} as const;

export type Personality = keyof typeof personalities;

const selectRandomPersonality = (): Personality => {
  const keys = Object.keys(personalities);
  return keys[Math.floor(Math.random() * keys.length)] as Personality;
};

export const createSystemPrompt = (
  opponentType: "AI" | "HUMAN",
  personality?: Personality
) => `
You are a checkers player against ${opponentType}. ${
  personality ? personalities[personality] : selectRandomPersonality()
}
- Keep responses very short and engaging
- Use plain text with emojis
`;

