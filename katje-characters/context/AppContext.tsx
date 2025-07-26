









import React, { createContext, use, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DialogType, LogEntry, LogLevel, LogSource, AppMode, VisionFeatureType, VISION_FEATURES, ChatMessage, KijkwijzerResult, ImagenConfig, AspectRatio, Company, Employee, EmployeeState, EmotionalState, emotionalStates, UserGender, AutoReplyIntervalValue, AutoReplyChanceValue, ImageStyle, AUTO_REPLY_CHANCES, AUTO_REPLY_INTERVALS, USER_GENDERS, Character, AppContextType, CharacterDetailType, World, Country, EditTarget } from '../types';
import { parseVisionResponse } from '../services/visionService';
import { mapVisionToKijkwijzer } from '../utils/kijkwijzerMapper';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Type } from '@google/genai';
import { parseEmployeesMd } from '../utils/markdownParser';
import { exportToHtml, exportToMarkdown } from '../utils/characterExporter';
import { exportWorldToHtml, exportWorldToMarkdown } from '../utils/worldExporter';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as ReactDOM from 'react-dom/client';
import CharacterSheet from '../components/characters/CharacterSheet';
import WorldSheet from '../components/characters/WorldSheet';


const AppContext = createContext<AppContextType | undefined>(undefined);

const getApiErrorMessage = (error: any, service: 'Vision' | 'Gemini' | 'Imagen' | 'Character Gen' | 'World Gen'): string => {
  let message = error.message || `An unknown error occurred in the ${service} service.`;
  const lowerCaseMessage = (message + (error.toString ? error.toString() : '')).toLowerCase();
  
  if (lowerCaseMessage.includes('api key not valid') 
   || lowerCaseMessage.includes('api_key_invalid')
   || lowerCaseMessage.includes('api key is required')
  ) {
    message = 'API Key is not valid or is missing. Please go to the Settings dialog to enter a valid key.';
  } else if (lowerCaseMessage.includes('permission denied')) {
     message = `Permission denied for the ${service} API. Please check if the API is enabled in your Google Cloud project and that the key has the correct permissions.`;
  }
  return message;
};

const truncateForLog = (value: any, maxLength = 200): any => {
    if (typeof value === 'string' && value.length > maxLength * 2) {
        return value.substring(0, maxLength) + `... (truncated, original length: ${value.length})`;
    }
    return value;
};

const characterResponseSchema = {
  type: Type.OBJECT,
  properties: {
    Version: { type: Type.STRING },
    Created: { type: Type.STRING },
    Age: { type: Type.INTEGER },
    Worlds: { type: Type.ARRAY, items: { type: Type.STRING } },
    Name: {
      type: Type.OBJECT,
      properties: {
        FirstName: { type: Type.STRING },
        Names: { type: Type.ARRAY, items: { type: Type.STRING } },
        LastName: { type: Type.STRING },
        MaidenName: { type: Type.STRING },
        Race: { type: Type.STRING },
        Gender: { type: Type.STRING },
      },
      required: ["FirstName", "LastName", "Race", "Gender"]
    },
    Pronouns: { type: Type.ARRAY, items: { type: Type.STRING } },
    Sexuality: { type: Type.STRING },
    Size: {
      type: Type.OBJECT,
      properties: {
        Height: { type: Type.NUMBER },
        Weight: { type: Type.NUMBER },
        BMI: { type: Type.NUMBER },
      },
      required: ["Height", "Weight", "BMI"]
    },
    Birth: {
      type: Type.OBJECT,
      properties: {
        BirthDateTime: { type: Type.STRING },
        BornCity: { type: Type.STRING },
        BornCountry: { type: Type.STRING },
        Nationality: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["BirthDateTime", "BornCity", "BornCountry", "Nationality"]
    },
    IQ: { type: Type.INTEGER },
    Naked: { type: Type.ARRAY, items: { type: Type.STRING } },
    Story: { type: Type.ARRAY, items: { type: Type.STRING } },
    Notes: { type: Type.ARRAY, items: { type: Type.STRING } },
    Residence: { type: Type.STRING },
    BodyMarks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          Name: { type: Type.STRING },
          Location: { type: Type.STRING },
          Description: { type: Type.STRING },
          Details: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["Name", "Location", "Description"]
      }
    },
    BodyParts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          Name: { type: Type.STRING },
          Details: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                Name: { type: Type.STRING },
                Descriptions: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["Name", "Descriptions"]
            }
          }
        },
        required: ["Name", "Details"]
      }
    },
    Relations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          Relation: { type: Type.STRING },
          FirstName: { type: Type.STRING },
          Names: { type: Type.ARRAY, items: { type: Type.STRING } },
          LastName: { type: Type.STRING },
          MaidenName: { type: Type.STRING },
          Race: { type: Type.STRING },
          Gender: { type: Type.STRING },
        },
        required: ["Relation", "FirstName", "LastName", "Race", "Gender"]
      }
    },
    Personality: { type: Type.ARRAY, items: { type: Type.STRING } },
    Languages: { type: Type.ARRAY, items: { type: Type.STRING } },
    Favorites: {
      type: Type.OBJECT,
      properties: {
        FavoriteAnimal: { type: Type.STRING },
        FavoriteColor: { type: Type.STRING },
        FavoriteDrink: { type: Type.STRING },
        FavoriteFood: { type: Type.STRING },
        FavoritePlant: { type: Type.STRING }
      }
    },
    Advantages: { type: Type.ARRAY, items: { type: Type.STRING } },
    Disadvantages: { type: Type.ARRAY, items: { type: Type.STRING } },
    Skills: { type: Type.ARRAY, items: { type: Type.STRING } },
    Talents: { type: Type.ARRAY, items: { type: Type.STRING } },
    Employer: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          Company: { type: Type.STRING },
          JobTitles: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["Company", "JobTitles"]
      }
    },
    Possessions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          ItemType: { type: Type.STRING },
          Description: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["ItemType", "Description"]
      }
    },
    Dresses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          Usage: { type: Type.ARRAY, items: { type: Type.STRING } },
          Items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                Type: { type: Type.STRING },
                Color: { type: Type.STRING },
                Style: { type: Type.STRING },
                Fabric: { type: Type.STRING },
                Size: { type: Type.STRING },
                Fit: { type: Type.STRING },
              },
              required: ["Type"]
            }
          }
        },
        required: ["Usage", "Items"]
      }
    }
  },
  required: [
    "Version", "Created", "Age", "Worlds", "Name", "Pronouns", "Sexuality", "Size", "Birth",
    "Naked", "Story", "Notes", "Residence", "BodyMarks", "BodyParts", "Relations", "Personality", "Languages", "Favorites",
    "Advantages", "Disadvantages", "Skills", "Talents", "Employer", "Possessions", "Dresses"
  ]
};

// --- Robust Data Sanitization ---

const isObject = (v: any): v is Record<string, any> => v !== null && typeof v === 'object' && !Array.isArray(v);

// Deep merge utility
const mergeDeep = (target: any, ...sources: any[]): any => {
    if (!sources.length) {
        return target;
    }
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) {
                    Object.assign(target, { [key]: {} });
                }
                mergeDeep(target[key], source[key]);
            } else {
                // For arrays and primitives, the source value replaces the target value.
                // This aligns with the prompt instruction for the AI to send the full new array.
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    return mergeDeep(target, ...sources);
};


// This function generates a fresh, complete default character object.
// It's used as a schema to ensure data integrity.
const getFreshCharacterDefaults = (id: string, created: string, currentWorldName: string): Character => ({
    id: id,
    image: undefined,
    Version: "1.0",
    Created: created,
    Age: 25,
    Worlds: [currentWorldName],
    Name: {
        FirstName: "New",
        LastName: "Character",
        Race: "Human",
        Gender: "Not specified",
        Names: [],
        MaidenName: null,
    },
    Pronouns: ['they/them'],
    Sexuality: "Unknown",
    Size: { Height: 170, Weight: 70, BMI: 24.2 },
    Birth: { BirthDateTime: "1999-01-01T00:00:00Z", BornCity: "Anytown", BornCountry: "Anyland", Nationality: ["Citizen"] },
    IQ: 100,
    Naked: ['Has an athletic body and is comfortable with nudity.'],
    Story: ['An enigmatic figure with a past shrouded in mystery.'],
    Residence: "Anytown",
    BodyMarks: [{ Name: 'Scar', Location: 'left cheekbone', Description: 'A thin, silvery scar.', Details: [] }],
    BodyParts: [
        { Name: "Eyes", Details: [{ Name: "Color", Descriptions: ["Blue"] }] },
        { Name: 'Genitals', Details: [{ Name: 'Type', Descriptions: ['Default description'] }] },
        { Name: 'CupSize', Details: [{ Name: 'Size', Descriptions: ['B'] }] },
        { Name: 'PubicHair', Details: [{ Name: 'Style', Descriptions: ['Trimmed'] }] },
    ],
    Relations: [{ Relation: "Friend", FirstName: "John", LastName: "Doe", Names: [], MaidenName: null, Race: "Human", Gender: "Male" }],
    Personality: ['Brave', 'Curious'],
    Languages: ["Common Tongue"],
    Favorites: { FavoriteAnimal: 'Wolf', FavoriteColor: 'Blue', FavoriteDrink: 'Water', FavoriteFood: 'Stew', FavoritePlant: 'Oak Tree' },
    Skills: ['Survival'],
    Talents: ['Good singer'],
    Advantages: ['Night Vision'],
    Disadvantages: ['Enemy: The Shadow Syndicate'],
    Employer: [{ Company: "Self-Employed", JobTitles: ["Adventurer"] }],
    Possessions: [{ ItemType: "Trinket", Description: ["A strange, smooth stone."] }],
    Dresses: [{ Usage: ["Travel"], Items: [{ Type: "Tunic", Color: "Green", Style: "Simple", Fabric: "Linen", Size: "M", Fit: "Regular" }] }],
    Notes: ['Initial user notes can go here.'],
});


// The master function to create a complete, type-safe character object from any partial data.
// This is the gatekeeper that prevents corrupted data from entering the application state.
// It is verbose by design to be extremely safe and easy to debug.
const completeCharacterData = (partialChar: Partial<Character>, currentWorldName: string): Character => {
    const p = isObject(partialChar) ? partialChar : {};
    const id = typeof p.id === 'string' && p.id ? p.id : `char_${Date.now()}`;
    const now = new Date().toISOString();
    const defaults = getFreshCharacterDefaults(id, now, currentWorldName);

    // Start with a clean default slate and merge the partial data on top.
    const completed = mergeDeep({ ...defaults }, p);
    completed.id = id; // Ensure the ID is correctly set.

    // Ensure character is associated with the current world
    if (!completed.Worlds.includes(currentWorldName)) {
        completed.Worlds.push(currentWorldName);
    }

    // Recalculate BMI to ensure it's always correct
    if (completed.Size.Height > 0 && completed.Size.Weight > 0) {
        completed.Size.BMI = Number((completed.Size.Weight / ((completed.Size.Height / 100) ** 2)).toFixed(1));
    }
    return completed;
};

// Helper function to sanitize the entire characters object on load.
const sanitizeCharacters = (storedChars: any, currentWorldName: string): Record<string, Character> => {
    const sanitized: Record<string, Character> = {};
    if (!isObject(storedChars)) return {};
    for (const id in storedChars) {
        if (Object.prototype.hasOwnProperty.call(storedChars, id)) {
            // Run each character through the master completion/sanitization logic
            sanitized[id] = completeCharacterData(storedChars[id], currentWorldName);
        }
    }
    return sanitized;
};


// Transformation function to strip large image data before saving to localStorage
const stripCharacterImages = (chars: Record<string, Character>): Record<string, Omit<Character, 'image'>> => {
    if (!chars) return {};
    const stripped: Record<string, Omit<Character, 'image'>> = {};
    for (const id in chars) {
        if (typeof chars[id] === 'object' && chars[id] !== null) {
            const { image, ...rest } = chars[id];
            stripped[id] = rest;
        }
    }
    return stripped;
};

const getFreshWorldDefaults = (): World => ({
    id: 'world_modern_earth_2025',
    name: 'Modern Earth',
    style: 'Modern Reality',
    theme: {
        technologyLevel: 'Modern (2025-era) technology with smartphones, internet, and early AI.',
        genericBackground: 'Characters are average citizens living in urban or suburban areas, dealing with everyday life.',
        relationships: 'Characters may know each other as colleagues, friends, or neighbors, but are not necessarily related unless specified.',
        rules: 'A diverse mix of genders, species (primarily human), and sexual preferences is encouraged. All relationships should be consensual.',
        specifics: 'Characters should have plausible professions and hobbies. Avoid overtly magical or supernatural elements unless they fit the "Modern Reality" style.',
    },
    calendar: {
        name: 'Gregorian Calendar',
        details: 'Standard 365/366 day calendar used globally, based on the Earth\'s revolution around the Sun.'
    },
    technologyLevel: '2025 - Digital Age with emerging AI, global connectivity, and early stages of commercial space travel.',
    celestialObjects: {
        stars: [{ name: 'Sol', description: 'The G-type main-sequence star at the center of the Solar System.' }],
        planets: [
            { name: 'Earth', description: 'The third planet from the Sun, the only astronomical object known to harbor life.' },
            { name: 'Mars', description: 'The fourth planet from the Sun, a dusty, cold, desert world with a thin atmosphere. Subject of colonization efforts.' }
        ],
        constellations: [{ name: 'Orion', description: 'A prominent constellation located on the celestial equator, visible throughout the world.' }],
        moons: [{ name: 'The Moon (Luna)', description: 'Earth\'s only natural satellite, a rocky body with a heavily cratered surface.' }]
    },
    geography: {
        oceans: [{ name: 'Atlantic Ocean', description: 'Separates the "Old World" of Europe and Africa from the "New World" of the Americas.' }],
        seas: [{ name: 'North Sea', description: 'A marginal sea of the Atlantic Ocean located between Great Britain, Scandinavia, Germany, the Netherlands, Belgium, and France.' }],
        rivers: [{ name: 'Rhine', description: 'A major European river, which begins in the Swiss Alps and flows through Germany and the Netherlands into the North Sea.' }],
        landmarks: [{ name: 'Eiffel Tower', type: 'Structure', location: 'Paris, France', description: 'A wrought-iron lattice tower on the Champ de Mars, a global cultural icon of France.' }]
    },
    countries: [
        {
            name: 'The Netherlands',
            politicalSystem: 'Parliamentary constitutional monarchy',
            diplomaticRelations: [
                { with: 'United States of America', status: 'Ally' },
                { with: 'Germany', status: 'Trade Partner' },
            ],
            cities: [
                {
                    name: 'Amsterdam',
                    isCapital: true,
                    politicalSystem: 'Municipal government led by a mayor and aldermen.',
                    villages: [
                        { name: 'Durgerdam', nearestTown: 'Amsterdam', politicalSystem: 'Part of Amsterdam municipality.' }
                    ]
                },
                { name: 'Utrecht', isCapital: false, politicalSystem: 'Municipal government.', villages: [] }
            ]
        },
        {
            name: 'United States of America',
            politicalSystem: 'Federal presidential constitutional republic',
            diplomaticRelations: [
                { with: 'The Netherlands', status: 'Ally' }
            ],
            cities: [
                { name: 'Washington, D.C.', isCapital: true, politicalSystem: 'Federal district with a local government under the authority of the U.S. Congress.', villages: [] },
                { name: 'New York City', isCapital: false, politicalSystem: 'Strong mayor-council system.', villages: [] }
            ]
        }
    ]
});

const completeWorldData = (partialWorld: Partial<World>): World => {
    const p = isObject(partialWorld) ? partialWorld : {};
    const defaults = getFreshWorldDefaults();
    const completed = mergeDeep({ ...defaults }, p);
    completed.id = typeof p.id === 'string' && p.id ? p.id : `world_${Date.now()}`;

    // Extra sanitization step to prevent .map errors on null/undefined properties
    if (!completed.celestialObjects) completed.celestialObjects = { stars: [], planets: [], constellations: [], moons: [] };
    if (!Array.isArray(completed.celestialObjects.stars)) completed.celestialObjects.stars = [];
    if (!Array.isArray(completed.celestialObjects.planets)) completed.celestialObjects.planets = [];
    if (!Array.isArray(completed.celestialObjects.constellations)) completed.celestialObjects.constellations = [];
    if (!Array.isArray(completed.celestialObjects.moons)) completed.celestialObjects.moons = [];
    
    if (!completed.geography) completed.geography = { oceans: [], seas: [], rivers: [], landmarks: [] };
    if (!Array.isArray(completed.geography.oceans)) completed.geography.oceans = [];
    if (!Array.isArray(completed.geography.seas)) completed.geography.seas = [];
    if (!Array.isArray(completed.geography.rivers)) completed.geography.rivers = [];
    if (!Array.isArray(completed.geography.landmarks)) completed.geography.landmarks = [];

    if (!Array.isArray(completed.countries)) completed.countries = [];
    completed.countries.forEach(country => {
        if (!Array.isArray(country.diplomaticRelations)) country.diplomaticRelations = [];
        if (!Array.isArray(country.cities)) country.cities = [];
        country.cities.forEach(city => {
            if (!Array.isArray(city.villages)) city.villages = [];
        });
    });

    if (!completed.theme) {
        completed.theme = getFreshWorldDefaults().theme;
    }

    return completed;
};


export const AppProvider = ({ children }: { children: ReactNode }) => {
    // --- THEME ---
    const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'dark');
    const toggleTheme = () => {
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `Theme changed to ${theme === 'light' ? 'dark' : 'light'}` });
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);
    
    // --- DIALOGS ---
    const [openDialog, setOpenDialog] = useState<DialogType | null>(null);
    const showDialog = (dialog: DialogType | null) => {
        addLog({ level: LogLevel.DEBUG, source: LogSource.GENERAL, message: `Dialog action: ${dialog ? `Opening ${dialog}` : 'Closing dialog'}` });
        setOpenDialog(dialog);
    };

    // --- SETTINGS & CONFIG ---
    const [apiKey, setApiKey] = useLocalStorage<string>('apiKey', process.env.API_KEY || '');
    const [geminiModel, setGeminiModel] = useLocalStorage<string>('geminiModel', 'gemini-2.5-flash');
    const [imagenModel, setImagenModel] = useLocalStorage<string>('imagenModel', 'imagen-3.0-generate-002');
    const [userName, setUserName] = useLocalStorage<string>('userName', 'User');
    const [userGender, setUserGender] = useLocalStorage<UserGender>('userGender', UserGender.NOT_SPECIFIED);
    const [isNsfwMode, setIsNsfwMode] = useLocalStorage<boolean>('nsfwMode', false);
    const toggleNsfwMode = () => {
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `NSFW Mode toggled ${isNsfwMode ? 'OFF' : 'ON'}` });
        setIsNsfwMode(prev => !prev);
    };
    const [imagenConfig, setImagenConfig] = useLocalStorage<ImagenConfig>('imagenConfig', {
        aspectRatio: '4:3',
        style: 'Cartoon'
    });

    // --- LOGGING ---
    const [logs, setLogs] = useLocalStorage<LogEntry[]>('consoleLogs', []);
    const addLog = useCallback((log: Omit<LogEntry, 'id' | 'timestamp'>) => {
        const newLog = {
            ...log,
            id: `${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
        };
        setLogs(prevLogs => {
            const updatedLogs = [...(prevLogs || []), newLog];
            // Keep only the last 30 logs
            if (updatedLogs.length > 30) {
                return updatedLogs.slice(updatedLogs.length - 30);
            }
            return updatedLogs;
        });
    }, [setLogs]);

    const clearAndSaveLogs = () => {
        if (logs.length === 0) return;
        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `katje-logs-${new Date().toISOString()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: 'Logs saved and cleared.' });
        setLogs([]);
    };
    
    // --- GLOBAL BUSY INDICATOR ---
    const [isBusy, setIsBusy] = useState(false);
    const [busyMessage, setBusyMessage] = useState<string | null>(null);
    const busyTimerRef = useRef<number | null>(null);

    const showBusyIndicator = useCallback((message: string, delay = 3000) => {
        if (busyTimerRef.current) {
            clearTimeout(busyTimerRef.current);
        }
        if (delay === 0) {
            setBusyMessage(message);
            setIsBusy(true);
            busyTimerRef.current = null; // No timer to clear later
            return;
        }
        busyTimerRef.current = window.setTimeout(() => {
            setBusyMessage(message);
            setIsBusy(true);
        }, delay);
    }, []);

    const hideBusyIndicator = useCallback(() => {
        if (busyTimerRef.current) {
            clearTimeout(busyTimerRef.current);
            busyTimerRef.current = null;
        }
        setIsBusy(false);
        setBusyMessage(null);
    }, []);

    // --- APP STATE ---
    const [appMode, _setAppMode] = useState<AppMode>(AppMode.WORLD);
    const setAppMode = (mode: AppMode) => {
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `App mode changed to ${mode}` });
        _setAppMode(mode);
    };
    const [allCompanies, setAllCompanies] = useState<Company[]>([]);
    const [allEmployees, setAllEmployees] = useState<Record<string, Employee>>({});
    const [selectedEmployees, setSelectedEmployees] = useLocalStorage<string[]>('selectedEmployees', []);
    
    useEffect(() => {
        fetch('/employees.md')
            .then(res => {
                if (!res.ok) {
                    const error = new Error(`HTTP error! status: ${res.status}`);
                    addLog({ level: LogLevel.ERROR, source: LogSource.HTTP, message: 'Failed to fetch employee data.', details: { status: res.status, statusText: res.statusText } });
                    throw error;
                }
                return res.text();
            })
            .then(text => {
                const { companies, employees } = parseEmployeesMd(text);
                setAllCompanies(companies);
                setAllEmployees(employees);
                // This keeps all employees selected for chat mode.
                const allEmployeeIds = Object.keys(employees);
                setSelectedEmployees(allEmployeeIds);
            }).catch(err => {
                addLog({ level: LogLevel.ERROR, source: LogSource.HTTP, message: 'Failed to load employee data.', details: err.toString() });
            });
    }, [addLog, setSelectedEmployees]);


    // --- WORLD STATE & ACTIONS ---
    const [world, setWorld] = useLocalStorage<World>('world', getFreshWorldDefaults(), completeWorldData);
    const [isExportingWorldPdf, setIsExportingWorldPdf] = useState(false);
    
    const updateWorld = useCallback((updates: Partial<World>) => {
        setWorld(prev => completeWorldData(mergeDeep({ ...prev }, updates)));
    }, [setWorld]);

    const importWorld = useCallback(async (jsonContent: string) => {
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: 'User initiated loading world from file.' });
        showBusyIndicator("Loading and validating world...", 0);
        try {
            const parsed = JSON.parse(jsonContent);
            const newWorld = completeWorldData(parsed);
            setWorld(newWorld);
            addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `Successfully loaded world: ${newWorld.name}` });
        } catch (err: any) {
            addLog({ level: LogLevel.ERROR, source: LogSource.PARSER, message: `Failed to load world from file: ${err.message}`, details: err.toString() });
            alert(`Error loading world: ${err.message}`);
        } finally {
            hideBusyIndicator();
        }
    }, [setWorld, addLog, showBusyIndicator, hideBusyIndicator]);

    const exportWorld = useCallback(async (format: 'json' | 'md' | 'html' | 'pdf') => {
        if (!world) return;
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `Exporting world ${world.id} as ${format}.` });
        const filename = `${world.name}`.replace(/ /g, '_');
        let content = '';
        let mimeType = '';
        let fileExtension = format;

        switch (format) {
            case 'json':
                content = JSON.stringify(world, null, 2);
                mimeType = 'application/json';
                break;
            case 'md':
                content = exportWorldToMarkdown(world);
                mimeType = 'text/markdown';
                break;
            case 'html':
                content = exportWorldToHtml(world);
                mimeType = 'text/html';
                break;
            case 'pdf': {
                const currentContext = valueRef.current;
                if (!currentContext) {
                    addLog({ level: LogLevel.ERROR, source: LogSource.GENERAL, message: "PDF export failed: Context not available." });
                    alert("Could not generate PDF: application context is not ready.");
                    return;
                }
                setIsExportingWorldPdf(true);
                const originalTheme = theme;
                try {
                    if (originalTheme === 'dark') {
                        setTheme('light');
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }

                    const tempContainer = document.createElement('div');
                    tempContainer.style.position = 'absolute';
                    tempContainer.style.left = '-9999px';
                    tempContainer.style.top = '0px';
                    tempContainer.style.width = '1200px';
                    tempContainer.style.fontSize = '200%';
                    document.body.appendChild(tempContainer);

                    const tempRoot = ReactDOM.createRoot(tempContainer);
                    const value: AppContextType = { ...currentContext, theme: 'light', isExportingWorldPdf: true };
                    const PdfProvider: React.FC<{ children: ReactNode }> = ({ children }) => (<AppContext.Provider value={value}>{children}</AppContext.Provider>);

                    await new Promise<void>(resolve => {
                        tempRoot.render(<PdfProvider><WorldSheet /></PdfProvider>);
                        setTimeout(resolve, 1500); // Wait for images & styles
                    });

                    const sheetElement = tempContainer.querySelector(`#world-sheet`);
                    if (sheetElement) {
                        const canvas = await html2canvas(sheetElement as HTMLElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff', width: sheetElement.scrollWidth, height: sheetElement.scrollHeight, windowWidth: sheetElement.scrollWidth, windowHeight: sheetElement.scrollHeight });
                        const pdf = new jsPDF('p', 'mm', 'a4');
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const pdfHeight = pdf.internal.pageSize.getHeight();
                        const topMargin = 20, bottomMargin = 20, horizontalMargin = 15;
                        const contentWidth = pdfWidth - horizontalMargin * 2;
                        const pageContentHeight = pdfHeight - topMargin - bottomMargin;
                        
                        const canvasWidth = canvas.width;
                        const canvasHeight = canvas.height;
                        const canvasRatio = canvasHeight / canvasWidth;
                        const totalScaledHeight = contentWidth * canvasRatio;
                        const totalPages = Math.ceil(totalScaledHeight / pageContentHeight);
                        const sourcePageHeight = (pageContentHeight / contentWidth) * canvasWidth;

                        for (let i = 0; i < totalPages; i++) {
                            if (i > 0) pdf.addPage();
                            const sourceY = i * sourcePageHeight;
                            const sourceHeight = Math.min(sourcePageHeight, canvasHeight - sourceY);
                            const currentPagePdfHeight = (sourceHeight / canvasWidth) * contentWidth;
                            
                            const pageCanvas = document.createElement('canvas');
                            pageCanvas.width = canvasWidth;
                            pageCanvas.height = sourceHeight;
                            const pageCtx = pageCanvas.getContext('2d');
                            if (pageCtx) {
                                pageCtx.drawImage(canvas, 0, sourceY, canvasWidth, sourceHeight, 0, 0, canvasWidth, sourceHeight);
                                const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
                                
                                pdf.setFontSize(14);
                                pdf.setFont('helvetica', 'bold');
                                pdf.text(world.name, horizontalMargin, topMargin - 8);
                                
                                pdf.addImage(pageImgData, 'PNG', horizontalMargin, topMargin, contentWidth, currentPagePdfHeight);
                                
                                pdf.setFontSize(8);
                                pdf.setFont('helvetica', 'normal');
                                pdf.text(`© ${new Date().getFullYear()} ${userName} - Generated by Katje`, horizontalMargin, pdfHeight - bottomMargin + 10);
                                pdf.text(`Page ${i + 1} of ${totalPages}`, pdfWidth - horizontalMargin, pdfHeight - bottomMargin + 10, { align: 'right' });
                            }
                        }
                        pdf.save(`${filename}.pdf`);
                    }

                    tempRoot.unmount();
                    document.body.removeChild(tempContainer);
                } catch (pdfError: any) {
                    addLog({ level: LogLevel.ERROR, source: LogSource.GENERAL, message: "World PDF generation failed.", details: { message: pdfError.message, stack: pdfError.stack } });
                    alert("Failed to generate PDF. Check the console for more details.");
                } finally {
                    if (theme !== originalTheme) setTheme(originalTheme);
                    setIsExportingWorldPdf(false);
                }
                return;
            }
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [world, addLog, theme, setTheme, userName]);

    const generateWorldHeaderImage = useCallback(async (prompt?: string) => {
        if (!apiKey) {
            addLog({ level: LogLevel.WARN, source: LogSource.AI, message: 'API key missing for world image generation.' });
            throw new Error("API key is not available.");
        }
        showBusyIndicator("Generating world header image with AI...", 0);
        try {
            const ai = new GoogleGenAI({ apiKey });
            const defaultPrompt = `A beautiful, high-resolution header image for a world named '${world.name}'. The style is '${world.style}'. The overall theme includes: ${world.geography?.oceans?.map(o => o.name).join(', ')}, ${world.geography?.landmarks?.map(l => l.name).join(', ')}.`;
            const finalPrompt = prompt || defaultPrompt;

            const request = {
                model: imagenModel,
                prompt: finalPrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/png',
                    aspectRatio: '16:9' as AspectRatio,
                },
            };
            addLog({ level: LogLevel.INFO, source: LogSource.HTTP, message: 'Sending Imagen API request for world header image.', details: request });
            
            const response = await ai.models.generateImages(request);
            const loggedResponse = { ...response, generatedImages: response.generatedImages.map(img => ({ ...img, image: { ...img.image, imageBytes: truncateForLog(img.image.imageBytes) } })) };
            addLog({ level: LogLevel.DEBUG, source: LogSource.API, message: 'Received Imagen API response for world header image.', details: loggedResponse });

            if (response.generatedImages && response.generatedImages.length > 0) {
                const imageUrl = `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
                updateWorld({ headerImage: imageUrl });
                addLog({ level: LogLevel.INFO, source: LogSource.AI, message: 'World header image generated successfully.' });
            } else {
                throw new Error("Image generation returned no results.");
            }
        } catch (err: any) {
            const errorMessage = getApiErrorMessage(err, 'Imagen');
            addLog({ level: LogLevel.ERROR, source: LogSource.AI, message: `World header image generation failed: ${errorMessage}`, details: { message: err.message, stack: err.stack, response: err.response } });
            throw new Error(errorMessage);
        } finally {
            hideBusyIndicator();
        }
    }, [apiKey, world, imagenModel, addLog, showBusyIndicator, hideBusyIndicator, updateWorld]);

    const uploadWorldImage = useCallback((imageData: string) => {
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: 'Uploading new world header image.' });
        updateWorld({ headerImage: imageData });
    }, [updateWorld, addLog]);

    const removeWorldImage = useCallback(() => {
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: 'Removing world header image.' });
        updateWorld({ headerImage: undefined });
    }, [updateWorld, addLog]);
    
    const generateNewWorld = useCallback(async (prompt: string) => {
        if (!apiKey) {
            addLog({ level: LogLevel.WARN, source: LogSource.AI, message: 'API key missing for new world generation.' });
            throw new Error("API key is not available.");
        }
        showBusyIndicator("AI is crafting your new world...", 0);
        try {
            const ai = new GoogleGenAI({ apiKey });
            // Simplified world schema for AI generation
            const worldSchema = {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING }, style: { type: Type.STRING },
                    theme: {
                        type: Type.OBJECT, properties: {
                            technologyLevel: { type: Type.STRING }, genericBackground: { type: Type.STRING },
                            relationships: { type: Type.STRING }, rules: { type: Type.STRING }, specifics: { type: Type.STRING }
                        }, required: ["technologyLevel", "genericBackground", "relationships", "rules", "specifics"]
                    },
                    calendar: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, details: { type: Type.STRING } }, required: ["name", "details"] },
                    technologyLevel: { type: Type.STRING },
                    celestialObjects: { type: Type.OBJECT, properties: { stars: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } } }, planets: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } } }, moons: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } } }, constellations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } } } } },
                    geography: { type: Type.OBJECT, properties: { oceans: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } } }, seas: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } } }, rivers: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } } }, landmarks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING }, location: { type: Type.STRING }, description: { type: Type.STRING } } } } } },
                    countries: {
                        type: Type.ARRAY, items: {
                            type: Type.OBJECT, properties: {
                                name: { type: Type.STRING }, politicalSystem: { type: Type.STRING },
                                diplomaticRelations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { with: { type: Type.STRING }, status: { type: Type.STRING } } } },
                                cities: {
                                    type: Type.ARRAY, items: {
                                        type: Type.OBJECT, properties: {
                                            name: { type: Type.STRING }, isCapital: { type: Type.BOOLEAN }, politicalSystem: { type: Type.STRING },
                                            villages: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, nearestTown: { type: Type.STRING }, politicalSystem: { type: Type.STRING } } } }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                required: ["name", "style", "theme", "calendar", "technologyLevel", "celestialObjects", "geography", "countries"]
            };
            const request = {
                model: geminiModel,
                contents: `Based on the following prompt, generate a complete, rich, and detailed world. Fill in every possible field with creative and consistent information. Ensure the 'theme' object is filled out with details that match the world you create. Prompt: "${prompt}"`,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: worldSchema,
                },
            };
            addLog({ level: LogLevel.INFO, source: LogSource.HTTP, message: 'Sending Gemini API request for new world generation.', details: { model: request.model, prompt } });
            
            const response = await ai.models.generateContent(request);
            addLog({ level: LogLevel.DEBUG, source: LogSource.API, message: 'Received Gemini API response for new world.', details: { text: response.text } });
            
            const newWorldData = JSON.parse(response.text.trim());
            
            // De-duplicate countries and cities client-side for safety
            const seenCountries = new Set<string>();
            const uniqueCountries = (newWorldData.countries || []).filter((country: Country) => {
                if (!country.name || seenCountries.has(country.name)) return false;
                seenCountries.add(country.name);
                const seenCities = new Set<string>();
                country.cities = (country.cities || []).filter(city => {
                    if (!city.name || seenCities.has(city.name)) return false;
                    seenCities.add(city.name);
                    return true;
                });
                return true;
            });
            newWorldData.countries = uniqueCountries;

            setWorld(completeWorldData(newWorldData));
            addLog({ level: LogLevel.INFO, source: LogSource.AI, message: `New world "${newWorldData.name}" generated successfully.` });

        } catch (err: any) {
            const errorMessage = getApiErrorMessage(err, 'World Gen');
            addLog({ level: LogLevel.ERROR, source: LogSource.AI, message: `New world generation failed: ${errorMessage}`, details: { message: err.message, stack: err.stack, response: err.response } });
            throw new Error(errorMessage);
        } finally {
            hideBusyIndicator();
        }
    }, [apiKey, geminiModel, setWorld, addLog, showBusyIndicator, hideBusyIndicator]);

    // --- CHARACTER GEN STATE & ACTIONS ---
    const [characters, setCharacters] = useLocalStorage<Record<string, Character>>('characters', {}, (stored) => sanitizeCharacters(stored, world.name), stripCharacterImages);
    const [selectedCharacterId, setSelectedCharacterId] = useLocalStorage<string | null>('selectedCharacterId', null);
    const [isCharacterImageLoading, setIsCharacterImageLoading] = useState<Record<string, boolean>>({});
    const [isEnhancingDetail, setIsEnhancingDetail] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const [deletionTarget, setDeletionTarget] = useState<string | 'all' | null>(null);
    const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

    useEffect(() => {
        if (selectedCharacterId && !characters[selectedCharacterId]) {
            setSelectedCharacterId(null);
        }
    }, [selectedCharacterId, characters, setSelectedCharacterId]);

    const ensureCharacterDetails = useCallback(async (character: Character): Promise<Character> => {
        if (!apiKey) return character;

        const essentialBodyParts = [
            'Hair', 'Head', 'Eyes', 'Nose', 'Ears', 'Mouth', 'Neck', 'Shoulders',
            'Arms', 'Hands', 'Nails', 'Chest', 'Abdomen', 'Hip', 'Legs', 'Feet', 'Genitals', 'PubicHair'
        ];

        if (character.Name.Gender?.toLowerCase().includes('female')) {
            essentialBodyParts.push('Breasts', 'CupSize');
        }

        const existingPartNames = new Set(character.BodyParts?.map(p => p.Name) || []);
        const missingParts = essentialBodyParts.filter(p => !existingPartNames.has(p));

        if (missingParts.length === 0) {
            return character;
        }

        addLog({ level: LogLevel.INFO, source: LogSource.AI, message: `Character is missing details for: ${missingParts.join(', ')}. Generating with AI.` });

        try {
            const ai = new GoogleGenAI({ apiKey });
            const characterSummary = `
                Name: ${character.Name.FirstName} ${character.Name.LastName}
                Age: ${character.Age}
                Gender: ${character.Name.Gender}
                Race: ${character.Name.Race}
                Height: ${character.Size.Height} cm
                Weight: ${character.Size.Weight} kg
                Story: ${character.Story.join(' ')}
                Personality: ${character.Personality.join(', ')}
            `;

            const prompt = `Based on the following character summary, provide detailed and creative physical descriptions for the listed missing body parts. 
For each body part, provide at least one detail with a name and a description (e.g., for Eyes, details could be Color and Shape).
Ensure the descriptions are plausible and consistent with the character's profile.
Your output must be ONLY a valid JSON array of objects, where each object represents a body part and conforms to the provided schema. Do not include any surrounding text or markdown.

Character Summary:
${characterSummary}

Generate descriptions for these missing parts: ${missingParts.join(', ')}
`;
            const bodyPartsSchema = characterResponseSchema.properties.BodyParts;
            const request = {
                model: geminiModel,
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: bodyPartsSchema,
                }
            };
            addLog({ level: LogLevel.DEBUG, source: LogSource.HTTP, message: 'Sending request to generate missing character details.', details: { ...request, contents: truncateForLog(request.contents, 500) } });

            const response = await ai.models.generateContent(request);
            addLog({ level: LogLevel.DEBUG, source: LogSource.API, message: 'Received generated character details.', details: { text: response.text } });

            const cleanedText = response.text.trim();
            const generatedParts = JSON.parse(cleanedText);

            if (Array.isArray(generatedParts)) {
                const newCharacter = { ...character };
                newCharacter.BodyParts = [...(newCharacter.BodyParts || []), ...generatedParts];
                addLog({ level: LogLevel.INFO, source: LogSource.AI, message: `Successfully generated and added details for ${generatedParts.length} body parts.` });
                return newCharacter;
            } else {
                throw new Error("AI did not return a valid array of body parts.");
            }
        } catch (err: any) {
            const errorMessage = getApiErrorMessage(err, 'Character Gen');
            addLog({ level: LogLevel.ERROR, source: LogSource.AI, message: `Failed to generate missing character details: ${errorMessage}`, details: { message: err.message, stack: err.stack, response: err.response } });
            return character; // Return original character on error
        }
    }, [apiKey, geminiModel, addLog]);

    const selectCharacter = (id: string | null) => {
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `Selected character: ${id}` });
        setSelectedCharacterId(id);
    };

    const createNewCharacter = useCallback(async () => {
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: 'User initiated new character creation.' });
        showBusyIndicator("AI is creating character details...", 0);
        try {
            const newChar = completeCharacterData({}, world.name);
            const completedChar = await ensureCharacterDetails(newChar);
            setCharacters(prev => ({ ...prev, [completedChar.id]: completedChar }));
            setSelectedCharacterId(completedChar.id);
            addLog({ level: LogLevel.INFO, source: LogSource.AI, message: `Successfully created and detailed new character: ${completedChar.id}` });
        } catch (err: any) {
            const errorMessage = getApiErrorMessage(err, 'Character Gen');
            addLog({ level: LogLevel.ERROR, source: LogSource.AI, message: `Failed to create new character: ${errorMessage}`, details: { message: err.message, stack: err.stack, response: err.response } });
        } finally {
            hideBusyIndicator();
        }
    }, [setCharacters, setSelectedCharacterId, ensureCharacterDetails, addLog, showBusyIndicator, hideBusyIndicator, world.name]);

    const updateCharacter = useCallback((id: string, updates: Partial<Character>) => {
        setCharacters(prev => {
            const existingChar = prev[id];
            if (!existingChar) return prev;
            const newCharData = { ...prev };
            newCharData[id] = completeCharacterData(mergeDeep({ ...existingChar }, updates), world.name);
            return newCharData;
        });
    }, [setCharacters, world.name]);

    const deleteCharacter = (id: string) => {
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `User requested deletion for character: ${id}` });
        setDeletionTarget(id);
        showDialog(DialogType.CONFIRM_DELETE);
    };
    
    const deleteAllCharacters = useCallback(() => {
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: 'User requested deletion for all characters.' });
        setDeletionTarget('all');
        showDialog(DialogType.CONFIRM_DELETE);
    }, [showDialog, addLog]);

    const confirmDeletion = useCallback(() => {
        if (!deletionTarget) return;
        if (deletionTarget === 'all') {
            setCharacters({});
            setSelectedCharacterId(null);
            addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: 'All characters have been deleted.' });
        } else {
            const id = deletionTarget;
            addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `User confirmed deletion for character: ${id}` });
            setCharacters(prev => {
                const newCharacters = { ...prev };
                delete newCharacters[id];
                return newCharacters;
            });
            if (selectedCharacterId === id) {
                setSelectedCharacterId(null);
            }
        }
        setDeletionTarget(null);
        showDialog(null);
    }, [deletionTarget, setCharacters, setSelectedCharacterId, addLog, showDialog, selectedCharacterId]);

    const saveAllCharacters = useCallback(() => {
        if (Object.keys(characters).length === 0) {
            alert("There are no characters to save.");
            return;
        }
        const characterArray = Object.values(characters);
        const content = JSON.stringify(characterArray, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const worldName = world.name.toLowerCase().replace(/\s+/g, '-');
        link.download = `${worldName}-characters-${timestamp}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `Saved ${characterArray.length} characters to ${link.download}.` });
    }, [characters, addLog, world.name]);
    
    const loadCharacters = useCallback((jsonContent: string) => {
        if (!window.confirm("Are you sure you want to load a new character file? This will replace ALL current characters.")) {
            return;
        }
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: 'User initiated loading characters from file.' });
        showBusyIndicator("Loading and validating characters...", 0);
        try {
            const parsed = JSON.parse(jsonContent);
            let charactersToLoad: Partial<Character>[] = [];
            if (Array.isArray(parsed)) {
                charactersToLoad = parsed;
            } else if (isObject(parsed)) {
                // Handle single character object file from individual export
                charactersToLoad = [parsed];
            } else {
                throw new Error("Invalid format: The JSON file should contain an array of characters or a single character object.");
            }
            
            const newCharacterRecord: Record<string, Character> = {};
            for (const charData of charactersToLoad) {
                const sanitizedChar = completeCharacterData(charData, world.name);
                newCharacterRecord[sanitizedChar.id] = sanitizedChar;
            }

            setCharacters(newCharacterRecord);
            setSelectedCharacterId(null);
            addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `Successfully loaded and replaced ${charactersToLoad.length} characters.` });
        } catch (err: any) {
            addLog({ level: LogLevel.ERROR, source: LogSource.PARSER, message: `Failed to load characters from file: ${err.message}`, details: { message: err.message, stack: err.stack } });
            alert(`Error loading characters: ${err.message}`);
        } finally {
            hideBusyIndicator();
        }
    }, [setCharacters, setSelectedCharacterId, addLog, showBusyIndicator, hideBusyIndicator, world.name]);
    
    const addCharacterFromAi = useCallback(async (characterData: Partial<Character>): Promise<Character> => {
        let newChar = await ensureCharacterDetails(completeCharacterData(characterData, world.name));
        
        // Check for duplicates by name
        const duplicates = Object.values(characters).filter(c => c.Name.FirstName === newChar.Name.FirstName && c.Name.LastName === newChar.Name.LastName);
        if (duplicates.length > 0) {
            // Simple roman numeral addition for duplicates
            const toRoman = (num: number): string => {
                const roman: { [key: string]: number } = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
                let str = '';
                for (let i of Object.keys(roman)) {
                    let q = Math.floor(num / roman[i]);
                    num -= q * roman[i];
                    str += i.repeat(q);
                }
                return str;
            };
            newChar.Name.FirstName = `${newChar.Name.FirstName} ${toRoman(duplicates.length + 1)}`;
        }
        
        setCharacters(prev => ({ ...prev, [newChar.id]: newChar }));
        addLog({ level: LogLevel.INFO, source: LogSource.AI, message: `AI created character: ${newChar.Name.FirstName} ${newChar.Name.LastName}` });
        return newChar;
    }, [characters, setCharacters, addLog, ensureCharacterDetails, world.name]);
    
    const importCharacter = useCallback(async (jsonContent: string) => {
         addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `Attempting to import character from JSON.` });
         
         const processCharacterData = async (characterData: Partial<Character>) => {
            let finalChar = completeCharacterData(characterData, world.name);
             const duplicates = Object.values(characters).filter(c => c.Name.FirstName === finalChar.Name.FirstName && c.Name.LastName === finalChar.Name.LastName && c.id !== finalChar.id);
            if (duplicates.length > 0) {
                // Simple roman numeral addition for duplicates
                const toRoman = (num: number): string => {
                    const roman: { [key: string]: number } = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
                    let str = '';
                    for (let i of Object.keys(roman)) {
                        let q = Math.floor(num / roman[i]);
                        num -= q * roman[i];
                        str += i.repeat(q);
                    }
                    return str;
                };
                finalChar.Name.FirstName = `${finalChar.Name.FirstName} ${toRoman(duplicates.length + 1)}`;
            }
            finalChar = await ensureCharacterDetails(finalChar);
            setCharacters(prev => ({ ...prev, [finalChar.id]: finalChar }));
            setSelectedCharacterId(finalChar.id);
            addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: "Successfully imported and completed character.", details: { name: `${finalChar.Name.FirstName} ${finalChar.Name.LastName}` } });
         };

        try {
            // First attempt: direct parse
            const parsed = JSON.parse(jsonContent);
            showBusyIndicator("AI is completing character details...", 0);
            try {
                await processCharacterData(parsed);
            } finally {
                hideBusyIndicator();
            }
        } catch (e: any) {
            addLog({ level: LogLevel.WARN, source: LogSource.PARSER, message: "Direct JSON parse failed. Attempting AI fix.", details: { error: e.message, content: truncateForLog(jsonContent) } });
            if (!apiKey) {
                const errorMessage = "Could not import character: The JSON is invalid and an AI fix was not possible because the API key is missing.";
                addLog({ level: LogLevel.ERROR, source: LogSource.GENERAL, message: errorMessage });
                alert(errorMessage);
                return;
            }
            // Second attempt: AI fix
            showBusyIndicator("AI is repairing and completing your character...", 0);
            try {
                const ai = new GoogleGenAI({ apiKey });
                const prompt = `The following JSON text is malformed or incomplete. Please fix it and ensure it conforms to the provided schema. Analyze the content and create a complete character profile, creatively filling in ALL missing required fields with plausible data based on the existing information. Your output must be ONLY the corrected and completed JSON object, without any surrounding text or markdown. JSON to fix: \n\n\`\`\`json\n${jsonContent}\n\`\`\``;
                const request = {
                    model: geminiModel,
                    contents: prompt,
                    config: {
                        responseMimeType: 'application/json',
                        responseSchema: characterResponseSchema,
                    }
                };
                addLog({ level: LogLevel.DEBUG, source: LogSource.HTTP, message: "Sending malformed JSON to AI for correction.", details: { ...request, contents: truncateForLog(prompt, 500) } });
                const response = await ai.models.generateContent(request);
                addLog({ level: LogLevel.DEBUG, source: LogSource.API, message: "Received AI correction response.", details: { text: response.text } });
                const cleanedText = response.text.trim();
                const fixedJson = JSON.parse(cleanedText);
                addLog({ level: LogLevel.INFO, source: LogSource.AI, message: "AI successfully corrected the JSON.", details: fixedJson });
                await processCharacterData(fixedJson);
            } catch (aiError: any) {
                const errorMessage = getApiErrorMessage(aiError, 'Character Gen');
                addLog({ level: LogLevel.ERROR, source: LogSource.AI, message: `Failed to fix and import character with AI: ${errorMessage}`, details: { message: aiError.message, stack: aiError.stack, response: aiError.response } });
                alert(`Error importing character: The JSON file is invalid, and the AI could not fix it. ${errorMessage}`);
            } finally {
                hideBusyIndicator();
            }
        }
    }, [apiKey, geminiModel, addLog, characters, setCharacters, setSelectedCharacterId, ensureCharacterDetails, showBusyIndicator, hideBusyIndicator, world.name]);

    const importCharacterFromMarkdown = useCallback(async (markdownContent: string) => {
         addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `Attempting to import character from Markdown.` });
        if (!apiKey) {
            const errorMessage = "Could not import character from Markdown: An API key is required for AI processing.";
            addLog({ level: LogLevel.ERROR, source: LogSource.GENERAL, message: errorMessage });
            alert(errorMessage);
            return;
        }
        showBusyIndicator("AI is parsing Markdown and creating character...", 0);
        try {
            const ai = new GoogleGenAI({ apiKey });
            const prompt = `The following text is a character sheet in Markdown format. Please parse it, extract all relevant information, and convert it into a valid JSON object that conforms to the provided schema. Creatively fill in any missing required fields with plausible data based on the context. Your output must be ONLY the completed JSON object, without any surrounding text or markdown.
    
Markdown to parse:
\`\`\`markdown
${markdownContent}
\`\`\``;
            const request = {
                model: geminiModel,
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: characterResponseSchema,
                }
            };
            addLog({ level: LogLevel.DEBUG, source: LogSource.HTTP, message: "Sending Markdown to AI for conversion.", details: { ...request, contents: truncateForLog(prompt, 500) } });
            const response = await ai.models.generateContent(request);
            addLog({ level: LogLevel.DEBUG, source: LogSource.API, message: "Received AI Markdown conversion response.", details: { text: response.text } });
            const cleanedText = response.text.trim();
            // The importCharacter function already handles parsing, AI-fixing (if needed), and adding to state.
            await importCharacter(cleanedText);
        } catch (err: any) {
             const errorMessage = getApiErrorMessage(err, 'Character Gen');
            addLog({ level: LogLevel.ERROR, source: LogSource.AI, message: `Failed to import character from Markdown: ${errorMessage}`, details: { message: err.message, stack: err.stack, response: err.response } });
            alert(`Error importing from Markdown: The AI could not process the file. ${errorMessage}`);
        } finally {
            hideBusyIndicator();
        }
    }, [apiKey, geminiModel, addLog, importCharacter, showBusyIndicator, hideBusyIndicator]);

    const exportCharacter = async (id: string, format: 'json' | 'md' | 'html' | 'pdf') => {
        const character = characters[id];
        if (!character) return;
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `Exporting character ${id} as ${format}.` });
        
        const filename = `${character.Name.FirstName}_${character.Name.LastName}`.replace(/ /g, '_');
        let content = '';
        let mimeType = '';
        let fileExtension = format;

        switch (format) {
            case 'json':
                content = JSON.stringify(character, null, 2);
                mimeType = 'application/json';
                break;
            case 'md':
                content = exportToMarkdown(character);
                mimeType = 'text/markdown';
                break;
            case 'html':
                content = exportToHtml(character);
                mimeType = 'text/html';
                break;
            case 'pdf': {
                const currentContext = valueRef.current;
                if (!currentContext) {
                    addLog({ level: LogLevel.ERROR, source: LogSource.GENERAL, message: "PDF export failed: Context not available." });
                    alert("Could not generate PDF: application context is not ready.");
                    return;
                }
                setIsExportingPdf(true);
                const originalTheme = theme;
                try {
                    // Switch to light theme for PDF generation to ensure correct styling
                    if (originalTheme === 'dark') {
                        setTheme('light');
                        // Give React time to re-render with the light theme styles
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                    
                    const tempContainer = document.createElement('div');
                    tempContainer.style.position = 'absolute';
                    tempContainer.style.left = '-9999px';
                    tempContainer.style.top = '0px';
                    tempContainer.style.width = '1200px';
                    tempContainer.style.fontSize = '200%'; // Enlarge font for better PDF readability
                    document.body.appendChild(tempContainer);
                    const tempRoot = ReactDOM.createRoot(tempContainer);

                    // Create a context snapshot for the PDF render, forcing light theme and export mode
                    const value: AppContextType = { ...currentContext, theme: 'light', selectedCharacterId: id, isExportingPdf: true };
                    const PdfProvider: React.FC<{ children: ReactNode }> = ({ children }) => (<AppContext.Provider value={value}>{children}</AppContext.Provider>);
                    
                    await new Promise<void>(resolve => {
                        tempRoot.render(<PdfProvider><CharacterSheet /></PdfProvider>);
                        setTimeout(resolve, 1500); // Wait for images & styles
                    });

                    const sheetElement = tempContainer.querySelector(`#character-sheet-${character.id}`);
                    if (sheetElement) {
                        try {
                            const canvas = await html2canvas(sheetElement as HTMLElement, {
                                scale: 2,
                                useCORS: true,
                                backgroundColor: '#ffffff',
                                width: sheetElement.scrollWidth,
                                height: sheetElement.scrollHeight,
                                windowWidth: sheetElement.scrollWidth,
                                windowHeight: sheetElement.scrollHeight,
                            });

                            const pdf = new jsPDF('p', 'mm', 'a4');
                            const pdfWidth = pdf.internal.pageSize.getWidth();
                            const pdfHeight = pdf.internal.pageSize.getHeight();
                            const topMargin = 20;
                            const bottomMargin = 20;
                            const horizontalMargin = 15;
                            const contentWidth = pdfWidth - horizontalMargin * 2;
                            const pageContentHeight = pdfHeight - topMargin - bottomMargin;
                            
                            const canvasWidth = canvas.width;
                            const canvasHeight = canvas.height;
                            const canvasRatio = canvasHeight / canvasWidth;
                            const totalScaledHeight = contentWidth * canvasRatio;
                            const totalPages = Math.ceil(totalScaledHeight / pageContentHeight);
                            const sourcePageHeight = (pageContentHeight / contentWidth) * canvasWidth;

                            for (let i = 0; i < totalPages; i++) {
                                if (i > 0) {
                                    pdf.addPage();
                                }
                                const sourceY = i * sourcePageHeight;
                                const sourceHeight = Math.min(sourcePageHeight, canvasHeight - sourceY);
                                const currentPagePdfHeight = (sourceHeight / canvasWidth) * contentWidth;

                                const pageCanvas = document.createElement('canvas');
                                pageCanvas.width = canvasWidth;
                                pageCanvas.height = sourceHeight;
                                const pageCtx = pageCanvas.getContext('2d');

                                if (pageCtx) {
                                    pageCtx.drawImage(canvas, 0, sourceY, canvasWidth, sourceHeight, 0, 0, canvasWidth, sourceHeight);
                                    const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
                                    
                                    pdf.setFontSize(14);
                                    pdf.setFont('helvetica', 'bold');
                                    pdf.text(`${character.Name.FirstName} ${character.Name.LastName}`, horizontalMargin, topMargin - 8);

                                    pdf.addImage(pageImgData, 'PNG', horizontalMargin, topMargin, contentWidth, currentPagePdfHeight);

                                    pdf.setFontSize(8);
                                    pdf.setFont('helvetica', 'normal');
                                    pdf.text(`© ${new Date().getFullYear()} ${userName} - Generated by Katje`, horizontalMargin, pdfHeight - bottomMargin + 10);
                                    pdf.text(`Page ${i + 1} of ${totalPages}`, pdfWidth - horizontalMargin, pdfHeight - bottomMargin + 10, { align: 'right' });
                                }
                            }
                            pdf.save(`${filename}.pdf`);

                        } catch (pdfError: any) {
                            addLog({ level: LogLevel.ERROR, source: LogSource.GENERAL, message: "PDF generation failed.", details: { message: pdfError.message, stack: pdfError.stack } });
                            alert("Failed to generate PDF. Check the console for more details.");
                        }
                    }

                    tempRoot.unmount();
                    document.body.removeChild(tempContainer);
                } finally {
                    // Restore original theme if it was changed
                    if (theme !== originalTheme) {
                        setTheme(originalTheme);
                    }
                    setIsExportingPdf(false);
                }
                return;
            }
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const generateCharacterImage = useCallback(async (id: string, customPrompt?: string) => {
        const character = characters[id];
        if (!character || !apiKey) {
            addLog({ level: LogLevel.WARN, source: LogSource.AI, message: 'Character or API key missing for image generation.' });
            throw new Error("Character data or API key is not available.");
        }
        setIsCharacterImageLoading(prev => ({ ...prev, [id]: true }));
        try {
            const ai = new GoogleGenAI({ apiKey });
            const hair = character.BodyParts?.find(p => p.Name === 'Hair')?.Details.map((d:any) => `${d.Name} ${d.Descriptions.join(', ')}`).join(', ') || 'hair';
            const eyes = character.BodyParts?.find(p => p.Name === 'Eyes')?.Details.map((d:any) => `${d.Name} ${d.Descriptions.join(', ')}`).join(', ') || 'eyes';
            const skin = character.BodyParts?.find(p => p.Name === 'Skin')?.Details.map((d: any) => `${d.Name} ${d.Descriptions.join(', ')}`).join(', ') || character.Name.Race;
            const clothing = character.Dresses?.[0]?.Items.map((item) => item.Type).join(', ') || 'simple clothes';

            const defaultPrompt = `A ${imagenConfig.style} portrait from the abdomen up of ${character.Name.FirstName} ${character.Name.LastName}, a ${character.Age}-year-old ${character.Name.Race} ${character.Name.Gender}. 
            Physical details: ${hair}, ${eyes}, ${skin}. 
            They are wearing ${clothing}.`;
            const prompt = customPrompt || defaultPrompt;
            
            const request = {
                model: imagenModel,
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/png',
                    aspectRatio: '3:4' as AspectRatio,
                },
            };
            
            addLog({ level: LogLevel.INFO, source: LogSource.HTTP, message: 'Sending Imagen API request for character image.', details: request });

            const response = await ai.models.generateImages(request);

            const loggedResponse = { ...response, generatedImages: response.generatedImages.map(img => ({ ...img, image: { ...img.image, imageBytes: truncateForLog(img.image.imageBytes) } })) };
            addLog({ level: LogLevel.DEBUG, source: LogSource.API, message: 'Received Imagen API response for character image.', details: loggedResponse });

            if (response.generatedImages && response.generatedImages.length > 0) {
                const imageUrl = `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
                updateCharacter(id, { image: imageUrl });
                addLog({ level: LogLevel.INFO, source: LogSource.AI, message: 'Character image generated successfully.', details: { id } });
            } else {
                throw new Error("Image generation returned no results.");
            }
        } catch (err: any) {
            const errorMessage = getApiErrorMessage(err, 'Imagen');
            addLog({ level: LogLevel.ERROR, source: LogSource.AI, message: `Character image generation failed: ${errorMessage}`, details: { message: err.message, stack: err.stack, response: err.response } });
            throw new Error(errorMessage);
        } finally {
            setIsCharacterImageLoading(prev => ({ ...prev, [id]: false }));
        }
    }, [characters, apiKey, imagenModel, imagenConfig, updateCharacter, addLog, setIsCharacterImageLoading]);
    
    const enhanceCharacterDetail = useCallback(async (id: string, detailType: CharacterDetailType) => {
        const character = characters[id];
        if (!character || !apiKey) {
            addLog({ level: LogLevel.WARN, source: LogSource.AI, message: 'Character or API key missing for detail enhancement.' });
            return;
        }
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `User enhancing ${detailType} for character ${id} with AI.` });
        setIsEnhancingDetail(true);
        showBusyIndicator(`AI is enhancing ${detailType}...`, 0);

        try {
            const ai = new GoogleGenAI({ apiKey });
            const existingDetails = JSON.stringify(character[detailType], null, 2);
            const characterSummary = `The character is a ${character.Age}-year-old ${character.Name.Gender} ${character.Name.Race} named ${character.Name.FirstName}. Story: ${character.Story.join(' ')}`;
            let prompt = `Based on the following character summary, enhance the character's ${detailType}.
Character: ${characterSummary}
Existing ${detailType}: ${existingDetails}
Please generate 3-5 new, creative, and fitting additions to the list. 
Your response must be ONLY a valid JSON array of strings (for Personality/Skills/Talents/Advantages/Disadvantages) or a JSON array of objects (for Possessions/Dresses), without any surrounding text or markdown. The structure must match the existing data.`;

            let responseSchema;
            switch (detailType) {
                case 'Personality':
                case 'Skills':
                case 'Talents':
                case 'Advantages':
                case 'Disadvantages':
                    responseSchema = { type: Type.ARRAY, items: { type: Type.STRING } };
                    break;
                case 'Possessions':
                    responseSchema = characterResponseSchema.properties.Possessions;
                    break;
                case 'Dresses':
                     responseSchema = characterResponseSchema.properties.Dresses;
                    break;
            }

            const request = {
                model: geminiModel,
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: responseSchema,
                }
            };
            addLog({ level: LogLevel.DEBUG, source: LogSource.HTTP, message: `Sending request to enhance character ${detailType}.`, details: { ...request, contents: truncateForLog(request.contents, 500) } });

            const response = await ai.models.generateContent(request);
            addLog({ level: LogLevel.DEBUG, source: LogSource.API, message: `Received enhancement response for ${detailType}.`, details: { text: response.text } });

            const cleanedText = response.text.trim();
            const newDetails = JSON.parse(cleanedText);
            addLog({ level: LogLevel.INFO, source: LogSource.AI, message: `Successfully enhanced ${detailType}.`, details: newDetails });

            const currentDetails = character[detailType] || [];
            const combinedDetails = [...(currentDetails as any[]), ...(newDetails as any[])];
            updateCharacter(id, { [detailType]: combinedDetails });
        } catch (err: any) {
            const errorMessage = getApiErrorMessage(err, 'Character Gen');
            addLog({ level: LogLevel.ERROR, source: LogSource.AI, message: `Character detail enhancement failed: ${errorMessage}`, details: { message: err.message, stack: err.stack, response: err.response } });
            alert(`Failed to enhance details: ${errorMessage}`);
        } finally {
            setIsEnhancingDetail(false);
            hideBusyIndicator();
        }
    }, [characters, apiKey, geminiModel, updateCharacter, addLog, setIsEnhancingDetail, showBusyIndicator, hideBusyIndicator]);
    
    const fixCharacterDetails = useCallback(async (id: string) => {
        const character = characters[id];
        if (!character || !apiKey) {
            addLog({ level: LogLevel.WARN, source: LogSource.AI, message: 'Character or API key missing for character fixing.' });
            return;
        }
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `User fixing character ${id} with AI.` });
        showBusyIndicator("AI is analyzing and fixing character data...", 0);
        try {
            const ai = new GoogleGenAI({ apiKey });
            const prompt = `The following character JSON object has missing information or placeholder default values (e.g., "New Character", empty arrays). Please analyze the existing data (name, age, race, story, etc.) and creatively fill in ALL missing or default values with plausible, detailed, and consistent information. Pay special attention to filling out arrays like Personality, Skills, Advantages, Disadvantages, BodyParts, etc., with at least a few meaningful entries if they are empty. Your output must be ONLY the corrected and completed JSON object, without any surrounding text or markdown.
    
Character to fix:
\`\`\`json
${JSON.stringify(character, null, 2)}
\`\`\``;
            const request = {
                model: geminiModel,
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: characterResponseSchema,
                }
            };
            addLog({ level: LogLevel.DEBUG, source: LogSource.HTTP, message: "Sending character to AI for fixing.", details: { ...request, contents: truncateForLog(prompt, 500) } });
            const response = await ai.models.generateContent(request);
            addLog({ level: LogLevel.DEBUG, source: LogSource.API, message: "Received AI character fix response.", details: { text: response.text } });

            const cleanedText = response.text.trim();
            const fixedJson = JSON.parse(cleanedText);
            
            // Use updateCharacter to merge and sanitize the AI's response
            updateCharacter(id, fixedJson);

            addLog({ level: LogLevel.INFO, source: LogSource.AI, message: "AI successfully fixed and updated the character.", details: fixedJson });
            alert("Character details have been successfully fixed and updated by the AI.");
        } catch (err: any) {
            const errorMessage = getApiErrorMessage(err, 'Character Gen');
            addLog({ level: LogLevel.ERROR, source: LogSource.AI, message: `Failed to fix character with AI: ${errorMessage}`, details: { message: err.message, stack: err.stack, response: err.response } });
            alert(`Error fixing character: ${errorMessage}`);
        } finally {
            hideBusyIndicator();
        }
    }, [characters, apiKey, geminiModel, updateCharacter, showBusyIndicator, hideBusyIndicator, addLog]);


    // --- VISION STATE & ACTIONS ---
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedFeatures, setSelectedFeatures] = useLocalStorage<VisionFeatureType[]>('visionFeatures', [...VISION_FEATURES.map(f => f.id)]);
    const [isLoading, setIsLoading] = useState(false);
    const [resultMarkdown, setResultMarkdown] = useState<string | null>(null);
    const [resultJson, setResultJson] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [kijkwijzerResult, setKijkwijzerResult] = useState<KijkwijzerResult | null>(null);

    const handleImageUpload = (imageData: string | null, file?: File) => {
        addLog({
            level: LogLevel.INFO,
            source: LogSource.GENERAL,
            message: imageData ? 'Image uploaded for Vision analysis.' : 'Image upload cleared.',
            details: file ? { fileName: file.name, size: file.size, type: file.type } : null
        });
        setSelectedImage(imageData);
        setResultMarkdown(null);
        setResultJson(null);
        setError(null);
        setKijkwijzerResult(null);
    };

    const handleFeatureChange = (feature: VisionFeatureType) => {
        addLog({ level: LogLevel.DEBUG, source: LogSource.GENERAL, message: `Vision feature toggled: ${feature}` });
        setSelectedFeatures(prev => prev.includes(feature)
            ? prev.filter(f => f !== feature)
            : [...prev, feature]);
    };

    const analyzeImageWithVision = useCallback(async (base64ImageData: string, features: VisionFeatureType[]) => {
        if (!apiKey) {
            throw new Error('API key must be provided to analyze images.');
        }

        const requestBody = {
            requests: [
                {
                    image: { content: base64ImageData },
                    features: features.map(type => ({ type, maxResults: 50 })),
                },
            ],
        };

        addLog({
            level: LogLevel.DEBUG,
            source: LogSource.HTTP,
            message: 'Sending Vision API request.',
            details: { url: 'https://vision.googleapis.com/v1/images:annotate', body: { ...requestBody, requests: [{...requestBody.requests[0], image: { content: truncateForLog(requestBody.requests[0].image.content) }}] } }
        });

        const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        
        const responseData = await response.json().catch(() => ({}));
        
        addLog({
            level: LogLevel.DEBUG,
            source: LogSource.API,
            message: `Received Vision API response (status: ${response.status}).`,
            details: responseData
        });

        if (!response.ok) {
            throw new Error(responseData?.error?.message || `HTTP error! status: ${response.status}`);
        }
        return responseData;
    }, [apiKey, addLog]);


    const handleAnalyzeClick = useCallback(async () => {
        if (!selectedImage || selectedFeatures.length === 0) return;

        setIsLoading(true);
        setError(null);
        setResultMarkdown(null);
        setResultJson(null);
        setKijkwijzerResult(null);
        addLog({ level: LogLevel.INFO, source: LogSource.API, message: `Starting Vision API analysis.` });
        showBusyIndicator("Analyzing image with Vision AI...", 3000);

        try {
            if (!apiKey) throw new Error("API Key is required.");
            const base64Data = selectedImage.split(',')[1];
            const response = await analyzeImageWithVision(base64Data, selectedFeatures);

            if (response.responses && response.responses[0]) {
                const visionResult = response.responses[0];
                const markdown = parseVisionResponse(visionResult, selectedImage);
                setResultMarkdown(markdown);
                setResultJson(visionResult);
                setKijkwijzerResult(mapVisionToKijkwijzer(visionResult.safeSearchAnnotation));
                addLog({ level: LogLevel.INFO, source: LogSource.API, message: 'Vision API analysis successful.', details: visionResult });
            } else if (response.error) {
                throw new Error(response.error.message || "Unknown API error");
            } else {
                throw new Error("Invalid response structure from Vision API.");
            }
        } catch (err: any) {
            const errorMessage = getApiErrorMessage(err, 'Vision');
            setError(errorMessage);
            addLog({ level: LogLevel.ERROR, source: LogSource.API, message: `Vision API analysis failed: ${errorMessage}`, details: { message: err.message, stack: err.stack, response: err.response } });
        } finally {
            setIsLoading(false);
            hideBusyIndicator();
        }
    }, [selectedImage, selectedFeatures, apiKey, addLog, analyzeImageWithVision, showBusyIndicator, hideBusyIndicator]);

    // --- IMAGEN STATE & ACTIONS ---
    const [isImagenLoading, setIsImagenLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [imagenPrompt, setImagenPrompt] = useState<string | null>(null);
    const [imagenError, setImagenError] = useState<string | null>(null);
    const [isVisionForImagenLoading, setIsVisionForImagenLoading] = useState(false);
    const [visionForImagenResult, setVisionForImagenResult] = useState<string | null>(null);
    const [visionForImagenJson, setVisionForImagenJson] = useState<any | null>(null);
    const [visionForImagenError, setVisionForImagenError] = useState<string | null>(null);
    const [kijkwijzerForImagen, setKijkwijzerForImagen] = useState<KijkwijzerResult | null>(null);


    const generateImage = useCallback(async (prompt: string) => {
        setIsImagenLoading(true);
        setImagenError(null);
        setGeneratedImage(null);
        setImagenPrompt(prompt);
        setVisionForImagenResult(null);
        setVisionForImagenJson(null);
        setVisionForImagenError(null);
        setKijkwijzerForImagen(null);
        
        addLog({ level: LogLevel.INFO, source: LogSource.AI, message: `Generating image with prompt: "${prompt}"` });
        showBusyIndicator("Generating image with Imagen...", 0);

        try {
            if (!apiKey) throw new Error("API Key is required.");
            const ai = new GoogleGenAI({ apiKey });
            const fullPrompt = `${prompt}, in the style of ${imagenConfig.style}`;

            const request = {
                model: imagenModel,
                prompt: fullPrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/png',
                    aspectRatio: imagenConfig.aspectRatio,
                }
            };
            addLog({ level: LogLevel.DEBUG, source: LogSource.HTTP, message: 'Sending Imagen API request.', details: request });
            
            const response = await ai.models.generateImages(request);
            
            const loggedResponse = { ...response, generatedImages: response.generatedImages.map(img => ({ ...img, image: { ...img.image, imageBytes: truncateForLog(img.image.imageBytes) } })) };
            addLog({ level: LogLevel.DEBUG, source: LogSource.API, message: 'Received Imagen API response.', details: loggedResponse });

            if (response.generatedImages && response.generatedImages.length > 0) {
                const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                setGeneratedImage(imageUrl);
                addLog({ level: LogLevel.INFO, source: LogSource.AI, message: 'Image generation successful.' });
                
                // Now, analyze the generated image with Vision AI
                setIsVisionForImagenLoading(true);
                try {
                    const visionResponse = await analyzeImageWithVision(base64ImageBytes, ['SAFE_SEARCH_DETECTION']);
                     if (visionResponse.responses && visionResponse.responses[0]) {
                        const visionResult = visionResponse.responses[0];
                        const markdown = parseVisionResponse(visionResult, imageUrl);
                        setVisionForImagenResult(markdown);
                        setVisionForImagenJson(visionResult);
                        setKijkwijzerForImagen(mapVisionToKijkwijzer(visionResult.safeSearchAnnotation));
                        addLog({ level: LogLevel.INFO, source: LogSource.API, message: 'Imagen post-analysis successful.', details: visionResult });
                    } else if (visionResponse.error) {
                        throw new Error(visionResponse.error.message);
                    }
                } catch (visionErr: any) {
                    const visionErrorMessage = getApiErrorMessage(visionErr, 'Vision');
                    setVisionForImagenError(visionErrorMessage);
                    addLog({ level: LogLevel.ERROR, source: LogSource.API, message: `Imagen post-analysis failed: ${visionErrorMessage}`, details: { message: visionErr.message, stack: visionErr.stack, response: visionErr.response } });
                } finally {
                    setIsVisionForImagenLoading(false);
                }

            } else {
                throw new Error("Image generation returned no images.");
            }

        } catch (err: any) {
            const errorMessage = getApiErrorMessage(err, 'Imagen');
            setImagenError(errorMessage);
            addLog({ level: LogLevel.ERROR, source: LogSource.AI, message: `Imagen generation failed: ${errorMessage}`, details: { message: err.message, stack: err.stack, response: err.response } });
        } finally {
            setIsImagenLoading(false);
            hideBusyIndicator();
        }
    }, [apiKey, imagenModel, addLog, imagenConfig, analyzeImageWithVision, showBusyIndicator, hideBusyIndicator]);

    // --- GEMINI STATE & ACTIONS ---
    const [chatHistory, setChatHistory] = useLocalStorage<ChatMessage[]>('chatHistory', []);
    const [isGeminiLoading, setIsGeminiLoading] = useState(false);
    const [employeeStates, setEmployeeStates] = useLocalStorage<Record<string, EmployeeState>>('employeeStates', {});
    const [thinkingEmployeeId, setThinkingEmployeeId] = useState<string[]>([]);
    const [isAutoReplyEnabled, setIsAutoReplyEnabled] = useLocalStorage<boolean>('isAutoReplyEnabled', false);
    const [autoReplyInterval, setAutoReplyInterval] = useLocalStorage<AutoReplyIntervalValue>('autoReplyInterval', 10);
    const [autoReplyChance, setAutoReplyChance] = useLocalStorage<AutoReplyChanceValue>('autoReplyChance', 0.90);
    
    const messageQueue = useRef<Array<{text: string; isVisible: boolean}>>([]);
    const isProcessingQueue = useRef(false);
    const stopGeneratingRef = useRef(false);
    const autoReplyTimer = useRef<number | null>(null);

    // --- PARALLEL WORKFLOW STATE ---
    const taskQueueRef = useRef<any[]>([]);
    const completedTasksRef = useRef<any[]>([]);
    const failedTasksRef = useRef<any[]>([]);
    const planExecutorRef = useRef<string | null>(null);
    
    // This effect is the single source of truth for turning OFF the loading indicator.
    // It turns off when the main queue is done AND all background workers are done.
    useEffect(() => {
        if (!isProcessingQueue.current && thinkingEmployeeId.length === 0) {
            setIsGeminiLoading(false);
        }
    }, [isProcessingQueue.current, thinkingEmployeeId]);
    
    const startNewChat = useCallback(() => {
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: 'New chat started.' });
        setChatHistory([]);
        setEmployeeStates({});
    }, [setChatHistory, setEmployeeStates, addLog]);
    
    const toggleEmployeeSelection = useCallback((employeeId: string) => {
        setSelectedEmployees(prev => prev.includes(employeeId)
            ? prev.filter(id => id !== employeeId)
            : [...prev, employeeId]);
    }, [setSelectedEmployees]);

    const addMultipleEmployeesToSelection = useCallback((employeeIds: string[]) => {
        setSelectedEmployees(prev => {
            const newSet = new Set([...prev, ...employeeIds]);
            return Array.from(newSet);
        });
    }, [setSelectedEmployees]);

    const setEmployeeState = useCallback((employeeId: string, state: EmployeeState) => {
        setEmployeeStates(prev => ({ ...prev, [employeeId]: state }));
    }, [setEmployeeStates]);

    const saveChatHistory = useCallback(() => {
        if (chatHistory.length === 0) return;
        const blob = new Blob([JSON.stringify(chatHistory, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gemini-chat-${new Date().toISOString()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: 'Chat history saved.' });
    }, [chatHistory, addLog]);

    const addErrorMessageToChat = useCallback((errorMessage: string) => {
        setChatHistory(prev => [...prev, {
            id: `error-${Date.now()}`,
            role: 'employee',
            employeeId: 'katja_bergman', // Katje is the system admin, good for error messages
            content: `I've encountered a problem: ${errorMessage}`
        }]);
    }, [setChatHistory]);
    
    // --- PARALLEL WORKFLOW FUNCTIONS ---
    
    const processMessageQueue = useCallback(async () => {
        if (isProcessingQueue.current || messageQueue.current.length === 0) return;
        
        isProcessingQueue.current = true;
        setIsGeminiLoading(true);
        stopGeneratingRef.current = false;
        
        const messagePayload = messageQueue.current.shift();
        if (!messagePayload) {
            isProcessingQueue.current = false;
            setIsGeminiLoading(false);
            return;
        }

        if (messagePayload.isVisible) {
            setChatHistory(prev => [...prev, { id: `user-${Date.now()}`, role: 'user', content: messagePayload.text }]);
        }

        const message = messagePayload.text;
        let parsedResponse: any = null;

        try {
            if (!apiKey) throw new Error("API Key is required.");
            const ai = new GoogleGenAI({ apiKey });
            const allEmployeeObjects = Object.values(allEmployees);
            if (allEmployeeObjects.length === 0) throw new Error("No employees loaded.");
            
            const allEmployeeIds = Object.keys(allEmployees);

            const systemInstruction = (await (await fetch('/instructions.txt')).text())
                .replace('${userName}', userName)
                .replace('${WORLD_JSON}', JSON.stringify(world, null, 2))
                .replace('${CHARACTERS_JSON}', JSON.stringify(Object.fromEntries(Object.entries(characters).map(([id, char]) => [id, stripCharacterImages({[id]: char})[id]])), null, 2))
                .replace('${EMPLOYEES_LIST}', allEmployeeObjects.map(e => `- ${JSON.stringify({ id: e.id, name: e.name, function: e.function })}`).join('\n'))
                .replace('${EMPLOYEE_NAMES_LIST}', allEmployeeObjects.map(e => e.name).join(', '))
                .replace('${CHAT_HISTORY}', chatHistory.slice(-10).map(m => `${m.role === 'user' ? userName : m.employeeId ? allEmployees[m.employeeId]?.name : 'AI Team'}: ${m.content}`).join('\n'));
            
            const actionPropertiesSchema = {
                type: { type: Type.STRING, enum: ['create_character', 'update_character', 'generate_character_image', 'update_world', 'generate_new_world'] },
                characterData: characterResponseSchema,
                characterId: { type: Type.STRING },
                updates: { type: Type.STRING, description: "A stringified JSON object containing partial character or world data." },
                prompt: { type: Type.STRING },
            };
            
            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    employeeId: { type: Type.STRING, description: "ID of the responding employee.", enum: allEmployeeIds },
                    emotionalState: { type: Type.STRING, description: `Emotional state. Must be one of: ${emotionalStates.join(', ')}.`, enum: [...emotionalStates] },
                    response: { type: Type.STRING, description: "The employee's message to the user." },
                    actions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                ...actionPropertiesSchema,
                                type: { type: Type.STRING, enum: ['create_character', 'update_character', 'generate_character_image', 'update_world', 'generate_new_world', 'plan_tasks'] },
                                tasks: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            name: { type: Type.STRING },
                                            action: {
                                                type: Type.OBJECT,
                                                properties: actionPropertiesSchema,
                                                required: ['type']
                                            }
                                        },
                                        required: ['name', 'action']
                                    }
                                }
                            },
                            required: ['type']
                        }
                    }
                },
                required: ['employeeId', 'emotionalState', 'response', 'actions']
            };

            const request: any = {
                model: geminiModel,
                contents: [{ role: 'user', parts: [{ text: message }] }],
                systemInstruction: { parts: [{ text: systemInstruction }] },
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
                ],
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: responseSchema,
                }
            };
            
            const isPlanningRequest = message.toLowerCase().includes('create') || message.toLowerCase().includes('add') || message.toLowerCase().includes('generate multiple');
            if(isPlanningRequest && geminiModel === 'gemini-2.5-flash') {
                 request.config.thinkingConfig = { thinkingBudget: 0 };
            }

            addLog({ level: LogLevel.DEBUG, source: LogSource.HTTP, message: 'Sending Gemini API request.', details: { ...request, systemInstruction: { parts: [{ text: truncateForLog(systemInstruction, 1000) }] } } });
            setThinkingEmployeeId([allEmployeeObjects[0].id]);
            
            const result = await ai.models.generateContent(request);

            addLog({ level: LogLevel.DEBUG, source: LogSource.API, message: 'Received Gemini API response.', details: { text: result.text } });
            parsedResponse = JSON.parse(result.text.trim());
            addLog({ level: LogLevel.DEBUG, source: LogSource.AI, message: 'Parsed Gemini AI response.', details: parsedResponse });

            const { employeeId, emotionalState, response, actions } = parsedResponse;
            if (!employeeId || !response) throw new Error("AI response missing required fields.");
            
            setThinkingEmployeeId([employeeId]);
            if (emotionalState) setEmployeeState(employeeId, { emotionalState });
            setChatHistory(prev => [...prev, { id: `employee-${Date.now()}`, role: 'employee', employeeId, content: response }]);
            
            if (actions && Array.isArray(actions) && actions.length > 0) {
                const planAction = actions.find(a => a.type === 'plan_tasks');
                const generateWorldAction = actions.find(a => a.type === 'generate_new_world');

                if (generateWorldAction && generateWorldAction.prompt) {
                    await generateNewWorld(generateWorldAction.prompt);
                }
                
                if (planAction) {
                    if (planAction.tasks && planAction.tasks.length > 0) {
                        taskQueueRef.current = [...planAction.tasks];
                        completedTasksRef.current = [];
                        failedTasksRef.current = [];
                        planExecutorRef.current = employeeId;
                        setThinkingEmployeeId([]); // Clear the planner, let workers take over
                    }
                } else {
                     addLog({ level: LogLevel.WARN, source: LogSource.AI, message: "AI deviated from plan_tasks instruction. Converting actions to parallel tasks.", details: actions });
                    const tasks = actions.filter(a => a.type !== 'generate_new_world').map((action, index) => ({
                        name: action.type.replace(/_/g, ' ') + ` ${index + 1}`,
                        action: action,
                    }));
                    if (tasks.length > 0) {
                        taskQueueRef.current = tasks;
                        completedTasksRef.current = [];
                        failedTasksRef.current = [];
                        planExecutorRef.current = employeeId;
                        setThinkingEmployeeId([]); // Clear the planner, let workers take over
                    } else {
                         setThinkingEmployeeId([]);
                    }
                }
            } else {
                setThinkingEmployeeId([]);
            }
        } catch (err: any) {
            const errorMessage = getApiErrorMessage(err, 'Gemini');
            addErrorMessageToChat(errorMessage);
            addLog({ level: LogLevel.ERROR, source: LogSource.AI, message: `Gemini response failed: ${errorMessage}`, details: { message: err.message, stack: err.stack, response: err.response } });
            setThinkingEmployeeId([]);
        } finally {
            isProcessingQueue.current = false;
            if (messageQueue.current.length > 0) {
                processMessageQueue().catch(err => addErrorMessageToChat(`A critical error occurred while processing the next message in the queue: ${getApiErrorMessage(err, 'Gemini')}`));
            }
        }
    }, [apiKey, geminiModel, world, characters, allEmployees, userName, userGender, chatHistory, addLog, addErrorMessageToChat, setEmployeeState, setChatHistory, addCharacterFromAi, updateCharacter, generateCharacterImage, updateWorld, generateNewWorld, selectedEmployees]);
    
    const executeTask = useCallback(async (task: any, workerId: string) => {
        try {
            setThinkingEmployeeId(prev => [...new Set([...prev, workerId])]);
            const subAction = task.action;
            const taskName = task.name || subAction.type;
            
            switch (subAction.type) {
                case 'create_character':
                    const newChar = await addCharacterFromAi(subAction.characterData || {});
                    completedTasksRef.current.push({ ...task, result: `Created character: ${newChar.Name.FirstName}` });
                    setChatHistory(prev => [...prev, { id: `action-done-${newChar.id}`, role: 'employee', employeeId: workerId, content: `I've finished creating ${newChar.Name.FirstName} ${newChar.Name.LastName}.` }]);
                    break;
                
                case 'update_character':
                    if (subAction.characterId && subAction.updates && typeof subAction.updates === 'string') {
                        const parsedUpdates = JSON.parse(subAction.updates);
                        updateCharacter(subAction.characterId, parsedUpdates);
                        const charName = characters[subAction.characterId]?.Name?.FirstName || 'the character';
                        completedTasksRef.current.push({ ...task, result: `Updated ${charName}.` });
                        setChatHistory(prev => [...prev, { id: `action-done-${Date.now()}`, role: 'employee', employeeId: workerId, content: `I've finished updating ${charName}.` }]);
                    } else {
                         throw new Error("Missing characterId or updates for update_character task.");
                    }
                    break;

                case 'generate_character_image':
                    if (subAction.characterId) {
                        const charName = characters[subAction.characterId]?.Name?.FirstName || 'the character';
                        setChatHistory(prev => [...prev, { id: `action-start-img-${Date.now()}`, role: 'employee', employeeId: workerId, content: `I'm starting to generate an image for ${charName}...` }]);
                        await generateCharacterImage(subAction.characterId, subAction.prompt);
                        completedTasksRef.current.push({ ...task, result: `Generated image for ${charName}.` });
                    } else {
                        throw new Error("Missing characterId for generate_character_image task.");
                    }
                    break;
                
                case 'update_world':
                    if (subAction.updates && typeof subAction.updates === 'string') {
                        const parsedUpdates = JSON.parse(subAction.updates);
                        updateWorld(parsedUpdates);
                        completedTasksRef.current.push({ ...task, result: `Updated world with new data.` });
                        setChatHistory(prev => [...prev, { id: `action-done-${Date.now()}`, role: 'employee', employeeId: workerId, content: `I've finished the task: ${taskName}.` }]);
                    }
                    break;
                
                default:
                    throw new Error(`Unsupported sub-task action type: ${subAction.type}`);
            }
        } catch (err: any) {
            addLog({ level: LogLevel.ERROR, source: LogSource.AI, message: `Worker ${workerId} failed task '${task.name}'.`, details: { message: err.message, stack: err.stack, response: err.response } });
            failedTasksRef.current.push({ ...task, error: err.message });
            setChatHistory(prev => [...prev, { id: `action-fail-${Date.now()}`, role: 'employee', employeeId: workerId, content: `I ran into an issue trying to complete my task '${task.name}'. I'll let the project lead know.` }]);
        } finally {
            setThinkingEmployeeId(prev => prev.filter(id => id !== workerId));
        }
    }, [apiKey, geminiModel, addCharacterFromAi, updateWorld, updateCharacter, generateCharacterImage, characters, allEmployees, addLog, setChatHistory]);
    
    const generateFinalReport = useCallback(async () => {
        if (!planExecutorRef.current) return;
        
        const leadEmployeeId = planExecutorRef.current;
        planExecutorRef.current = null; // Clear the executor to prevent re-triggering
        
        const prompt = `Your team has finished executing a plan. 
    Total tasks: ${completedTasksRef.current.length + failedTasksRef.current.length}.
    Successfully completed: ${completedTasksRef.current.length}.
    Failed: ${failedTasksRef.current.length}.
    
    Completed tasks:
    ${completedTasksRef.current.map(t => `- ${t.name}: ${t.result}`).join('\n') || 'None.'}
    
    Failed tasks (if any):
    ${failedTasksRef.current.map(t => `- ${t.name}: ${t.error}`).join('\n') || 'None.'}
    
    Please provide a concise final summary report to the user. Acknowledge what was done and mention any failures.`;
        
        messageQueue.current.push({ text: prompt, isVisible: false });
        if (!isProcessingQueue.current) {
            processMessageQueue().catch(err => addErrorMessageToChat(`Error generating final report: ${getApiErrorMessage(err, 'Gemini')}`));
        }
    }, [allEmployees, addErrorMessageToChat, processMessageQueue]);

    const dispatchNextTasks = useCallback(() => {
        const availableWorkers = selectedEmployees.filter(id => !thinkingEmployeeId.includes(id));
        const tasksToDispatchCount = Math.min(availableWorkers.length, taskQueueRef.current.length);

        if (tasksToDispatchCount > 0) {
            const tasksToRun = taskQueueRef.current.splice(0, tasksToDispatchCount);
            tasksToRun.forEach((task, index) => {
                const workerId = availableWorkers[index];
                executeTask(task, workerId);
            });
        }
    }, [selectedEmployees, thinkingEmployeeId, executeTask]);
    
     useEffect(() => {
        const hasTasks = taskQueueRef.current.length > 0;
        const hasIdleWorkers = thinkingEmployeeId.length < selectedEmployees.length;

        if (hasTasks && hasIdleWorkers) {
            dispatchNextTasks();
        } else if (!hasTasks && thinkingEmployeeId.length === 0 && planExecutorRef.current) {
            generateFinalReport();
        }
    }, [thinkingEmployeeId, selectedEmployees.length, dispatchNextTasks, generateFinalReport]);

    const sendGeminiMessage = useCallback((message: string) => {
        messageQueue.current.push({ text: message, isVisible: true });
        if (!isProcessingQueue.current) {
            processMessageQueue().catch(err => {
                const errorMessage = getApiErrorMessage(err, 'Gemini');
                addErrorMessageToChat(`A critical error occurred while sending your message: ${errorMessage}`);
                addLog({ level: LogLevel.ERROR, source: LogSource.GENERAL, message: 'A critical error occurred starting the message processing queue.', details: err.toString() });
            });
        }
    }, [addErrorMessageToChat, addLog, processMessageQueue]);

    const sendEventMessage = useCallback((eventText: string) => {
        const systemMessage = `A random event occurs: ${eventText}`;
        setChatHistory(prev => [...prev, {
            id: `event-${Date.now()}`,
            role: 'employee',
            employeeId: 'katja_bergman',
            content: systemMessage
        }]);
        messageQueue.current.push({ text: `React to this event: ${eventText}`, isVisible: false });
        if (!isProcessingQueue.current) {
            processMessageQueue().catch(err => {
                 const errorMessage = getApiErrorMessage(err, 'Gemini');
                addErrorMessageToChat(`A critical error occurred while triggering an AI response: ${errorMessage}`);
                addLog({ level: LogLevel.ERROR, source: LogSource.GENERAL, message: 'A critical error occurred triggering an AI response.', details: err.toString() });
            });
        }
    }, [setChatHistory, addErrorMessageToChat, addLog, processMessageQueue]);

    const continueGeminiConversation = useCallback(() => {
        messageQueue.current.push({ text: "Continue the conversation. Ask a question, suggest a character change, or come up with a new character idea. Adhere strictly to the JSON output format.", isVisible: false });
        if (!isProcessingQueue.current) {
            processMessageQueue().catch(err => {
                 const errorMessage = getApiErrorMessage(err, 'Gemini');
                addErrorMessageToChat(`A critical error occurred while triggering an AI response: ${errorMessage}`);
                addLog({ level: LogLevel.ERROR, source: LogSource.GENERAL, message: 'A critical error occurred triggering an AI response.', details: err.toString() });
            });
        }
    }, [addErrorMessageToChat, addLog, processMessageQueue]);

    const stopGeminiResponse = useCallback(() => {
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: 'User stopped Gemini response generation.' });
        stopGeneratingRef.current = true;
        setIsGeminiLoading(false);
        setThinkingEmployeeId([]);
        isProcessingQueue.current = false;
        messageQueue.current = [];
    }, [addLog]);
    
    const sendImageToChat = useCallback((payload: { imageBase64: string; analysis?: any; prompt?: string }) => {
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: 'Image sent to Gemini chat.' });
        setAppMode(AppMode.GEMINI);
        const messageContent = payload.prompt
            ? `I've generated this image with the prompt: "${payload.prompt}". Here is the vision analysis. What do you all think?`
            : `I've analyzed this image and here is the report. Let's discuss it.`;
        setChatHistory(prev => [...prev, {
            id: `img-${Date.now()}`,
            role: 'employee',
            employeeId: 'katja_bergman', // Katja is the photographer
            content: messageContent,
            imageUrl: payload.imageBase64,
            imageAnalysis: payload.analysis,
        }]);
        sendGeminiMessage("Based on the image and analysis I just shared, what are your thoughts?");
    }, [setAppMode, setChatHistory, sendGeminiMessage, addLog]);

    useEffect(() => {
        if (autoReplyTimer.current) clearTimeout(autoReplyTimer.current);
        if (appMode === AppMode.GEMINI && isAutoReplyEnabled && !isGeminiLoading) {
            autoReplyTimer.current = window.setTimeout(() => {
                if (Math.random() < autoReplyChance) {
                    if (chatHistory.length === 0) {
                        messageQueue.current.push({ text: "Start a new conversation. Introduce a topic related to our world-building project, ask the user a question, or propose a new character idea. Adhere strictly to the JSON output format.", isVisible: false });
                        processMessageQueue().catch(err => addErrorMessageToChat(`A critical error occurred while processing the auto-reply queue: ${getApiErrorMessage(err, 'Gemini')}`));
                    } else {
                        continueGeminiConversation();
                    }
                }
            }, autoReplyInterval * 1000);
        }
        return () => { if (autoReplyTimer.current) clearTimeout(autoReplyTimer.current); };
    }, [appMode, isAutoReplyEnabled, autoReplyInterval, autoReplyChance, chatHistory, isGeminiLoading, continueGeminiConversation, processMessageQueue, addErrorMessageToChat]);
    
    // --- FINAL CONTEXT VALUE ---
    const valueRef = useRef<AppContextType | undefined>();
    const value: AppContextType = {
        theme, toggleTheme, openDialog, showDialog, apiKey, setApiKey, geminiModel, setGeminiModel, imagenModel, setImagenModel, logs, addLog, clearAndSaveLogs, appMode, setAppMode, userName, setUserName, userGender, setUserGender, isNsfwMode, toggleNsfwMode, isBusy, busyMessage,
        world, updateWorld, importWorld, exportWorld, isExportingWorldPdf, generateWorldHeaderImage, uploadWorldImage, removeWorldImage, generateNewWorld,
        characters, selectedCharacterId, isCharacterImageLoading, isEnhancingDetail, selectCharacter, createNewCharacter, updateCharacter, deleteCharacter, deleteAllCharacters, deletionTarget, confirmDeletion, importCharacter, importCharacterFromMarkdown, loadCharacters, saveAllCharacters, exportCharacter, generateCharacterImage, enhanceCharacterDetail, fixCharacterDetails, isExportingPdf, editTarget, setEditTarget,
        selectedImage, selectedFeatures, isLoading, resultMarkdown, resultJson, error, kijkwijzerResult, handleImageUpload, handleFeatureChange, handleAnalyzeClick, sendImageToChat,
        chatHistory, isGeminiLoading, allCompanies, allEmployees, selectedEmployees, employeeStates, thinkingEmployeeId, isAutoReplyEnabled, setIsAutoReplyEnabled, autoReplyInterval, setAutoReplyInterval, autoReplyChance, setAutoReplyChance, startNewChat, sendGeminiMessage, toggleEmployeeSelection, addMultipleEmployeesToSelection, setEmployeeState, saveChatHistory, sendEventMessage, continueGeminiConversation, stopGeminiResponse,
        imagenConfig, setImagenConfig, isImagenLoading, generatedImage, imagenPrompt, imagenError, generateImage, isVisionForImagenLoading, visionForImagenResult, visionForImagenJson, visionForImagenError, kijkwijzerForImagen,
    };
    valueRef.current = value;

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = use(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
