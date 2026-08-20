import { GoogleAuthProvider, signInWithPopup, getAuth, onAuthStateChanged, User } from 'firebase/auth';

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/meetings.space.created',
  'https://www.googleapis.com/auth/meetings.space.readonly',
  'https://www.googleapis.com/auth/meetings.space.settings',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/documents.readonly',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/tasks.readonly',
];

// In-memory token cache (MUST NOT store in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const getWorkspaceAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setWorkspaceAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

/**
 * Initialize Google Auth for Workspace with in-memory caching
 */
export const initWorkspaceAuth = (
  onSuccess?: (user: User, token: string) => void,
  onFailure?: () => void
) => {
  try {
    const auth = getAuth();
    return onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        if (cachedAccessToken) {
          if (onSuccess) onSuccess(user, cachedAccessToken);
        } else if (!isSigningIn) {
          cachedAccessToken = null;
          if (onFailure) onFailure();
        }
      } else {
        cachedAccessToken = null;
        if (onFailure) onFailure();
      }
    });
  } catch (err) {
    console.warn('[GoogleWorkspace] Auth init error:', err);
    if (onFailure) onFailure();
    return () => {};
  }
};

/**
 * Sign in with Google and request Google Workspace scopes (Sheets, Docs, Tasks, Drive, Meet)
 */
export const signInWithGoogleWorkspace = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    
    WORKSPACE_SCOPES.forEach(scope => {
      provider.addScope(scope);
    });

    provider.setCustomParameters({
      prompt: 'consent select_account',
      access_type: 'offline'
    });

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Não foi possível obter o token de acesso do Google Workspace.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('[GoogleWorkspace] Erro ao autenticar:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const signOutGoogleWorkspace = async () => {
  try {
    const auth = getAuth();
    await auth.signOut();
  } catch (e) {
    console.warn('[GoogleWorkspace] Signout warning:', e);
  }
  cachedAccessToken = null;
};

/* ==========================================================================
   GOOGLE DRIVE HELPERS (Listing, Metadata, File Management)
   ========================================================================== */

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  modifiedTime?: string;
  createdTime?: string;
  size?: string;
  owners?: Array<{ displayName: string; emailAddress: string; photoLink?: string }>;
}

export const listDriveFiles = async (
  accessToken: string,
  options?: {
    mimeType?: string;
    query?: string;
    pageSize?: number;
  }
): Promise<GoogleDriveFile[]> => {
  const queryParts: string[] = ['trashed = false'];
  
  if (options?.mimeType) {
    queryParts.push(`mimeType = '${options.mimeType}'`);
  }
  if (options?.query) {
    queryParts.push(`name contains '${options.query.replace(/'/g, "\\'")}'`);
  }

  const q = encodeURIComponent(queryParts.join(' and '));
  const fields = encodeURIComponent('files(id, name, mimeType, webViewLink, iconLink, modifiedTime, createdTime, size, owners)');
  const pageSize = options?.pageSize || 30;

  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=${pageSize}&orderBy=modifiedTime desc`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao listar arquivos no Google Drive.`);
  }

  const data = await res.json();
  return data.files || [];
};

export const deleteDriveFile = async (accessToken: string, fileId: string): Promise<boolean> => {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao excluir arquivo do Google Drive.`);
  }

  return true;
};

/* ==========================================================================
   GOOGLE SHEETS API v4 HELPERS
   ========================================================================== */

export interface GoogleSpreadsheetMetadata {
  spreadsheetId: string;
  properties: {
    title: string;
    locale?: string;
    timeZone?: string;
  };
  sheets?: Array<{
    properties: {
      sheetId: number;
      title: string;
      index: number;
      gridProperties?: {
        rowCount: number;
        columnCount: number;
      };
    };
  }>;
  spreadsheetUrl?: string;
}

export const listGoogleSheets = async (accessToken: string, query?: string): Promise<GoogleDriveFile[]> => {
  return listDriveFiles(accessToken, {
    mimeType: 'application/vnd.google-apps.spreadsheet',
    query,
    pageSize: 30
  });
};

export const createGoogleSpreadsheet = async (
  accessToken: string,
  title: string,
  headers?: string[],
  rows?: (string | number)[][]
): Promise<GoogleSpreadsheetMetadata> => {
  const payload: any = {
    properties: {
      title: title || 'Nova Planilha GIPP'
    }
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao criar planilha no Google Sheets.`);
  }

  const createdSheet: GoogleSpreadsheetMetadata = await res.json();

  // If initial headers or rows were provided, populate them
  if (headers && headers.length > 0) {
    const firstSheetTitle = createdSheet.sheets?.[0]?.properties?.title || 'Página1';
    const allValues = [headers, ...(rows || [])];
    await updateGoogleSpreadsheetValues(accessToken, createdSheet.spreadsheetId, `${firstSheetTitle}!A1`, allValues);
  }

  return createdSheet;
};

export const getGoogleSpreadsheet = async (
  accessToken: string,
  spreadsheetId: string
): Promise<GoogleSpreadsheetMetadata> => {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao obter dados da planilha.`);
  }

  return await res.json();
};

export const getGoogleSpreadsheetValues = async (
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<(string | number)[][]> => {
  const encodedRange = encodeURIComponent(range);
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao ler células da planilha.`);
  }

  const data = await res.json();
  return data.values || [];
};

export const updateGoogleSpreadsheetValues = async (
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: (string | number)[][]
): Promise<any> => {
  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}?valueInputOption=USER_ENTERED`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao salvar alterações na planilha.`);
  }

  return await res.json();
};

export const appendGoogleSpreadsheetValues = async (
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: (string | number)[][]
): Promise<any> => {
  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao adicionar linhas na planilha.`);
  }

  return await res.json();
};

/* ==========================================================================
   GOOGLE DOCS API v1 HELPERS
   ========================================================================== */

export interface GoogleDocument {
  documentId: string;
  title: string;
  body?: {
    content?: Array<{
      paragraph?: {
        elements?: Array<{
          textRun?: {
            content?: string;
          };
        }>;
      };
    }>;
  };
  revisionId?: string;
}

export const listGoogleDocs = async (accessToken: string, query?: string): Promise<GoogleDriveFile[]> => {
  return listDriveFiles(accessToken, {
    mimeType: 'application/vnd.google-apps.document',
    query,
    pageSize: 30
  });
};

export const createGoogleDocument = async (
  accessToken: string,
  title: string,
  initialText?: string
): Promise<GoogleDocument> => {
  const res = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: title || 'Novo Documento GIPP'
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao criar documento no Google Docs.`);
  }

  const doc: GoogleDocument = await res.json();

  if (initialText && initialText.trim().length > 0) {
    await appendGoogleDocumentText(accessToken, doc.documentId, initialText);
  }

  return doc;
};

export const getGoogleDocument = async (
  accessToken: string,
  documentId: string
): Promise<GoogleDocument> => {
  const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao carregar conteúdo do Google Docs.`);
  }

  return await res.json();
};

export const appendGoogleDocumentText = async (
  accessToken: string,
  documentId: string,
  text: string
): Promise<any> => {
  const requests = [
    {
      insertText: {
        endOfSegmentLocation: {},
        text: text.endsWith('\n') ? text : text + '\n'
      }
    }
  ];

  const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ requests })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao atualizar texto do Google Docs.`);
  }

  return await res.json();
};

/* ==========================================================================
   GOOGLE TASKS API v1 HELPERS
   ========================================================================== */

export interface GoogleTaskList {
  id: string;
  title: string;
  updated?: string;
  selfLink?: string;
}

export interface GoogleTask {
  id?: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string; // RFC 3339 timestamp (e.g. 2026-08-20T00:00:00.000Z)
  completed?: string;
  deleted?: boolean;
  hidden?: boolean;
  position?: string;
  updated?: string;
  parent?: string;
}

export const listGoogleTaskLists = async (accessToken: string): Promise<GoogleTaskList[]> => {
  const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao listar listas de tarefas.`);
  }

  const data = await res.json();
  return data.items || [];
};

export const createGoogleTaskList = async (accessToken: string, title: string): Promise<GoogleTaskList> => {
  const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao criar lista de tarefas.`);
  }

  return await res.json();
};

export const deleteGoogleTaskList = async (accessToken: string, taskListId: string): Promise<boolean> => {
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/users/@me/lists/${taskListId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao excluir lista de tarefas.`);
  }

  return true;
};

export const listGoogleTasks = async (
  accessToken: string,
  taskListId: string,
  showCompleted: boolean = true
): Promise<GoogleTask[]> => {
  const url = `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks?showCompleted=${showCompleted}&showHidden=true`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao carregar tarefas da lista.`);
  }

  const data = await res.json();
  return data.items || [];
};

export const createGoogleTask = async (
  accessToken: string,
  taskListId: string,
  task: Partial<GoogleTask>
): Promise<GoogleTask> => {
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(task)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao criar tarefa no Google Tasks.`);
  }

  return await res.json();
};

export const updateGoogleTask = async (
  accessToken: string,
  taskListId: string,
  taskId: string,
  task: Partial<GoogleTask>
): Promise<GoogleTask> => {
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(task)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao atualizar tarefa.`);
  }

  return await res.json();
};

export const deleteGoogleTask = async (
  accessToken: string,
  taskListId: string,
  taskId: string
): Promise<boolean> => {
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao excluir tarefa.`);
  }

  return true;
};

export const clearCompletedGoogleTasks = async (
  accessToken: string,
  taskListId: string
): Promise<boolean> => {
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/clear`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao limpar tarefas concluídas.`);
  }

  return true;
};
