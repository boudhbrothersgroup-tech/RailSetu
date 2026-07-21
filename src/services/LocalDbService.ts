import { SavedItem } from '../types';

export interface UserProfile {
  name: string;
  email: string;
  age?: string;
  gender?: string;
  mobile?: string;
  idProofType?: string;
  idProofNum?: string;
  preferredClass?: string;
}

export interface SupportTicket {
  id: string;
  category: 'booking' | 'bug' | 'general' | 'refund';
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
}

export interface FeedbackSubmission {
  id: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  receivedAt: string;
  read: boolean;
}

class LocalDbService {
  private STORAGE_KEY_PREFIX = 'railsetu_';

  // ----------------------------------------------------
  // HELPER METHODS FOR STORAGE
  // ----------------------------------------------------
  private get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(this.STORAGE_KEY_PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.STORAGE_KEY_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('Error writing to localStorage', e);
    }
  }

  // ----------------------------------------------------
  // AUTHENTICATION (Simulating Firebase Auth)
  // ----------------------------------------------------
  public getCurrentUser(): UserProfile | null {
    return this.get<UserProfile | null>('current_user', null);
  }

  public signIn(email: string, password: string): UserProfile {
    const users = this.get<any[]>('users', []);
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser) {
      throw new Error('Authentication failed: No user account found with this email.');
    }
    if (foundUser.password !== password) {
      throw new Error('Authentication failed: Incorrect password. Please try again.');
    }

    const profile: UserProfile = {
      name: foundUser.name,
      email: foundUser.email,
      age: foundUser.age,
      gender: foundUser.gender,
      mobile: foundUser.mobile,
      idProofType: foundUser.idProofType,
      idProofNum: foundUser.idProofNum,
      preferredClass: foundUser.preferredClass || 'CC',
    };

    this.set('current_user', profile);
    return profile;
  }

  public signUp(name: string, email: string, password: string): UserProfile {
    if (!name || !email || !password) {
      throw new Error('Registration failed: All fields are required.');
    }
    if (password.length < 6) {
      throw new Error('Registration failed: Password must be at least 6 characters.');
    }

    const users = this.get<any[]>('users', []);
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Registration failed: An account with this email already exists.');
    }

    const newUser = {
      name,
      email,
      password,
      preferredClass: 'CC',
    };

    users.push(newUser);
    this.set('users', users);

    const profile: UserProfile = {
      name,
      email,
      preferredClass: 'CC',
    };
    this.set('current_user', profile);
    return profile;
  }

  public signOut(): void {
    this.set('current_user', null);
  }

  public resetPassword(email: string): string {
    const users = this.get<any[]>('users', []);
    const found = users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (!found) {
      throw new Error('Password Reset failed: No user account found with this email address.');
    }
    return `Reset link dispatched! A secure simulated password reset connection has been sent to ${email}.`;
  }

  public updateProfile(profile: UserProfile): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('No authenticated user session found.');

    // Save to current user
    const updatedUser = { ...currentUser, ...profile };
    this.set('current_user', updatedUser);

    // Save to registered users list
    const users = this.get<any[]>('users', []);
    const index = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedUser };
      this.set('users', users);
    }
  }

  // ----------------------------------------------------
  // CLOUD FIRESTORE SIMULATOR (Favorites, Support, Feedback)
  // ----------------------------------------------------
  public getFavoriteTrains(): any[] {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return this.get<any[]>('anonymous_favorite_trains', []);
    
    const userFavorites = this.get<Record<string, any[]>>('user_favorite_trains', {});
    return userFavorites[currentUser.email.toLowerCase()] || [];
  }

  public toggleFavoriteTrain(trainNo: string, trainName: string, classType: string): boolean {
    const currentUser = this.getCurrentUser();
    const cleanTrain = trainNo.trim().replace(/\D/g, '');
    
    if (currentUser) {
      const userFavorites = this.get<Record<string, any[]>>('user_favorite_trains', {});
      const email = currentUser.email.toLowerCase();
      let list = userFavorites[email] || [];
      
      const exists = list.some(t => t.number === cleanTrain);
      if (exists) {
        list = list.filter(t => t.number !== cleanTrain);
        userFavorites[email] = list;
        this.set('user_favorite_trains', userFavorites);
        this.triggerPushNotification('Favorites Sync', `Removed Train ${cleanTrain} from your saved profile lists.`);
        return false;
      } else {
        list.push({ number: cleanTrain, name: trainName, class: classType, savedAt: new Date().toISOString() });
        userFavorites[email] = list;
        this.set('user_favorite_trains', userFavorites);
        this.triggerPushNotification('Favorites Sync', `Successfully pinned Train ${cleanTrain} to your profile favorites.`);
        return true;
      }
    } else {
      let list = this.get<any[]>('anonymous_favorite_trains', []);
      const exists = list.some(t => t.number === cleanTrain);
      if (exists) {
        list = list.filter(t => t.number !== cleanTrain);
        this.set('anonymous_favorite_trains', list);
        return false;
      } else {
        list.push({ number: cleanTrain, name: trainName, class: classType, savedAt: new Date().toISOString() });
        this.set('anonymous_favorite_trains', list);
        return true;
      }
    }
  }

  public isFavoriteTrain(trainNo: string): boolean {
    const cleanTrain = trainNo.trim().replace(/\D/g, '');
    const list = this.getFavoriteTrains();
    return list.some(t => t.number === cleanTrain);
  }

  public getFavoriteRoutes(): any[] {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return this.get<any[]>('anonymous_favorite_routes', []);
    
    const userFavorites = this.get<Record<string, any[]>>('user_favorite_routes', {});
    return userFavorites[currentUser.email.toLowerCase()] || [];
  }

  public toggleFavoriteRoute(fromCode: string, toCode: string, fromName: string, toName: string): boolean {
    const currentUser = this.getCurrentUser();
    const fromClean = fromCode.toUpperCase().trim();
    const toClean = toCode.toUpperCase().trim();
    
    if (currentUser) {
      const userFavorites = this.get<Record<string, any[]>>('user_favorite_routes', {});
      const email = currentUser.email.toLowerCase();
      let list = userFavorites[email] || [];
      
      const exists = list.some(r => r.from === fromClean && r.to === toClean);
      if (exists) {
        list = list.filter(r => !(r.from === fromClean && r.to === toClean));
        userFavorites[email] = list;
        this.set('user_favorite_routes', userFavorites);
        this.triggerPushNotification('Favorites Sync', `Removed Route ${fromClean} ➔ ${toClean} from your saved profile lists.`);
        return false;
      } else {
        list.push({ from: fromClean, to: toClean, fromName, toName, savedAt: new Date().toISOString() });
        userFavorites[email] = list;
        this.set('user_favorite_routes', userFavorites);
        this.triggerPushNotification('Favorites Sync', `Successfully pinned Route ${fromClean} ➔ ${toClean} to your profile favorites.`);
        return true;
      }
    } else {
      let list = this.get<any[]>('anonymous_favorite_routes', []);
      const exists = list.some(r => r.from === fromClean && r.to === toClean);
      if (exists) {
        list = list.filter(r => !(r.from === fromClean && r.to === toClean));
        this.set('anonymous_favorite_routes', list);
        return false;
      } else {
        list.push({ from: fromClean, to: toClean, fromName, toName, savedAt: new Date().toISOString() });
        this.set('anonymous_favorite_routes', list);
        return true;
      }
    }
  }

  public isFavoriteRoute(fromCode: string, toCode: string): boolean {
    const fromClean = fromCode.toUpperCase().trim();
    const toClean = toCode.toUpperCase().trim();
    const list = this.getFavoriteRoutes();
    return list.some(r => r.from === fromClean && r.to === toClean);
  }

  // ----------------------------------------------------
  // SUPPORT TICKETS (Simulated Cloud Firestore writing)
  // ----------------------------------------------------
  public submitSupportTicket(category: any, subject: string, message: string): SupportTicket {
    if (!subject || !message) {
      throw new Error('Failed to create ticket: Subject and message cannot be empty.');
    }
    const tickets = this.get<SupportTicket[]>('support_tickets', []);
    const newTicket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      category,
      subject,
      message,
      status: 'Open',
      createdAt: new Date().toISOString()
    };
    tickets.push(newTicket);
    this.set('support_tickets', tickets);
    
    this.triggerPushNotification('Support Desk', `Ticket registered! Our support specialists are evaluating your ticket #${newTicket.id}.`);
    return newTicket;
  }

  public getSupportTickets(): SupportTicket[] {
    return this.get<SupportTicket[]>('support_tickets', []);
  }

  // ----------------------------------------------------
  // FEEDBACKS (Simulated Cloud Firestore writing)
  // ----------------------------------------------------
  public submitFeedback(rating: number, text: string): FeedbackSubmission {
    if (rating < 1 || rating > 5) {
      throw new Error('Feedback rating must be between 1 and 5 stars.');
    }
    const feedbackList = this.get<FeedbackSubmission[]>('feedbacks', []);
    const newFeedback: FeedbackSubmission = {
      id: `feedback-${Date.now()}`,
      rating,
      text,
      createdAt: new Date().toISOString()
    };
    feedbackList.push(newFeedback);
    this.set('feedbacks', feedbackList);
    return newFeedback;
  }

  public getFeedbacks(): FeedbackSubmission[] {
    return this.get<FeedbackSubmission[]>('feedbacks', []);
  }

  // ----------------------------------------------------
  // SETTINGS & OFFLINE CACHE
  // ----------------------------------------------------
  public getOfflineCacheSize(): string {
    // Dynamically check size of localStorage
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += (localStorage[key].length + key.length) * 2; // Approximate bytes (16-bit characters)
      }
    }
    if (total === 0) return '0.00 KB';
    const kb = total / 1024;
    if (kb < 100) return `${kb.toFixed(2)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  }

  public clearOfflineCache(): void {
    // Clear only RailSetu prefix caches
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.STORAGE_KEY_PREFIX)) {
        // Retain user accounts and active sessions! Only clear search history, transit cache, and notifications
        if (!key.includes('users') && !key.includes('current_user') && !key.includes('user_favorite_')) {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    this.triggerPushNotification('System Cache', 'Offline cached timetables, PNR routes, and logs cleared successfully.');
  }

  // ----------------------------------------------------
  // APP VERSION CHECKER
  // ----------------------------------------------------
  public checkAppVersion(): { status: 'up_to_date' | 'update_available'; current: string; latest: string; releaseNotes: string } {
    return {
      status: 'up_to_date',
      current: '1.0.0',
      latest: '1.0.0',
      releaseNotes: 'Performance optimizations, Material 3 navigation panels, enhanced off-grid cache handlers.'
    };
  }

  // ----------------------------------------------------
  // PUSH NOTIFICATIONS (Firebase Cloud Messaging simulator)
  // ----------------------------------------------------
  public isNotificationsEnabled(): boolean {
    return this.get<boolean>('notifications_enabled', true);
  }

  public toggleNotificationsEnabled(enabled: boolean): void {
    this.set('notifications_enabled', enabled);
    if (enabled) {
      this.triggerPushNotification('Alerts Activated', 'You have successfully subscribed to real-time train updates via push channels.');
    }
  }

  public getNotifications(): PushNotification[] {
    return this.get<PushNotification[]>('notifications_history', []);
  }

  public triggerPushNotification(title: string, body: string): void {
    if (!this.isNotificationsEnabled()) return;

    const list = this.get<PushNotification[]>('notifications_history', []);
    const newNotify: PushNotification = {
      id: `notify-${Date.now()}`,
      title,
      body,
      receivedAt: new Date().toISOString(),
      read: false
    };

    list.unshift(newNotify);
    this.set('notifications_history', list.slice(0, 50)); // limit to 50 logs

    // Fire browser native notification if allowed
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`RailSetu: ${title}`, { body });
      } catch (e) {
        // fall back gracefully
      }
    }

    // Trigger local state updates if registered
    if (this.onNotificationCallback) {
      this.onNotificationCallback(newNotify);
    }
  }

  private onNotificationCallback: ((n: PushNotification) => void) | null = null;
  
  public onNotification(callback: (n: PushNotification) => void) {
    this.onNotificationCallback = callback;
  }

  public clearNotifications(): void {
    this.set('notifications_history', []);
  }

  // ----------------------------------------------------
  // THEME (Dark Mode state manager)
  // ----------------------------------------------------
  public getTheme(): 'light' | 'dark' {
    return this.get<'light' | 'dark'>('theme_mode', 'light');
  }

  public setTheme(theme: 'light' | 'dark'): void {
    this.set('theme_mode', theme);
    // Apply class to body or HTML for standard Tailwind scoping if desired
    const element = document.documentElement;
    if (theme === 'dark') {
      element.classList.add('dark');
    } else {
      element.classList.remove('dark');
    }
  }
}

export const localDbService = new LocalDbService();
