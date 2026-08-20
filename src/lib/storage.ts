import {
  db,
  isFirebaseConfigured,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  setDoc,
} from './firebase';
import type { QueryConstraint } from './firebase';

// BroadcastChannel for cross-tab sync in localStorage mode
const channel = typeof BroadcastChannel !== 'undefined'
  ? new BroadcastChannel('cafe-vitus-sync')
  : null;

type StorageListener = (data: any[]) => void;

const localListeners: Map<string, Set<StorageListener>> = new Map();

// Notify other tabs about data changes
function broadcastChange(collectionName: string) {
  if (channel) {
    channel.postMessage({ type: 'data-change', collection: collectionName });
  }
}

// Listen for changes from other tabs
if (channel) {
  channel.onmessage = (event) => {
    if (event.data.type === 'data-change') {
      const listeners = localListeners.get(event.data.collection);
      if (listeners) {
        const data = getLocalCollection(event.data.collection);
        listeners.forEach((listener) => listener(data));
      }
    }
  };
}

// LocalStorage helpers
function getLocalCollection(name: string): any[] {
  try {
    const data = localStorage.getItem(`cv_${name}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setLocalCollection(name: string, data: any[]) {
  try {
    localStorage.setItem(`cv_${name}`, JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Unified Storage API
export const storage = {
  // Get all documents from a collection
  async getAll<T>(collectionName: string, constraints?: QueryConstraint[]): Promise<T[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = constraints
          ? query(collection(db, collectionName), ...constraints)
          : query(collection(db, collectionName));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T));
      } catch (error) {
        console.warn(`Firebase getAll failed for ${collectionName}, using localStorage:`, error);
        return getLocalCollection(collectionName) as T[];
      }
    }
    return getLocalCollection(collectionName) as T[];
  },

  // Get single document
  async get<T>(collectionName: string, id: string): Promise<T | null> {
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, collectionName, id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          return { id: snapshot.id, ...snapshot.data() } as T;
        }
        return null;
      } catch (error) {
        console.warn(`Firebase get failed for ${collectionName}/${id}, using localStorage:`, error);
        const items = getLocalCollection(collectionName);
        return (items.find((item: any) => item.id === id) as T) || null;
      }
    }
    const items = getLocalCollection(collectionName);
    return (items.find((item: any) => item.id === id) as T) || null;
  },

  // Add document
  async add<T extends { id?: string }>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
    const now = Date.now();
    const docData = { ...data, createdAt: now, updatedAt: now };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, collectionName), docData);
        // Also save to localStorage as backup
        const items = getLocalCollection(collectionName);
        items.push({ ...docData, id: docRef.id });
        setLocalCollection(collectionName, items);
        return docRef.id;
      } catch (error) {
        console.warn(`Firebase add failed for ${collectionName}, using localStorage:`, error);
      }
    }

    // localStorage fallback
    const id = generateId();
    const items = getLocalCollection(collectionName);
    items.push({ ...docData, id });
    setLocalCollection(collectionName, items);
    broadcastChange(collectionName);
    
    // Notify local listeners
    const listeners = localListeners.get(collectionName);
    if (listeners) {
      listeners.forEach((listener) => listener(items));
    }
    
    return id;
  },

  // Update document
  async update(collectionName: string, id: string, data: Record<string, any>): Promise<void> {
    const updateData = { ...data, updatedAt: Date.now() };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, updateData);
        // Also update localStorage backup
        const items = getLocalCollection(collectionName);
        const index = items.findIndex((item: any) => item.id === id);
        if (index !== -1) {
          items[index] = { ...items[index], ...updateData };
          setLocalCollection(collectionName, items);
        }
        return;
      } catch (error) {
        console.warn(`Firebase update failed for ${collectionName}/${id}, using localStorage:`, error);
      }
    }

    // localStorage fallback
    const items = getLocalCollection(collectionName);
    const index = items.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updateData };
      setLocalCollection(collectionName, items);
      broadcastChange(collectionName);
      
      const listeners = localListeners.get(collectionName);
      if (listeners) {
        listeners.forEach((listener) => listener(items));
      }
    }
  },

  // Delete document
  async remove(collectionName: string, id: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, collectionName, id));
        const items = getLocalCollection(collectionName).filter((item: any) => item.id !== id);
        setLocalCollection(collectionName, items);
        return;
      } catch (error) {
        console.warn(`Firebase delete failed for ${collectionName}/${id}, using localStorage:`, error);
      }
    }

    const items = getLocalCollection(collectionName).filter((item: any) => item.id !== id);
    setLocalCollection(collectionName, items);
    broadcastChange(collectionName);
    
    const listeners = localListeners.get(collectionName);
    if (listeners) {
      listeners.forEach((listener) => listener(items));
    }
  },

  // Set document with specific ID
  async set<T>(collectionName: string, id: string, data: T): Promise<void> {
    const docData = { ...data, updatedAt: Date.now() };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, collectionName, id), docData);
        const items = getLocalCollection(collectionName);
        const index = items.findIndex((item: any) => item.id === id);
        if (index !== -1) {
          items[index] = { ...docData, id };
        } else {
          items.push({ ...docData, id });
        }
        setLocalCollection(collectionName, items);
        return;
      } catch (error) {
        console.warn(`Firebase set failed, using localStorage:`, error);
      }
    }

    const items = getLocalCollection(collectionName);
    const index = items.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      items[index] = { ...docData, id };
    } else {
      items.push({ ...docData, id });
    }
    setLocalCollection(collectionName, items);
    broadcastChange(collectionName);
    
    const lsnrs = localListeners.get(collectionName);
    if (lsnrs) {
      lsnrs.forEach((listener) => listener(items));
    }
  },

  // Real-time subscription
  subscribe<T>(collectionName: string, callback: (data: T[]) => void, constraints?: QueryConstraint[]): () => void {
    if (isFirebaseConfigured && db) {
      try {
        const q = constraints
          ? query(collection(db, collectionName), ...constraints)
          : query(collection(db, collectionName));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T));
          callback(data);
          // Sync to localStorage
          setLocalCollection(collectionName, data);
        }, (error) => {
          console.warn(`Firebase subscription failed for ${collectionName}:`, error);
          // Fallback to localStorage
          callback(getLocalCollection(collectionName) as T[]);
        });
        
        return unsubscribe;
      } catch (error) {
        console.warn(`Firebase subscribe failed for ${collectionName}, using localStorage:`, error);
      }
    }

    // localStorage fallback with polling and BroadcastChannel
    const listener: StorageListener = (data) => callback(data as T[]);
    
    if (!localListeners.has(collectionName)) {
      localListeners.set(collectionName, new Set());
    }
    localListeners.get(collectionName)!.add(listener);
    
    // Initial data
    callback(getLocalCollection(collectionName) as T[]);
    
    // Return unsubscribe function
    return () => {
      localListeners.get(collectionName)?.delete(listener);
    };
  },

  // Check if database has been seeded
  async isSeeded(): Promise<boolean> {
    const items = await this.getAll('menu');
    return items.length > 0;
  },
};
