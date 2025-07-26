







export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export enum LogSource {
  GENERAL = 'GENERAL',
  HTTP = 'HTTP',
  API = 'API',
  AI = 'AI',
  PARSER = 'PARSER',
}

export enum DialogType {
  Settings = 'Settings',
  Terms = 'Terms',
  About = 'About',
  Console = 'Console',
  RANDOM_EVENT = 'RANDOM_EVENT',
  EDIT_CHARACTER = 'EDIT_CHARACTER',
  EDIT_WORLD = 'EDIT_WORLD',
  THEME = 'THEME',
  GENERATE_IMAGE = 'GENERATE_IMAGE',
  CONFIRM_DELETE = 'CONFIRM_DELETE',
  NEW_WORLD = 'NEW_WORLD',
  EDIT_RELATIONSHIP = 'EDIT_RELATIONSHIP',
  EDIT_POSSESSION = 'EDIT_POSSESSION',
  EDIT_WARDROBE = 'EDIT_WARDROBE',
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: LogSource;
  message: string;
  details?: any;
}

export enum AppMode {
  WORLD = 'World',
  CHARACTERS = 'Characters',
  GEMINI = 'Gemini',
  IMAGEN = 'Imagen',
  VISION = 'Vision',
}

export const VISION_FEATURES = [
    { id: 'FACE_DETECTION', label: 'Face Detection' },
    { id: 'TEXT_DETECTION', label: 'Text Detection (OCR)' },
    { id: 'DOCUMENT_TEXT_DETECTION', label: 'Document Text Detection' },
    { id: 'LABEL_DETECTION', label: 'Label Detection' },
    { id: 'LANDMARK_DETECTION', label: 'Landmark Detection' },
    { id: 'LOGO_DETECTION', label: 'Logo Detection' },
    { id: 'OBJECT_LOCALIZATION', label: 'Object Localization' },
    { id: 'SAFE_SEARCH_DETECTION', label: 'Safe Search' },
    { id: 'IMAGE_PROPERTIES', label: 'Image Properties' },
    { id: 'CROP_HINTS', label: 'Crop Hints' },
    { id: 'WEB_DETECTION', label: 'Web Detection' },
] as const;

export type VisionFeatureType = typeof VISION_FEATURES[number]['id'];

export enum KijkwijzerAgeRating {
    AL = 'AL',
    _6 = '6',
    _9 = '9',
    _12 = '12',
    _16 = '16',
}

export enum KijkwijzerPictogram {
    VIOLENCE = 'Violence',
    SEX = 'Sex',
    FEAR = 'Fear',
}

export interface KijkwijzerResult {
    age: KijkwijzerAgeRating;
    pictograms: KijkwijzerPictogram[];
}

export const GEMINI_MODELS = [
  // Deprecated models, added back per user request
  { family: 'Gemini', name: 'gemini-pro', status: 'Deprecated', description: 'The original Gemini Pro model for a wide variety of text and vision tasks. May not work as expected.' },
  { family: 'Gemini', name: 'gemini-1.5-pro', status: 'Deprecated', description: 'The next-generation model that builds upon Gemini Pro, with a 1M token context window. May not work as expected.' },
  { family: 'Gemini', name: 'gemini-1.5-flash', status: 'Deprecated', description: "A faster and lower-cost alternative to Gemini 1.5 Pro. May not work as expected." },
  
  // Existing stable models
  { family: 'Gemini', name: 'gemini-2.5-pro', status: 'Stable', description: 'Our most advanced reasoning model, capable of solving complex problems.' },
  { family: 'Gemini', name: 'gemini-2.5-flash', status: 'Stable', description: "Our thinking model that offers great, well-rounded capabilities. It's designed to offer a balance between price and performance." },
  { family: 'Gemini', name: 'gemini-embedding-001', status: 'Stable', description: 'Converts text data into vector representations for semantic search, classification, clustering, and similar tasks.' },
  
  // Existing active models
  { family: 'Gemini', name: 'gemini-2.0-flash', status: 'Active', description: 'Multimodal model with next-gen features and improved capabilities, including superior speed, built-in tool use, and a 1M token context window.' },
  { family: 'Gemini', name: 'gemini-2.0-flash-lite', status: 'Active', description: "Our fastest and most cost-efficient Flash model. It's an upgrade path for 1.5 Flash users who want better quality for the same price and speed." },
  { family: 'Gemini', name: 'gemini-2.0-flash-live-001', status: 'Active', description: 'Low-latency bidirectional voice and video interactions.' },
  
  // Existing preview models
  { family: 'Gemini', name: 'gemini-2.5-flash-lite-preview-06-17', status: 'Preview', description: 'Our most cost-efficient model supporting high throughput.' },
  { family: 'Gemini', name: 'gemini-2.5-flash-preview-native-audio-dialog', status: 'Preview', description: 'High quality, natural conversational audio outputs, with or without thinking.' },
  { family: 'Gemini', name: 'gemini-2.5-flash-preview-tts', status: 'Preview', description: 'Low latency, controllable, single- and multi-speaker text-to-speech audio generation.' },
  { family: 'Gemini', name: 'gemini-2.5-pro-preview-tts', status: 'Preview', description: 'Low latency, controllable, single- and multi-speaker text-to-speech audio generation.' },
  { family: 'Gemini', name: 'gemini-2.0-flash-preview-image-generation', status: 'Preview', description: 'Multimodal model that supports multimodal input and image output (conversational image generation and editing).' },
  { family: 'Gemini', name: 'gemini-live-2.5-flash-preview', status: 'Preview', description: 'Low-latency bidirectional voice and video interactions.' },
  
  // Experimental
  { family: 'Gemini', name: 'gemini-2.5-flash-exp-native-audio-thinking-dialog', status: 'Experimental', description: 'High quality, natural conversational audio outputs, with or without thinking.' },

  // --- Imagen Models ---
  { family: 'Imagen', name: 'imagen-2.0-generate', status: 'Deprecated', description: 'Legacy high quality image generation model. May not work as expected.' },
  { family: 'Imagen', name: 'imagen-3.0-generate-002', status: 'Stable', description: 'High quality image generation model.' },
  { family: 'Imagen', name: 'imagen-4.0-generate-preview-06-06', status: 'Preview', description: 'Our most up-to-date image generation model.' },
  { family: 'Imagen', name: 'imagen-4.0-ultra-generate-preview-06-06', status: 'Preview', description: 'Our most up-to-date image generation model with higher quality.' },
];

export interface Company {
    name: string;
    kvk?: string;
    vatId?: string;
    description: string;
    employees: string[];
}

export interface Employee {
    id: string;
    name: string;
    image: string;
    email: string;
    domain: string;
    function: string;
    jobDescription: string;
    relationships: {
        residence: string;
        romantic?: string[];
        family?: string[];
        professional?: string[];
        friendships?: string[];
    };
    appearance: string;
    personality: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'employee' | 'system';
    content: string;
    employeeId?: string;
    imageUrl?: string;
    imageAnalysis?: any;
    isGeneratingImage?: boolean;
}

export interface EmployeeState {
    emotionalState: EmotionalState;
}

export const emotionalStates = ['Neutral', 'Happy', 'Sad', 'Angry', 'Surprised', 'Focused', 'Creative', 'Curious'] as const;
export type EmotionalState = typeof emotionalStates[number];

export enum UserGender {
    FEMALE = 'Female',
    MALE = 'Male',
    NON_BINARY = 'Non-binary',
    NOT_SPECIFIED = 'Not specified',
}
export const USER_GENDERS = Object.values(UserGender);

export const AUTO_REPLY_INTERVALS = [
    { value: 5, label: '5s' }, { value: 10, label: '10s' }, { value: 15, label: '15s' }, { value: 30, label: '30s' }, { value: 60, label: '1m' }
];
export const AUTO_REPLY_CHANCES = [
    { value: 0.10, label: '10%' }, { value: 0.25, label: '25%' }, { value: 0.50, label: '50%' }, { value: 0.75, label: '75%' }, { value: 0.90, label: '90%' }, { value: 1.0, label: '100%' }
];
export type AutoReplyIntervalValue = typeof AUTO_REPLY_INTERVALS[number]['value'];
export type AutoReplyChanceValue = typeof AUTO_REPLY_CHANCES[number]['value'];


export const IMAGE_STYLES = ['Photorealistic', 'Cartoon', 'Watercolor', 'Oil Painting', 'Abstract', 'Pixel Art', 'Fantasy'] as const;
export type ImageStyle = typeof IMAGE_STYLES[number];

export const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'] as const;
export type AspectRatio = typeof ASPECT_RATIOS[number];

export interface ImagenConfig {
    aspectRatio: AspectRatio;
    style: ImageStyle;
}

export interface BodyPartDetail {
    Name: string;
    Descriptions: string[];
}

export interface BodyPart {
    Name: string;
    Details: BodyPartDetail[];
}

export interface Character {
    id: string;
    image?: string;
    Version: string;
    Created: string;
    Age: number;
    Worlds: string[];
    Name: {
        FirstName: string;
        Names: string[];
        LastName: string;
        MaidenName: string | null;
        Race: string;
        Gender: string;
    };
    Pronouns: string[];
    Sexuality: string;
    Size: {
        Height: number;
        Weight: number;
        BMI: number;
    };
    Birth: {
        BirthDateTime: string;
        BornCity: string;
        BornCountry: string;
        Nationality: string[];
    };
    IQ: number | null;
    Naked: string[];
    Story: string[];
    Notes: string[];
    Residence: string | null;
    BodyMarks: { Name: string; Location: string; Description: string; Details: string[] }[];
    BodyParts: BodyPart[];
    Relations: { Relation: string; FirstName: string; Names: string[]; LastName: string; MaidenName: string | null; Race: string; Gender: string }[];
    Personality: string[];
    Languages: string[];
    Favorites: { FavoriteAnimal: string | null; FavoriteColor: string | null; FavoriteDrink: string | null; FavoriteFood: string | null; FavoritePlant: string | null; };
    Advantages: string[];
    Disadvantages: string[];
    Skills: string[];
    Talents: string[];
    Employer: { Company: string; JobTitles: string[] }[];
    Possessions: { ItemType: string; Description: string[] }[];
    Dresses: { Usage: string[]; Items: { Type: string; Color: string | null; Style: string | null; Fabric: string | null; Size: string | null; Fit: string | null; }[] }[];
}
export type CharacterDetailType = 'Personality' | 'Skills' | 'Talents' | 'Advantages' | 'Disadvantages' | 'Possessions' | 'Dresses';

export interface CelestialObject { name: string; description: string; }
export interface GeographicFeature { name: string; description: string; }
export interface LandmarkFeature { name: string; type: string; location: string; description: string; }
export interface DiplomaticRelation { with: string; status: string; }
export interface Village { name: string; nearestTown: string; politicalSystem: string; }
export interface City { name: string; isCapital: boolean; politicalSystem: string; villages: Village[]; }
export interface Country { name: string; politicalSystem: string; diplomaticRelations: DiplomaticRelation[]; cities: City[]; }

export interface WorldTheme {
    technologyLevel: string;
    genericBackground: string;
    relationships: string;
    rules: string;
    specifics: string;
}

export interface World {
    id: string;
    name: string;
    headerImage?: string;
    style: string;
    theme: WorldTheme;
    calendar: { name: string; details: string; };
    technologyLevel: string;
    celestialObjects: {
        stars: CelestialObject[];
        planets: CelestialObject[];
        constellations: CelestialObject[];
        moons: CelestialObject[];
    };
    geography: {
        oceans: GeographicFeature[];
        seas: GeographicFeature[];
        rivers: GeographicFeature[];
        landmarks: LandmarkFeature[];
    };
    countries: Country[];
}

export interface EditTarget {
    characterId: string;
    index: number; // -1 for new item
}

export interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  openDialog: DialogType | null;
  showDialog: (dialog: DialogType | null) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  geminiModel: string;
  setGeminiModel: (model: string) => void;
  imagenModel: string;
  setImagenModel: (model: string) => void;
  logs: LogEntry[];
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearAndSaveLogs: () => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  userName: string;
  setUserName: (name: string) => void;
  userGender: UserGender;
  setUserGender: (gender: UserGender) => void;
  isNsfwMode: boolean;
  toggleNsfwMode: () => void;
  isBusy: boolean;
  busyMessage: string | null;

  // World State
  world: World;
  updateWorld: (updates: Partial<World>) => void;
  importWorld: (jsonContent: string) => Promise<void>;
  exportWorld: (format: 'json' | 'md' | 'html' | 'pdf') => void;
  isExportingWorldPdf: boolean;
  generateWorldHeaderImage: (prompt?: string) => Promise<void>;
  uploadWorldImage: (imageData: string) => void;
  removeWorldImage: () => void;
  generateNewWorld: (prompt: string) => Promise<void>;

  // Character State
  characters: Record<string, Character>;
  selectedCharacterId: string | null;
  isCharacterImageLoading: Record<string, boolean>;
  isEnhancingDetail: boolean;
  isExportingPdf: boolean;
  deletionTarget: string | 'all' | null;
  editTarget: EditTarget | null;
  setEditTarget: (target: EditTarget | null) => void;
  selectCharacter: (id: string | null) => void;
  createNewCharacter: () => Promise<void>;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  deleteAllCharacters: () => void;
  confirmDeletion: () => void;
  loadCharacters: (jsonContent: string) => void;
  saveAllCharacters: () => void;
  importCharacter: (jsonContent: string) => Promise<void>;
  importCharacterFromMarkdown: (markdownContent: string) => Promise<void>;
  exportCharacter: (id: string, format: 'json' | 'md' | 'html' | 'pdf') => void;
  generateCharacterImage: (id: string, customPrompt?: string) => Promise<void>;
  enhanceCharacterDetail: (id: string, detailType: CharacterDetailType) => Promise<void>;
  fixCharacterDetails: (id: string) => Promise<void>;

  // Vision State
  selectedImage: string | null;
  selectedFeatures: VisionFeatureType[];
  isLoading: boolean;
  resultMarkdown: string | null;
  resultJson: any | null;
  error: string | null;
  kijkwijzerResult: KijkwijzerResult | null;
  handleImageUpload: (imageData: string | null, file?: File) => void;
  handleFeatureChange: (feature: VisionFeatureType) => void;
  handleAnalyzeClick: () => void;
  sendImageToChat: (payload: { imageBase64: string; analysis?: any; prompt?: string }) => void;

  // Gemini State
  chatHistory: ChatMessage[];
  isGeminiLoading: boolean;
  allCompanies: Company[];
  allEmployees: Record<string, Employee>;
  selectedEmployees: string[];
  employeeStates: Record<string, EmployeeState>;
  thinkingEmployeeId: string[];
  isAutoReplyEnabled: boolean;
  setIsAutoReplyEnabled: (enabled: boolean) => void;
  autoReplyInterval: AutoReplyIntervalValue;
  setAutoReplyInterval: (value: AutoReplyIntervalValue) => void;
  autoReplyChance: AutoReplyChanceValue;
  setAutoReplyChance: (value: AutoReplyChanceValue) => void;
  startNewChat: () => void;
  sendGeminiMessage: (message: string) => void;
  toggleEmployeeSelection: (employeeId: string) => void;
  addMultipleEmployeesToSelection: (employeeIds: string[]) => void;
  setEmployeeState: (employeeId: string, state: EmployeeState) => void;
  saveChatHistory: () => void;
  sendEventMessage: (eventText: string) => void;
  continueGeminiConversation: () => void;
  stopGeminiResponse: () => void;
  
  // Imagen State
  imagenConfig: ImagenConfig;
  setImagenConfig: (config: ImagenConfig) => void;
  isImagenLoading: boolean;
  generatedImage: string | null;
  imagenPrompt: string | null;
  imagenError: string | null;
  generateImage: (prompt: string) => void;
  isVisionForImagenLoading: boolean;
  visionForImagenResult: string | null;
  visionForImagenJson: any | null;
  visionForImagenError: string | null;
  kijkwijzerForImagen: KijkwijzerResult | null;
}