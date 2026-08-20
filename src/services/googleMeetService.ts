import { GoogleAuthProvider, signInWithPopup, getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { 
  getWorkspaceAccessToken, 
  setWorkspaceAccessToken, 
  signInWithGoogleWorkspace, 
  WORKSPACE_SCOPES 
} from './googleWorkspaceService';

export const MEET_SCOPES = WORKSPACE_SCOPES;

export const getMeetAccessToken = (): string | null => {
  return getWorkspaceAccessToken();
};

export const setMeetAccessToken = (token: string | null) => {
  setWorkspaceAccessToken(token);
};

/**
 * Initialize Google Auth for Meet with in-memory caching
 */
export const initMeetAuth = (
  onSuccess?: (user: User, token: string) => void,
  onFailure?: () => void
) => {
  try {
    const auth = getAuth();
    return onAuthStateChanged(auth, async (user: User | null) => {
      const token = getWorkspaceAccessToken();
      if (user) {
        if (token) {
          if (onSuccess) onSuccess(user, token);
        } else {
          if (onFailure) onFailure();
        }
      } else {
        setWorkspaceAccessToken(null);
        if (onFailure) onFailure();
      }
    });
  } catch (err) {
    console.warn('[GoogleMeet] Auth init error:', err);
    if (onFailure) onFailure();
    return () => {};
  }
};

/**
 * Sign in with Google and request Google Meet / Workspace scopes
 */
export const signInWithGoogleMeet = async (): Promise<{ user: User; accessToken: string }> => {
  return await signInWithGoogleWorkspace();
};

/**
 * Sign out / clear token
 */
export const signOutGoogleMeet = async () => {
  setWorkspaceAccessToken(null);
};

export interface MeetSpaceConfig {
  accessType?: 'OPEN' | 'TRUSTED' | 'RESTRICTED' | 'ACCESS_TYPE_UNSPECIFIED';
  entryPointAccess?: 'ALL' | 'ENTRY_POINT_ACCESS_UNSPECIFIED';
}

export interface GoogleMeetSpace {
  name: string; // e.g. "spaces/xyz-abc-123"
  meetingUri: string; // e.g. "https://meet.google.com/xyz-abc-123"
  meetingCode: string; // e.g. "xyz-abc-123"
  config?: MeetSpaceConfig;
  activeConference?: {
    conferenceRecord?: string;
  };
}

/**
 * Create a new Google Meet space using Google Meet REST API v2
 */
export const createGoogleMeetSpace = async (
  accessToken: string,
  config?: MeetSpaceConfig
): Promise<GoogleMeetSpace> => {
  const bodyPayload: any = {};
  if (config?.accessType) {
    bodyPayload.config = {
      accessType: config.accessType,
      entryPointAccess: config.entryPointAccess || 'ALL'
    };
  }

  const response = await fetch('https://meet.googleapis.com/v2/spaces', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyPayload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData?.error?.message || `Erro ${response.status}: Falha ao criar sala no Google Meet.`;
    throw new Error(message);
  }

  const data: GoogleMeetSpace = await response.json();
  return data;
};

/**
 * Get details of an existing Google Meet space
 */
export const getGoogleMeetSpace = async (
  accessToken: string,
  spaceNameOrId: string
): Promise<GoogleMeetSpace> => {
  const spaceId = spaceNameOrId.startsWith('spaces/') ? spaceNameOrId : `spaces/${spaceNameOrId}`;
  
  const response = await fetch(`https://meet.googleapis.com/v2/${spaceId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData?.error?.message || `Erro ${response.status}: Sala não encontrada no Google Meet.`;
    throw new Error(message);
  }

  return await response.json();
};

/**
 * Update settings of an existing Google Meet space
 */
export const updateGoogleMeetSpaceConfig = async (
  accessToken: string,
  spaceNameOrId: string,
  config: MeetSpaceConfig
): Promise<GoogleMeetSpace> => {
  const spaceId = spaceNameOrId.startsWith('spaces/') ? spaceNameOrId : `spaces/${spaceNameOrId}`;
  
  const response = await fetch(`https://meet.googleapis.com/v2/${spaceId}?updateMask=config.accessType,config.entryPointAccess`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      config
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData?.error?.message || `Erro ${response.status}: Falha ao atualizar configurações da sala.`;
    throw new Error(message);
  }

  return await response.json();
};
