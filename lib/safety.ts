const criticalExpressions = [
  "quero morrer",
  "não quero mais viver",
  "nao quero mais viver",
  "tirar minha vida",
  "acabar com minha vida",
  "vou me matar",
  "me matar",
  "suicídio",
  "suicidio",
];

export function needsImmediateSupport(text: string) {
  const normalized = text.toLocaleLowerCase("pt-BR");
  return criticalExpressions.some((expression) => normalized.includes(expression));
}
