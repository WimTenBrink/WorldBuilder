import React, { useState, useEffect } from 'react';
import Dialog from '../ui/Dialog';
import { useAppContext } from '../../context/AppContext';
import { DialogType, GEMINI_MODELS, UserGender, USER_GENDERS } from '../../types';
import SaveIcon from '../icons/SaveIcon';
import CancelIcon from '../icons/CancelIcon';

const SettingsDialog: React.FC = () => {
    const { 
        openDialog, 
        showDialog, 
        apiKey,
        setApiKey,
        geminiModel, 
        setGeminiModel,
        imagenModel,
        setImagenModel,
        userName,
        setUserName,
        userGender,
        setUserGender
    } = useAppContext();

    const [localApiKey, setLocalApiKey] = useState(apiKey);
    const [localGeminiModel, setLocalGeminiModel] = useState(geminiModel);
    const [localImagenModel, setLocalImagenModel] = useState(imagenModel);
    const [localUserName, setLocalUserName] = useState(userName);
    const [localUserGender, setLocalUserGender] = useState(userGender);

    useEffect(() => {
        setLocalApiKey(apiKey);
        setLocalGeminiModel(geminiModel);
        setLocalImagenModel(imagenModel);
        setLocalUserName(userName);
        setLocalUserGender(userGender);
    }, [apiKey, geminiModel, imagenModel, userName, userGender, openDialog]);

    const handleSave = () => {
        setApiKey(localApiKey);
        setGeminiModel(localGeminiModel);
        setImagenModel(localImagenModel);
        setUserName(localUserName);
        setUserGender(localUserGender);
        showDialog(null);
    };

    const geminiModels = GEMINI_MODELS.filter(m => m.family === 'Gemini');
    const imagenModels = GEMINI_MODELS.filter(m => m.family === 'Imagen');


    return (
        <Dialog
            isOpen={openDialog === DialogType.Settings}
            onClose={() => showDialog(null)}
            title="Settings"
        >
            <div className="space-y-6 text-text-primary-light dark:text-text-primary-dark">
                <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900/50 border border-border-light dark:border-border-dark">
                    <h3 className="text-lg font-semibold mb-2 text-primary-light dark:text-primary-dark">User Personalization</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="userName" className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                                Your Name
                            </label>
                            <input
                                type="text"
                                id="userName"
                                value={localUserName}
                                onChange={(e) => setLocalUserName(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-200 dark:bg-slate-700 border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                                placeholder="Enter your name"
                            />
                        </div>
                        <div>
                            <label htmlFor="userGender" className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                                Your Gender
                            </label>
                            <select
                                id="userGender"
                                value={localUserGender}
                                onChange={(e) => setLocalUserGender(e.target.value as UserGender)}
                                className="w-full px-3 py-2 bg-slate-200 dark:bg-slate-700 border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                            >
                                {USER_GENDERS.map(gender => (
                                    <option key={gender} value={gender}>{gender}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900/50 border border-border-light dark:border-border-dark">
                    <h3 className="text-lg font-semibold mb-2 text-primary-light dark:text-primary-dark">AI Configuration</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="apiKey" className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                                Google Gemini API Key
                            </label>
                            <input
                                type="text"
                                id="apiKey"
                                value={localApiKey}
                                onChange={(e) => setLocalApiKey(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-200 dark:bg-slate-700 border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                                placeholder="Enter your API Key here"
                            />
                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                                Your key is stored in your browser's local storage and is never sent to our servers.
                            </p>
                        </div>
                        <div>
                            <label htmlFor="geminiModel" className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                                Gemini Model (for Chat)
                            </label>
                            <select
                                id="geminiModel"
                                value={localGeminiModel}
                                onChange={(e) => setLocalGeminiModel(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-200 dark:bg-slate-700 border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                            >
                            {geminiModels.map((model) => (
                                    <option key={model.name} value={model.name} className="font-normal p-2">
                                        {model.name} ({model.status}) - {model.description}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="imagenModel" className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                                Imagen Model (for Image Generation)
                            </label>
                            <select
                                id="imagenModel"
                                value={localImagenModel}
                                onChange={(e) => setLocalImagenModel(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-200 dark:bg-slate-700 border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                            >
                            {imagenModels.map((model) => (
                                    <option key={model.name} value={model.name} className="font-normal p-2">
                                        {model.name} ({model.status}) - {model.description}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end gap-4 pt-4">
                    <button
                        onClick={() => showDialog(null)}
                        className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-colors text-text-primary-light dark:text-text-primary-dark bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500"
                    >
                        <CancelIcon className="w-5 h-5" />
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-colors text-white bg-primary-light dark:bg-indigo-500 hover:bg-primary-light/90 dark:hover:bg-indigo-500/90"
                    >
                        <SaveIcon className="w-5 h-5" />
                        Save Settings
                    </button>
                </div>
            </div>
        </Dialog>
    );
};

export default SettingsDialog;