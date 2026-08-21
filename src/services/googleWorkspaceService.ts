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
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.responses.readonly',
  'https://www.googleapis.com/auth/classroom.courses',
  'https://www.googleapis.com/auth/classroom.coursework.students',
  'https://www.googleapis.com/auth/classroom.courseworkmaterials',
  'https://www.googleapis.com/auth/classroom.rosters',
  'https://www.googleapis.com/auth/classroom.announcements',
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
    if (error?.code === 'auth/unauthorized-domain' || error?.message?.includes('auth/unauthorized-domain')) {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'seu domínio';
      throw new Error(`Domínio não autorizado no Firebase (${currentHost}). Adicione "${currentHost}" e seu domínio da Vercel em Firebase Console > Authentication > Configurações > Domínios Autorizados.`);
    }
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

/* ==========================================================================
   GOOGLE CALENDAR HELPERS
   ========================================================================== */

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  htmlLink?: string;
  hangoutLink?: string;
  conferenceData?: any;
  attendees?: Array<{ email: string; displayName?: string; responseStatus?: string }>;
  colorId?: string;
  status?: string;
}

export const listGoogleCalendarEvents = async (
  accessToken: string,
  calendarId: string = 'primary',
  timeMin?: string,
  timeMax?: string,
  maxResults: number = 50
): Promise<GoogleCalendarEvent[]> => {
  const min = timeMin || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  let url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(min)}&maxResults=${maxResults}`;
  if (timeMax) {
    url += `&timeMax=${encodeURIComponent(timeMax)}`;
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao buscar eventos do Google Calendar.`);
  }

  const data = await res.json();
  return data.items || [];
};

export const createGoogleCalendarEvent = async (
  accessToken: string,
  event: GoogleCalendarEvent,
  calendarId: string = 'primary',
  createConference: boolean = false
): Promise<GoogleCalendarEvent> => {
  let url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
  if (createConference) {
    url += `?conferenceDataVersion=1`;
    event.conferenceData = {
      createRequest: {
        requestId: `gipp-meet-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' }
      }
    };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao criar evento no Google Calendar.`);
  }

  return await res.json();
};

export const deleteGoogleCalendarEvent = async (
  accessToken: string,
  eventId: string,
  calendarId: string = 'primary'
): Promise<boolean> => {
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao excluir evento do calendário.`);
  }

  return true;
};

/* ==========================================================================
   GMAIL HELPERS
   ========================================================================== */

export interface GmailMessageHeader {
  name: string;
  value: string;
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
  bodyText?: string;
  isUnread?: boolean;
}

export const listGmailMessages = async (
  accessToken: string,
  query: string = '',
  maxResults: number = 25
): Promise<GmailMessageSummary[]> => {
  let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`;
  if (query) {
    url += `&q=${encodeURIComponent(query)}`;
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao carregar mensagens do Gmail.`);
  }

  const listData = await res.json();
  const messages: Array<{ id: string; threadId: string }> = listData.messages || [];

  if (messages.length === 0) return [];

  // Fetch headers for top messages
  const messagePromises = messages.slice(0, maxResults).map(async (msg) => {
    try {
      const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!msgRes.ok) return null;
      const data = await msgRes.json();
      const headers: GmailMessageHeader[] = data.payload?.headers || [];
      const getHeader = (name: string) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      return {
        id: data.id,
        threadId: data.threadId,
        snippet: data.snippet || '',
        subject: getHeader('Subject') || '(Sem assunto)',
        from: getHeader('From') || '(Remetente desconhecido)',
        to: getHeader('To') || '',
        date: getHeader('Date') || '',
        isUnread: data.labelIds?.includes('UNREAD') ?? false,
      } as GmailMessageSummary;
    } catch {
      return null;
    }
  });

  const detailed = await Promise.all(messagePromises);
  return detailed.filter((m): m is GmailMessageSummary => m !== null);
};

export const getGmailMessageDetails = async (
  accessToken: string,
  messageId: string
): Promise<GmailMessageSummary & { bodyHtml?: string }> => {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao ler mensagem do Gmail.`);
  }

  const data = await res.json();
  const headers: GmailMessageHeader[] = data.payload?.headers || [];
  const getHeader = (name: string) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  // Extract body
  let bodyText = '';
  let bodyHtml = '';

  const extractBody = (part: any) => {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      bodyText = decodeBase64Url(part.body.data);
    } else if (part.mimeType === 'text/html' && part.body?.data) {
      bodyHtml = decodeBase64Url(part.body.data);
    }
    if (part.parts) {
      part.parts.forEach(extractBody);
    }
  };

  if (data.payload) {
    extractBody(data.payload);
  }

  return {
    id: data.id,
    threadId: data.threadId,
    snippet: data.snippet || '',
    subject: getHeader('Subject') || '(Sem assunto)',
    from: getHeader('From') || '(Remetente desconhecido)',
    to: getHeader('To') || '',
    date: getHeader('Date') || '',
    bodyText: bodyText || data.snippet,
    bodyHtml: bodyHtml || `<p>${bodyText || data.snippet}</p>`,
    isUnread: data.labelIds?.includes('UNREAD') ?? false
  };
};

const decodeBase64Url = (base64Url: string): string => {
  try {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return '';
  }
};

const encodeBase64Url = (str: string): string => {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const sendGmailMessage = async (
  accessToken: string,
  params: {
    to: string;
    subject: string;
    bodyText?: string;
    bodyHtml?: string;
    cc?: string;
    bcc?: string;
  }
): Promise<{ id: string; threadId: string }> => {
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(params.subject)))}?=`;
  const boundary = `====boundary_${Date.now()}====`;

  let rawMessage = [
    `To: ${params.to}`,
    params.cc ? `Cc: ${params.cc}` : '',
    params.bcc ? `Bcc: ${params.bcc}` : '',
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    params.bodyText || params.bodyHtml?.replace(/<[^>]+>/g, '') || '',
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    params.bodyHtml || `<p>${params.bodyText || ''}</p>`,
    '',
    `--${boundary}--`
  ].filter(Boolean).join('\r\n');

  const raw = encodeBase64Url(rawMessage);

  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao enviar e-mail pelo Gmail.`);
  }

  return await res.json();
};

/* ==========================================================================
   GOOGLE FORMS HELPERS
   ========================================================================== */

export interface GoogleFormInfo {
  formId: string;
  info: {
    title: string;
    documentTitle?: string;
    description?: string;
  };
  responderUri?: string;
  items?: Array<{
    itemId: string;
    title: string;
    description?: string;
    questionItem?: any;
  }>;
}

export const createGoogleForm = async (
  accessToken: string,
  title: string,
  description?: string,
  items?: any[]
): Promise<GoogleFormInfo> => {
  // Step 1: Create the form shell
  const res = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      info: {
        title,
        documentTitle: title
      }
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao criar formulário no Google Forms.`);
  }

  const createdForm: GoogleFormInfo = await res.json();

  // Step 2: If we have description or items, batch update
  const requests: any[] = [];

  if (description) {
    requests.push({
      updateFormInfo: {
        info: { description },
        updateMask: 'description'
      }
    });
  }

  if (items && items.length > 0) {
    items.forEach((item, index) => {
      requests.push({
        createItem: {
          item,
          location: { index }
        }
      });
    });
  }

  if (requests.length > 0) {
    const batchRes = await fetch(`https://forms.googleapis.com/v1/forms/${createdForm.formId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });

    if (batchRes.ok) {
      const updated = await getGoogleForm(accessToken, createdForm.formId);
      return updated;
    }
  }

  return createdForm;
};

export const getGoogleForm = async (
  accessToken: string,
  formId: string
): Promise<GoogleFormInfo> => {
  const res = await fetch(`https://forms.googleapis.com/v1/forms/${formId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao buscar formulário.`);
  }

  return await res.json();
};

export const getGoogleFormResponses = async (
  accessToken: string,
  formId: string
): Promise<any[]> => {
  const res = await fetch(`https://forms.googleapis.com/v1/forms/${formId}/responses`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao buscar respostas do formulário.`);
  }

  const data = await res.json();
  return data.responses || [];
};

/* ==========================================================================
   GOOGLE CLASSROOM HELPERS
   ========================================================================== */

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  description?: string;
  room?: string;
  ownerId?: string;
  creationTime?: string;
  updateTime?: string;
  enrollmentCode?: string;
  courseState?: 'ACTIVE' | 'ARCHIVED' | 'PROVISIONED' | 'DECLINED' | 'SUSPENDED';
  alternateLink?: string;
  teacherGroupEmail?: string;
  courseGroupEmail?: string;
}

export interface ClassroomAnnouncement {
  id?: string;
  courseId: string;
  text: string;
  state?: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
  materials?: any[];
}

export interface ClassroomCourseWork {
  id?: string;
  courseId: string;
  title: string;
  description?: string;
  materials?: any[];
  state?: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  alternateLink?: string;
  creationTime?: string;
  dueDate?: { year: number; month: number; day: number };
  dueTime?: { hours: number; minutes: number };
  maxPoints?: number;
  workType?: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION';
}

export const listClassroomCourses = async (
  accessToken: string,
  courseStates: string[] = ['ACTIVE', 'PROVISIONED']
): Promise<ClassroomCourse[]> => {
  try {
    const statesQuery = courseStates.map(s => `courseStates=${s}`).join('&');
    const url = `https://classroom.googleapis.com/v1/courses?${statesQuery}&pageSize=50`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      // Fallback query without filtering parameters
      const fallbackRes = await fetch('https://classroom.googleapis.com/v1/courses?pageSize=50', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (fallbackRes.ok) {
        const fbData = await fallbackRes.json();
        return fbData.courses || [];
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao listar turmas do Google Classroom.`);
    }

    const data = await res.json();
    return data.courses || [];
  } catch (e: any) {
    console.error('Erro ao listar turmas do Classroom:', e);
    throw e;
  }
};

export const createClassroomCourse = async (
  accessToken: string,
  course: {
    name: string;
    section?: string;
    descriptionHeading?: string;
    description?: string;
    room?: string;
  }
): Promise<ClassroomCourse> => {
  // Strategy 1: Create in PROVISIONED state (Standard behavior for user-level / @gmail.com accounts in Google Classroom API)
  let res = await fetch('https://classroom.googleapis.com/v1/courses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...course,
      ownerId: 'me',
      courseState: 'PROVISIONED'
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    
    // Strategy 2: If PROVISIONED fails or returns specific error, try without explicit courseState
    const retryRes = await fetch('https://classroom.googleapis.com/v1/courses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...course,
        ownerId: 'me'
      })
    });

    if (retryRes.ok) {
      return await retryRes.json();
    }

    const retryErr = await retryRes.json().catch(() => ({}));
    const rawMsg = retryErr?.error?.message || err?.error?.message || `Erro ${res.status}: Falha ao criar turma no Google Classroom.`;

    if (rawMsg.includes('CourseStateDenied') || rawMsg.includes('cannot create or transition')) {
      throw new Error(
        'Sua conta do Google não possui privilégios de Professor/Administrador do Google Workspace for Education para provisionar salas ativas diretamente via API. Para criar turmas, acesse classroom.google.com ou utilize uma conta com perfil de instrutor.'
      );
    }

    throw new Error(rawMsg);
  }

  return await res.json();
};

export const listClassroomAnnouncements = async (
  accessToken: string,
  courseId: string
): Promise<ClassroomAnnouncement[]> => {
  const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/announcements`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao buscar avisos da turma.`);
  }

  const data = await res.json();
  return data.announcements || [];
};

export const createClassroomAnnouncement = async (
  accessToken: string,
  courseId: string,
  text: string
): Promise<ClassroomAnnouncement> => {
  const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/announcements`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      state: 'PUBLISHED'
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao publicar aviso.`);
  }

  return await res.json();
};

export const listClassroomCourseWork = async (
  accessToken: string,
  courseId: string
): Promise<ClassroomCourseWork[]> => {
  const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao buscar atividades da turma.`);
  }

  const data = await res.json();
  return data.courseWork || [];
};

export const createClassroomCourseWork = async (
  accessToken: string,
  courseId: string,
  work: {
    title: string;
    description?: string;
    maxPoints?: number;
    workType?: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION';
  }
): Promise<ClassroomCourseWork> => {
  const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...work,
      state: 'PUBLISHED',
      workType: work.workType || 'ASSIGNMENT'
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao criar atividade.`);
  }

  return await res.json();
};

export const listClassroomStudents = async (
  accessToken: string,
  courseId: string
): Promise<any[]> => {
  const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/students`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return [];
  }

  const data = await res.json();
  return data.students || [];
};

export interface ClassroomStudentSubmission {
  id: string;
  courseId: string;
  courseWorkId: string;
  userId: string;
  state: 'NEW' | 'CREATED' | 'TURNED_IN' | 'RETURNED' | 'RECLAIMED_BY_STUDENT';
  assignedGrade?: number;
  draftGrade?: number;
  alternateLink?: string;
  updateTime?: string;
  studentName?: string;
  studentEmail?: string;
  submissionHistory?: any[];
}

export const listClassroomStudentSubmissions = async (
  accessToken: string,
  courseId: string,
  courseWorkId: string
): Promise<ClassroomStudentSubmission[]> => {
  const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return [];
  }

  const data = await res.json();
  return data.studentSubmissions || [];
};

export const patchClassroomStudentSubmission = async (
  accessToken: string,
  courseId: string,
  courseWorkId: string,
  submissionId: string,
  grade: number
): Promise<any> => {
  const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions/${submissionId}?updateMask=assignedGrade,draftGrade`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      assignedGrade: grade,
      draftGrade: grade
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erro ${res.status}: Falha ao atualizar nota no Google Classroom.`);
  }

  return await res.json();
};

/* ==========================================================================
   GOOGLE FORMS RESPONSES IMPORT SERVICE (Visitantes & Membros)
   ========================================================================== */

export interface ParsedFormImportItem {
  id: string;
  sourceResponseId: string;
  responseId: string;
  timestamp: string;
  submittedAt: string;
  nome: string;
  telefone: string;
  email: string;
  dataNascimento?: string;
  estadoCivil?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  classeDesejada?: string;
  comoConheceu?: string;
  pedidoOracao?: string;
  jaBatizado?: string;
  rawAnswers: Record<string, string>;
  isDuplicate?: boolean;
  duplicateReason?: string;
  status: 'pending' | 'imported' | 'skipped';
}

export type ParsedFormResponse = ParsedFormImportItem;

export const parseGoogleFormResponses = (
  formInfo: GoogleFormInfo,
  responses: any[],
  existingMembers: any[] = [],
  existingVisitors: any[] = []
): ParsedFormImportItem[] => {
  // Build a lookup map of item question IDs to question titles
  const questionMap: Record<string, string> = {};
  if (formInfo.items) {
    formInfo.items.forEach(item => {
      const qId = item.questionItem?.question?.questionId || item.itemId;
      if (qId && item.title) {
        questionMap[qId] = item.title.trim();
      }
    });
  }

  const parsedItems: ParsedFormImportItem[] = [];

  responses.forEach((resp: any, idx: number) => {
    const rawAnswers: Record<string, string> = {};
    let nome = '';
    let telefone = '';
    let email = '';
    let dataNascimento = '';
    let estadoCivil = '';
    let endereco = '';
    let bairro = '';
    let cidade = '';
    let classeDesejada = '';
    let comoConheceu = '';
    let pedidoOracao = '';
    let jaBatizado = '';

    if (resp.answers) {
      Object.entries(resp.answers).forEach(([qId, ansObj]: [string, any]) => {
        const title = questionMap[qId] || `Pergunta_${qId}`;
        const val = ansObj?.textAnswers?.answers?.map((a: any) => a.value).join(', ') || '';
        rawAnswers[title] = val;

        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('nome') && !lowerTitle.includes('dirigente') && !lowerTitle.includes('indic') && !lowerTitle.includes('igreja')) {
          if (!nome) nome = val;
        } else if (lowerTitle.includes('telefone') || lowerTitle.includes('whatsapp') || lowerTitle.includes('celular') || lowerTitle.includes('fone')) {
          if (!telefone) telefone = val;
        } else if (lowerTitle.includes('email') || lowerTitle.includes('e-mail')) {
          if (!email) email = val;
        } else if (lowerTitle.includes('nascimento') || lowerTitle.includes('data de nasc') || lowerTitle.includes('idade')) {
          if (!dataNascimento) dataNascimento = val;
        } else if (lowerTitle.includes('civil') || lowerTitle.includes('casado') || lowerTitle.includes('solteiro')) {
          if (!estadoCivil) estadoCivil = val;
        } else if (lowerTitle.includes('endereço') || lowerTitle.includes('rua') || lowerTitle.includes('logradouro')) {
          if (!endereco) endereco = val;
        } else if (lowerTitle.includes('bairro')) {
          if (!bairro) bairro = val;
        } else if (lowerTitle.includes('cidade') || lowerTitle.includes('município')) {
          if (!cidade) cidade = val;
        } else if (lowerTitle.includes('classe') || lowerTitle.includes('turma') || lowerTitle.includes('ebd')) {
          if (!classeDesejada) classeDesejada = val;
        } else if (lowerTitle.includes('conheceu') || lowerTitle.includes('convidou') || lowerTitle.includes('indica')) {
          if (!comoConheceu) comoConheceu = val;
        } else if (lowerTitle.includes('oração') || lowerTitle.includes('aconselhamento') || lowerTitle.includes('motivo')) {
          if (!pedidoOracao) pedidoOracao = val;
        } else if (lowerTitle.includes('batismo') || lowerTitle.includes('batizado') || lowerTitle.includes('águas')) {
          if (!jaBatizado) jaBatizado = val;
        }
      });
    }

    if (!nome) {
      nome = `Participante #${idx + 1}`;
    }

    // Check for duplicate in existing members / visitors
    let isDuplicate = false;
    let duplicateReason = '';

    const cleanTel = telefone.replace(/\D/g, '');
    const cleanNome = nome.toLowerCase().trim();

    if (existingMembers.length > 0) {
      const matchMember = existingMembers.find((m: any) => {
        const mTel = (m.telefone || m.whatsapp || '').replace(/\D/g, '');
        const mNome = (m.nome || '').toLowerCase().trim();
        const mEmail = (m.email || '').toLowerCase().trim();
        return (
          (cleanTel && mTel && cleanTel.length >= 8 && mTel.includes(cleanTel)) ||
          (email && mEmail && email.toLowerCase() === mEmail) ||
          (cleanNome && mNome && cleanNome === mNome)
        );
      });
      if (matchMember) {
        isDuplicate = true;
        duplicateReason = `Já cadastrado no Rol de Membros (${matchMember.nome})`;
      }
    }

    if (!isDuplicate && existingVisitors.length > 0) {
      const matchVisitor = existingVisitors.find((v: any) => {
        const vTel = (v.telefone || v.whatsapp || '').replace(/\D/g, '');
        const vNome = (v.nome || '').toLowerCase().trim();
        return (
          (cleanTel && vTel && cleanTel.length >= 8 && vTel.includes(cleanTel)) ||
          (cleanNome && vNome && cleanNome === vNome)
        );
      });
      if (matchVisitor) {
        isDuplicate = true;
        duplicateReason = `Já cadastrado como Visitante (${matchVisitor.nome})`;
      }
    }

    parsedItems.push({
      id: resp.responseId || `resp-${idx}-${Date.now()}`,
      sourceResponseId: resp.responseId || `r-${idx}`,
      responseId: resp.responseId || `r-${idx}`,
      timestamp: resp.createTime || new Date().toISOString(),
      submittedAt: resp.createTime || new Date().toISOString(),
      nome,
      telefone,
      email,
      dataNascimento,
      estadoCivil,
      endereco,
      bairro,
      cidade,
      classeDesejada,
      comoConheceu,
      pedidoOracao,
      jaBatizado,
      rawAnswers,
      isDuplicate,
      duplicateReason,
      status: 'pending'
    });
  });

  return parsedItems;
};

/* ==========================================================================
   EMAIL ESCALAS & NOTIFICAÇÕES VIA GMAIL SERVICE
   ========================================================================== */

export interface EscalaEmailParams {
  toEmail: string;
  toName: string;
  escalaTipo: 'louvor' | 'portaria' | 'ebd' | 'obreiros' | 'midia' | 'recepcao' | 'culto_geral';
  dataEscala: string;
  horario: string;
  funcao: string;
  igrejaNome?: string;
  pastorNome?: string;
  observacoes?: string;
}

export const sendEscalaConfirmationEmail = async (
  accessToken: string,
  params: EscalaEmailParams
): Promise<any> => {
  const tipoLabelMap: Record<string, string> = {
    louvor: 'Ministério de Louvor & Adoração',
    portaria: 'Escala de Portaria & Acolhimento',
    ebd: 'Escola Bíblica Dominical (EBD)',
    obreiros: 'Escala Ministerial de Obreiros e Diaconato',
    midia: 'Comunicação, Mídia e Transmissão',
    recepcao: 'Recepção e Consolidação de Visitantes',
    culto_geral: 'Escala Oficial de Culto Eclesiástico'
  };

  const tipoLabel = tipoLabelMap[params.escalaTipo] || 'Escala Ministerial';
  const dataFormatada = params.dataEscala.split('-').reverse().join('/');
  const subject = `🕊️ Confirmação de Escala: ${tipoLabel} - ${dataFormatada}`;

  const bodyHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #1e1b4b, #4338ca); color: #ffffff; padding: 30px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #c7d2fe; }
    .content { padding: 28px 24px; }
    .card-info { background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #4f46e5; }
    .card-item { margin-bottom: 10px; font-size: 14px; }
    .card-item:last-child { margin-bottom: 0; }
    .label { font-weight: 700; color: #475569; }
    .value { font-weight: 800; color: #0f172a; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    .badge { display: inline-block; padding: 4px 12px; background: #e0e7ff; color: #3730a3; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">Aviso de Escala Ministerial</span>
      <h1 style="margin-top: 12px;">Paz do Senhor, ${params.toName}!</h1>
      <p>${params.igrejaNome || 'GIPP • Sistema de Gestão Eclesiástica'}</p>
    </div>
    <div class="content">
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Você foi escalado(a) oficialmente para servir no Reino de Deus no seguinte compromisso:
      </p>
      
      <div class="card-info">
        <div class="card-item">
          <span class="label">📅 Data:</span> <span class="value">${dataFormatada}</span>
        </div>
        <div class="card-item">
          <span class="label">⏰ Horário:</span> <span class="value">${params.horario || 'Conforme início do culto'}</span>
        </div>
        <div class="card-item">
          <span class="label">🏛️ Ministério / Setor:</span> <span class="value">${tipoLabel}</span>
        </div>
        <div class="card-item">
          <span class="label">🎯 Sua Função / Atribuição:</span> <span class="value">${params.funcao}</span>
        </div>
        ${params.observacoes ? `
        <div class="card-item" style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #cbd5e1;">
          <span class="label">📝 Observações Pastorais:</span> <span class="value" style="font-weight: 500;">${params.observacoes}</span>
        </div>` : ''}
      </div>

      <p style="font-size: 13px; line-height: 1.5; color: #64748b;">
        <em>"Tudo o que fizerem, façam de todo o coração, como para o Senhor, e não para os homens." (Colossenses 3:23)</em>
      </p>
      <p style="font-size: 13px; color: #334155; margin-top: 20px;">
        Em caso de impossibilidade ou necessidade de troca, favor comunicar a liderança com a máxima antecedência.
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0;"><strong>${params.igrejaNome || 'Igreja Evangélica Assembleia de Deus'}</strong></p>
      <p style="margin: 4px 0 0;">Mensagem gerada e sincronizada via Google Workspace • GIPP</p>
    </div>
  </div>
</body>
</html>
  `;

  return await sendGmailMessage(accessToken, {
    to: params.toEmail,
    subject,
    bodyHtml
  });
};

/* ==========================================================================
   GOOGLE CALENDAR & TASKS BULK SYNC HELPERS
   ========================================================================== */

export const syncGippEventsToGoogleCalendar = async (
  accessToken: string,
  events: Array<{
    title: string;
    description?: string;
    date: string; // YYYY-MM-DD
    timeStart?: string; // HH:mm
    timeEnd?: string; // HH:mm
    location?: string;
  }>,
  calendarId: string = 'primary'
): Promise<{ successCount: number; errors: any[] }> => {
  let successCount = 0;
  const errors: any[] = [];

  for (const ev of events) {
    try {
      const startDateTime = ev.timeStart
        ? `${ev.date}T${ev.timeStart}:00-03:00`
        : undefined;
      const endDateTime = ev.timeEnd
        ? `${ev.date}T${ev.timeEnd}:00-03:00`
        : ev.timeStart
        ? `${ev.date}T${Number(ev.timeStart.split(':')[0]) + 2}:00:00-03:00`
        : undefined;

      const eventPayload: GoogleCalendarEvent = {
        summary: ev.title,
        description: ev.description || 'Evento eclesiástico sincronizado automaticamente pelo GIPP.',
        location: ev.location || '',
        start: startDateTime
          ? { dateTime: startDateTime, timeZone: 'America/Sao_Paulo' }
          : { date: ev.date },
        end: endDateTime
          ? { dateTime: endDateTime, timeZone: 'America/Sao_Paulo' }
          : { date: ev.date }
      };

      await createGoogleCalendarEvent(accessToken, eventPayload, calendarId);
      successCount++;
    } catch (err: any) {
      errors.push({ title: ev.title, error: err.message || err });
    }
  }

  return { successCount, errors };
};

export const syncGippTasksToGoogleTasks = async (
  accessToken: string,
  tasks: Array<{
    title: string;
    description?: string;
    dueDate?: string; // YYYY-MM-DD
    completed?: boolean;
  }>,
  taskListId?: string
): Promise<{ successCount: number; errors: any[] }> => {
  let successCount = 0;
  const errors: any[] = [];

  // If no taskListId provided, fetch the primary list
  let targetListId = taskListId;
  if (!targetListId) {
    const lists = await listGoogleTaskLists(accessToken);
    targetListId = lists[0]?.id;
    if (!targetListId) {
      const newList = await createGoogleTaskList(accessToken, 'GIPP • Tarefas da Igreja');
      targetListId = newList.id;
    }
  }

  for (const t of tasks) {
    try {
      const dueTimestamp = t.dueDate ? `${t.dueDate}T23:59:59.000Z` : undefined;
      await createGoogleTask(accessToken, targetListId, {
        title: t.title,
        notes: t.description || 'Tarefa ministerial sincronizada pelo GIPP',
        status: t.completed ? 'completed' : 'needsAction',
        due: dueTimestamp
      });
      successCount++;
    } catch (err: any) {
      errors.push({ title: t.title, error: err.message || err });
    }
  }

  return { successCount, errors };
};

