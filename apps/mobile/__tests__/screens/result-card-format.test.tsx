import { buildResult, evaluateDish, tagsFor, type Dish } from '@potluck/engine';
import { dishes } from '@potluck/dishes';
import { screen } from '@testing-library/react-native';

import { ResultCard } from '@/components/result-card';

import { renderScreen } from '../../test-utils/render';

const base = dishes[0]!;
const pot = [
  {
    category: 'protein' as const,
    name: 'Chicken thighs',
    tags: tagsFor('protein', 'Chicken thighs'),
  },
];

function cardFor(dish: Dish) {
  return buildResult(evaluateDish(dish, pot, 0));
}

async function show(dish: Dish) {
  await renderScreen(
    <ResultCard
      card={cardFor(dish)}
      hero={false}
      onExplain={() => undefined}
      onMakeTonight={() => undefined}
      potSize={1}
      saved={false}
      stale={false}
    />,
  );
}

describe('the result card names how the dish is served', () => {
  test('a one-pot dish says so', async () => {
    await show({ ...base, format: 'pot' });
    expect(screen.getByText(/One pot/)).toBeTruthy();
  });

  test('a plated dish says it is a protein with two sides', async () => {
    await show({ ...base, format: 'plate' });
    expect(screen.getByText(/Protein \+ 2 sides/)).toBeTruthy();
  });
});
