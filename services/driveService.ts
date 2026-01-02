
import { AppData } from '../types';
import { DEFAULT_GOOGLE_CONFIG } from '../constants';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

class DriveServiceClass {
  tokenClient: any = null;
  fileId: string | null = null;

  private waitForGoogleScripts(): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (window.gapi && window.google) resolve();
        else setTimeout(check, 100);
      };
      check();
    });
  }

  async loadGapi(): Promise<void> {
    await this.waitForGoogleScripts();
    return new Promise((resolve) => {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          });
          window.gapi.client.setApiKey(DEFAULT_GOOGLE_CONFIG.apiKey);
          resolve();
        } catch (e) {
          console.error("GAPI Init Error", e);
          resolve();
        }
      });
    });
  }

  async loadGis(onTokenReceived: (token: any) => void): Promise<void> {
    await this.waitForGoogleScripts();
    try {
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: DEFAULT_GOOGLE_CONFIG.clientId,
        scope: DEFAULT_GOOGLE_CONFIG.scopes,
        callback: (resp: any) => {
          if (resp.error) throw resp;
          onTokenReceived(resp);
        },
        ux_mode: 'popup',
      });
    } catch (e) {
      console.error("GIS Init Error", e);
    }
  }

  requestLogin() {
    if (this.tokenClient) {
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    }
  }

  async findFile(): Promise<string | null> {
    try {
      const response = await window.gapi.client.drive.files.list({
        q: "name = 'bluey_finance_data.json' and trashed = false",
        fields: 'files(id, name)',
        spaces: 'drive',
      });
      const files = response.result.files;
      if (files && files.length > 0) {
        this.fileId = files[0].id;
        return files[0].id;
      }
      return null;
    } catch (err) {
      console.error('Find File Error', err);
      return null;
    }
  }

  async loadFileContent(fileId: string): Promise<AppData | null> {
    try {
      const response = await window.gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media',
      });
      return response.result;
    } catch (err) {
      console.error('Load Content Error', err);
      return null;
    }
  }

  async createFile(data: AppData) {
    try {
      const contentType = 'application/json';
      const metadata = {
        name: 'bluey_finance_data.json',
        mimeType: contentType,
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([JSON.stringify(data)], { type: contentType }));

      const tokenObj = window.gapi.client.getToken();
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({ 'Authorization': 'Bearer ' + tokenObj.access_token }),
        body: form,
      });
      
      const file = await response.json();
      this.fileId = file.id;
      return file.id;
    } catch (err) {
      console.error('Create File Error', err);
    }
  }

  async updateFile(data: AppData) {
    if (!this.fileId) return;
    try {
      const tokenObj = window.gapi.client.getToken();
      await fetch(`https://www.googleapis.com/upload/drive/v3/files/${this.fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: new Headers({ 
          'Authorization': 'Bearer ' + tokenObj.access_token,
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.error('Update File Error', err);
      throw err;
    }
  }
}

export const DriveService = new DriveServiceClass();
