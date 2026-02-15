/**
 * Care plan types and hard-coded mock data (no Firestore/Storage).
 */

export type CarePlan = {
  dailyRoutine: { id: string; text: string }[];
  feelWeirdSteps: string[];
  medicines: { name: string; timeOfDay: string }[];
  helpers: { title: string; name?: string; note?: string }[];
  tips: string[];
  resources: { title: string; description: string; url: string }[];
};

export const carePlanMock: CarePlan = {
  dailyRoutine: [
    { id: '1', text: 'Take my morning medicine' },
    { id: '2', text: 'Eat a good breakfast' },
    { id: '3', text: 'Get enough sleep at night' },
    { id: '4', text: 'Drink plenty of water' },
    { id: '5', text: 'Tell a grown-up if I feel different' },
  ],
  feelWeirdSteps: [
    'Stay calm and find a safe place to sit or lie down.',
    'Tell a grown-up right away.',
    'Wear my medical ID so others know how to help.',
    'Rest until I feel better.',
  ],
  medicines: [
    { name: 'Medicine A', timeOfDay: 'Morning with breakfast' },
    { name: 'Medicine B', timeOfDay: 'Evening before bed' },
  ],
  helpers: [
    { title: 'My main caregiver', name: 'Mom', note: 'Always there when I need help.' },
    { title: 'My doctor', name: 'Dr. Smith', note: 'Helps keep me healthy.' },
    { title: 'School helper', name: 'Nurse Jane', note: 'At school if I feel weird.' },
  ],
  tips: [
    'Stick to your routine—it helps your body stay strong!',
    'Always tell a grown-up if something feels wrong.',
    'Drink water and eat healthy foods.',
    'Get good sleep so your brain can rest.',
  ],
  resources: [
    {
      title: 'Epilepsy Foundation',
      description: 'Learn more about staying safe and strong.',
      url: 'https://www.epilepsy.com',
    },
    {
      title: 'Kids Health',
      description: 'Fun facts about your brain and body.',
      url: 'https://kidshealth.org',
    },
  ],
};
