// Core
import { JamSessionService } from './JamSessionService';
import { jamSessionService } from './JamSessionService';

// Components
import { ShareSession } from './components/ShareSession';

// Context and Hooks
import { JamSessionProvider } from './JamSessionProvider';
import { useJamSession, useJamSessionConnection } from './useJamSession';

// Types
export * from './types';

// Export everything
export {
  // Core
  JamSessionService,
  jamSessionService,
  
  // Components
  ShareSession,
  
  // Context and Hooks
  JamSessionProvider,
  useJamSession,
  useJamSessionConnection,
};

export default {
  // Core
  JamSessionService,
  jamSessionService,
  
  // Components
  ShareSession,
  
  // Context and Hooks
  JamSessionProvider,
  useJamSession,
  useJamSessionConnection,
};
