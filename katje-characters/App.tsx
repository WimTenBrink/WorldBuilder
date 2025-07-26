import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LeftSidebar from './components/LeftSidebar';
import MainContent from './components/MainContent';
import RightSidebar from './components/RightSidebar';
import { AppProvider } from './context/AppContext';
import SettingsDialog from './components/dialogs/SettingsDialog';
import TermsDialog from './components/dialogs/TermsDialog';
import AboutDialog from './components/dialogs/AboutDialog';
import ConsoleDialog from './components/dialogs/ConsoleDialog';
import RandomEventDialog from './components/dialogs/RandomEventDialog';
import EditCharacterDialog from './components/dialogs/EditCharacterDialog';
import GlobalBusyIndicator from './components/ui/GlobalBusyIndicator';
import ErrorBoundaryWithContext from './components/ErrorBoundary';
import GenerateImageDialog from './components/dialogs/GenerateImageDialog';
import ConfirmDeleteDialog from './components/dialogs/ConfirmDeleteDialog';
import EditWorldDialog from './components/dialogs/EditWorldDialog';
import ThemeDialog from './components/dialogs/ThemeDialog';
import NewWorldDialog from './components/dialogs/NewWorldDialog';

function App() {
  return (
    <AppProvider>
      <ErrorBoundaryWithContext>
        <div className="flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark">
          <Header />
          <div className="flex flex-grow h-[80vh] overflow-hidden">
            <div style={{ width: '20vw' }} className="hidden md:flex flex-col h-full flex-shrink-0">
              <LeftSidebar />
            </div>
            <div className="flex-grow h-full overflow-hidden">
              <MainContent />
            </div>
             <div style={{ width: '20vw' }} className="hidden lg:flex flex-col h-full flex-shrink-0">
              <RightSidebar />
            </div>
          </div>
          <Footer />
        </div>
        <SettingsDialog />
        <TermsDialog />
        <AboutDialog />
        <ConsoleDialog />
        <RandomEventDialog />
        <EditCharacterDialog />
        <EditWorldDialog />
        <ThemeDialog />
        <NewWorldDialog />
        <GenerateImageDialog />
        <ConfirmDeleteDialog />
        <GlobalBusyIndicator />
      </ErrorBoundaryWithContext>
    </AppProvider>
  );
}

export default App;