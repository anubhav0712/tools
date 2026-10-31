import type {
  PassphraseGeneratorInput,
  PassphraseGeneratorOutput,
} from './definition';

// Curated list of high-entropy, recognizable English words (based on EFF Wordlists)
const WORDLIST = [
  'acorn', 'almond', 'anchor', 'angel', 'anthem', 'apron', 'archer', 'armor', 'arrow', 'artist',
  'atlas', 'avocado', 'bacon', 'badger', 'baker', 'balcony', 'bamboo', 'banner', 'barn', 'barrel',
  'basket', 'battery', 'beacon', 'beaver', 'beetle', 'biscuit', 'blanket', 'blender', 'blizzard', 'blossom',
  'blueberry', 'boiler', 'bonfire', 'bonnet', 'boulder', 'breeze', 'bridge', 'broccoli', 'bubble', 'bucket',
  'buffalo', 'cabin', 'cactus', 'camel', 'candle', 'canyon', 'canvas', 'captain', 'caramel', 'carpenter',
  'carrot', 'castle', 'catalyst', 'cedar', 'celery', 'champion', 'cheetah', 'cherry', 'chestnut', 'chimney',
  'cinnamon', 'circuit', 'citrus', 'clover', 'cobalt', 'coconut', 'compass', 'copper', 'coral', 'cradle',
  'crater', 'cricket', 'crystal', 'curtain', 'cypress', 'dancer', 'dawn', 'daylight', 'delta', 'dentist',
  'desert', 'diamond', 'dinosaur', 'dolphin', 'dragon', 'drawing', 'drummer', 'dust', 'eagle', 'echo',
  'eclipse', 'emerald', 'engine', 'envelope', 'equator', 'falcon', 'feather', 'ferret', 'festival', 'firefly',
  'flaming', 'flamingo', 'flint', 'flute', 'forest', 'fossil', 'fountain', 'fox', 'fragment', 'frost',
  'galaxy', 'garden', 'garlic', 'gecko', 'generator', 'glacier', 'glider', 'glow', 'granite', 'grape',
  'guitar', 'harbor', 'harmony', 'harvest', 'hawk', 'hazel', 'hedgehog', 'helmet', 'horizon', 'hummingbird',
  'hurricane', 'hydrant', 'icicle', 'iguana', 'island', 'jacket', 'jaguar', 'javelin', 'jellyfish', 'journey',
  'jungle', 'jupiter', 'kangaroo', 'kayak', 'kestrel', 'keyboard', 'kingfisher', 'kite', 'kitten', 'koala',
  'labyrinth', 'ladder', 'lantern', 'laptop', 'lava', 'lemon', 'leopard', 'lighthouse', 'lightning', 'lily',
  'lion', 'lizard', 'lobster', 'lotus', 'lynx', 'magnet', 'magnolia', 'mammoth', 'mandolin', 'mango',
  'marble', 'marigold', 'matrix', 'meadow', 'meteor', 'microscope', 'mineral', 'mirror', 'monarch', 'moonlight',
  'morning', 'mosaic', 'mountain', 'mushroom', 'nebula', 'nectar', 'needle', 'neon', 'nest', 'neutron',
  'nightingale', 'nitrogen', 'nomad', 'novel', 'oak', 'oasis', 'ocean', 'octopus', 'olive', 'onyx',
  'opal', 'orbit', 'orchid', 'origami', 'otter', 'owl', 'oxygen', 'paint', 'palette', 'palmtree',
  'panda', 'panther', 'papaya', 'paradise', 'parrot', 'pasture', 'peacock', 'pebble', 'pelican', 'penguin',
  'pepper', 'phoenix', 'piano', 'picnic', 'pilot', 'pinnacle', 'planet', 'platinum', 'polar', 'pollen',
  'popcorn', 'porcupine', 'prism', 'pyramid', 'quartz', 'quasar', 'rabbit', 'radar', 'rainbow', 'raven',
  'redwood', 'reef', 'reservoir', 'rhino', 'ripple', 'river', 'rocket', 'rover', 'ruby', 'saffron',
  'sailor', 'salmon', 'satellite', 'savanna', 'scalar', 'scarlet', 'scholar', 'scorpion', 'sculpture', 'seagull',
  'sequoia', 'shadow', 'sheriff', 'shield', 'ship', 'signal', 'silhouette', 'silver', 'skylight', 'snowdrift',
  'solar', 'sparrow', 'sphere', 'spiral', 'spring', 'squirrel', 'starfish', 'stream', 'summit', 'sunflower',
  'supernova', 'surfboard', 'swallow', 'swan', 'sycamore', 'talon', 'tangerine', 'tapestry', 'telescope', 'temple',
  'thistle', 'thunder', 'tiger', 'titanium', 'tornado', 'toucan', 'treasure', 'tulip', 'turbine', 'turtle',
  'umbrella', 'universe', 'valley', 'vanilla', 'velvet', 'vessel', 'viola', 'volcano', 'voyage', 'vulture',
  'walnut', 'walrus', 'warrior', 'waterfall', 'wave', 'willow', 'windsurfer', 'wizard', 'wolf', 'wombat',
  'woodpecker', 'zebra', 'zenith', 'zephyr', 'zircon'
];

function getSecureRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) return 0;
  const array = new Uint32Array(1);
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % maxExclusive);

  let rand: number;
  do {
    crypto.getRandomValues(array);
    rand = array[0];
  } while (rand >= limit);

  return rand % maxExclusive;
}

function calculateCrackTime(entropyBits: number): {
  grade: 'very_weak' | 'weak' | 'moderate' | 'strong' | 'very_strong';
  display: string;
} {
  if (entropyBits < 36) {
    return { grade: 'very_weak', display: 'A few seconds to crack' };
  }
  if (entropyBits < 56) {
    return { grade: 'weak', display: 'A few hours to several days' };
  }
  if (entropyBits < 80) {
    return { grade: 'moderate', display: 'Several months to centuries' };
  }
  if (entropyBits < 120) {
    return { grade: 'strong', display: 'Millions of years' };
  }
  return { grade: 'very_strong', display: 'Trillions of years (Uncrackable)' };
}

export function executePassphraseGenerator(
  input: PassphraseGeneratorInput
): PassphraseGeneratorOutput {
  const mode = input.mode || 'diceware';

  if (mode === 'diceware') {
    const wordCount = Math.max(3, Math.min(12, input.wordCount ?? 5));
    const separator = input.separator ?? '-';

    const selectedWords: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      const idx = getSecureRandomInt(WORDLIST.length);
      selectedWords.push(WORDLIST[idx]);
    }

    const generatedSecret = selectedWords.join(separator);
    // Shannon entropy for Diceware: wordCount * log2(wordlist size)
    const bitsPerWord = Math.log2(WORDLIST.length);
    const entropyBits = Math.round(wordCount * bitsPerWord);
    const { grade, display } = calculateCrackTime(entropyBits);

    return {
      isValid: true,
      generatedSecret,
      entropyBits,
      strengthGrade: grade,
      crackTimeDisplay: display,
    };
  }

  if (mode === 'hex_key') {
    const byteLength = Math.max(8, Math.min(128, input.byteLength ?? 32));
    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    const generatedSecret = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const entropyBits = byteLength * 8;
    const { grade, display } = calculateCrackTime(entropyBits);

    return {
      isValid: true,
      generatedSecret,
      entropyBits,
      strengthGrade: grade,
      crackTimeDisplay: display,
    };
  }

  if (mode === 'uuid') {
    // Generate UUID v4 via crypto.randomUUID or CSPRNG
    let generatedSecret = '';
    if (typeof crypto.randomUUID === 'function') {
      generatedSecret = crypto.randomUUID();
    } else {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant RFC 4122
      const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
      generatedSecret = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }

    return {
      isValid: true,
      generatedSecret,
      entropyBits: 122,
      strengthGrade: 'very_strong',
      crackTimeDisplay: 'Trillions of years (Uncrackable)',
    };
  }

  // mode === 'random_password'
  const length = Math.max(6, Math.min(128, input.passwordLength ?? 20));
  const incUpper = input.includeUppercase ?? true;
  const incLower = input.includeLowercase ?? true;
  const incNum = input.includeNumbers ?? true;
  const incSym = input.includeSymbols ?? true;
  const excludeAmbiguous = input.excludeAmbiguous ?? true;

  let upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  let numberChars = '0123456789';
  let symbolChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';

  if (excludeAmbiguous) {
    upperChars = upperChars.replace(/[OI]/g, '');
    lowerChars = lowerChars.replace(/[l]/g, '');
    numberChars = numberChars.replace(/[01]/g, '');
  }

  let charset = '';
  const requiredChars: string[] = [];

  if (incUpper) {
    charset += upperChars;
    requiredChars.push(upperChars[getSecureRandomInt(upperChars.length)]);
  }
  if (incLower) {
    charset += lowerChars;
    requiredChars.push(lowerChars[getSecureRandomInt(lowerChars.length)]);
  }
  if (incNum) {
    charset += numberChars;
    requiredChars.push(numberChars[getSecureRandomInt(numberChars.length)]);
  }
  if (incSym) {
    charset += symbolChars;
    requiredChars.push(symbolChars[getSecureRandomInt(symbolChars.length)]);
  }

  if (!charset) {
    return {
      isValid: false,
      error: 'Please select at least one character set (uppercase, lowercase, numbers, or symbols).',
      generatedSecret: '',
      entropyBits: 0,
      strengthGrade: 'very_weak',
      crackTimeDisplay: 'N/A',
    };
  }

  const resultChars: string[] = [...requiredChars];
  for (let i = resultChars.length; i < length; i++) {
    resultChars.push(charset[getSecureRandomInt(charset.length)]);
  }

  // Fisher-Yates shuffle
  for (let i = resultChars.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    [resultChars[i], resultChars[j]] = [resultChars[j], resultChars[i]];
  }

  const generatedSecret = resultChars.join('');
  const poolSize = charset.length;
  const entropyBits = Math.round(length * Math.log2(poolSize));
  const { grade, display } = calculateCrackTime(entropyBits);

  return {
    isValid: true,
    generatedSecret,
    entropyBits,
    strengthGrade: grade,
    crackTimeDisplay: display,
  };
}
