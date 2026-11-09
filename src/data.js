export const PRODUCTS = [
  {
    id: 'ethiopia-guji',
    name: 'Guji Halo',
    origin: 'Ethiopia',
    roast: 'Light',
    notes: ['Jasmine', 'Peach', 'Bergamot'],
    price: 19,
    color: '#e8cfa8',
    ink: '#1a0f0a',
    badge: 'Bestseller',
    description:
      'Washed heirloom lots from the Guji highlands. Floral, bright and tea-like with a long stone-fruit finish.',
  },
  {
    id: 'colombia-huila',
    name: 'Huila Pulse',
    origin: 'Colombia',
    roast: 'Medium',
    notes: ['Caramel', 'Red Apple', 'Cocoa'],
    price: 17,
    color: '#c98a4b',
    ink: '#1a0f0a',
    description:
      'A balanced everyday cup from smallholders in Huila. Juicy, sweet and endlessly drinkable.',
  },
  {
    id: 'kenya-nyeri',
    name: 'Nyeri Volt',
    origin: 'Kenya',
    roast: 'Light',
    notes: ['Blackcurrant', 'Grapefruit', 'Honey'],
    price: 22,
    color: '#a8484a',
    ink: '#f5e9d8',
    badge: 'Limited',
    description:
      'SL28 & SL34 varietals with electric acidity. A loud, juicy coffee for filter lovers.',
  },
  {
    id: 'brazil-cerrado',
    name: 'Cerrado Night',
    origin: 'Brazil',
    roast: 'Dark',
    notes: ['Dark Chocolate', 'Hazelnut', 'Molasses'],
    price: 16,
    color: '#2a1810',
    ink: '#d9a066',
    description:
      'Natural-process beans roasted deep for espresso. Heavy body, low acidity, built for milk.',
  },
  {
    id: 'guatemala-antigua',
    name: 'Antigua Ember',
    origin: 'Guatemala',
    roast: 'Medium',
    notes: ['Brown Sugar', 'Orange', 'Almond'],
    price: 18,
    color: '#d9a441',
    ink: '#1a0f0a',
    description:
      'Grown in volcanic soil around Antigua. Sweet, round and quietly complex.',
  },
  {
    id: 'volta-espresso',
    name: 'Volta Espresso',
    origin: 'Blend',
    roast: 'Dark',
    notes: ['Cacao Nib', 'Cherry', 'Toffee'],
    price: 20,
    color: '#8b5a3c',
    ink: '#f5e9d8',
    badge: 'New',
    description:
      'Our signature house blend. Syrupy shots with a cherry-bright edge that cuts through milk.',
  },
]

export const ROASTS = ['All', 'Light', 'Medium', 'Dark']
export const SIZES = [
  { label: '250g', mult: 1 },
  { label: '500g', mult: 1.8 },
  { label: '1kg', mult: 3.2 },
]
export const GRINDS = ['Whole Bean', 'Espresso', 'Filter', 'French Press']

export const PLANS = [
  { name: 'Spark', price: 18, bags: '1 bag / month', perks: ['Rotating single origin', 'Free shipping', 'Pause anytime'] },
  {
    name: 'Charge',
    price: 32,
    bags: '2 bags / month',
    perks: ['Pick any two coffees', 'Roasted within 48h', 'Members-only drops', 'Free shipping'],
    featured: true,
  },
  { name: 'Overdrive', price: 58, bags: '4 bags / month', perks: ['Office & family size', 'Priority limited lots', 'Brew gear discounts'] },
]

export const STEPS = [
  { n: '01', title: 'Source', text: 'Direct trade with 14 farms across 6 countries. We pay 2.4× Fairtrade minimum.' },
  { n: '02', title: 'Roast', text: 'Small-batch roasted every Monday & Thursday on a 15kg Loring.' },
  { n: '03', title: 'Ship', text: 'Packed in nitrogen-flushed bags and on your doorstep within 3 days of roasting.' },
  { n: '04', title: 'Brew', text: 'Every bag carries a recipe card dialed in by our head roaster.' },
]

export const REVIEWS = [
  { name: 'Maya R.', text: 'Guji Halo tastes like a peach orchard. I am ruined for supermarket coffee.' },
  { name: 'Tom K.', text: 'The subscription is flawless. Fresh beans, never late, easy to skip.' },
  { name: 'Lina S.', text: 'Volta Espresso pulls the most syrupy shots I have had at home.' },
  { name: 'Yassine B.', text: 'Packaging, flavor, website — everything about this brand feels premium.' },
  { name: 'Jo P.', text: 'Nyeri Volt is electric. Exactly as advertised.' },
]
