import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAndFge5ppRtUjmjbDK2xMn1EAJHNih1E8",
  authDomain: "lost-found-48715.firebaseapp.com",
  projectId: "lost-found-48715",
  storageBucket: "lost-found-48715.firebasestorage.app",
  messagingSenderId: "487878326999",
  appId: "1:487878326999:web:fd946d5aabd1715b868e92",
  measurementId: "G-KGQZNDEJRG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Entity helper functions
const createEntityHandler = (collectionName) => ({
  async list(orderByField = null) {
    const collectionRef = collection(db, collectionName);
    let q = collectionRef;
    
    if (orderByField) {
      const direction = orderByField.startsWith('-') ? 'desc' : 'asc';
      const field = orderByField.replace(/^-/, '');
      q = query(collectionRef, orderBy(field, direction));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async filter(filters = {}, orderByField = null) {
    const collectionRef = collection(db, collectionName);
    let q = collectionRef;
    
    const filterEntries = Object.entries(filters);
    if (filterEntries.length > 0) {
      const [firstKey, firstValue] = filterEntries[0];
      q = query(q, where(firstKey, '==', firstValue));
      
      for (let i = 1; i < filterEntries.length; i++) {
        const [key, value] = filterEntries[i];
        q = query(q, where(key, '==', value));
      }
    }
    
    if (orderByField) {
      const direction = orderByField.startsWith('-') ? 'desc' : 'asc';
      const field = orderByField.replace(/^-/, '');
      q = query(q, orderBy(field, direction));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async get(id) {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  },

  async create(data) {
    const collectionRef = collection(db, collectionName);
    const user = auth.currentUser;
    const docRef = await addDoc(collectionRef, {
      ...data,
      created_by: user?.email || '',
      created_date: new Date().toISOString(),
    });
    return { id: docRef.id, ...data };
  },

  async update(id, data) {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updated_date: new Date().toISOString(),
    });
    return { id, ...data };
  },

  async delete(id) {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  }
});

// Auth helper
const authHelper = {
  async me() {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    return {
      email: user.email,
      full_name: user.displayName || '',
      role: user.role || 'user'
    };
  },

  async isAuthenticated() {
    return !!auth.currentUser;
  },

  async login() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  },

  async logout() {
    await signOut(auth);
  },

  async redirectToLogin(redirectUrl) {
    await this.login();
    window.location.href = redirectUrl;
  },

  async updateMe(data) {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, data);
    return { ...user, ...data };
  },

  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
};

// Storage helper
const storageHelper = {
  async uploadFile({ file }) {
    const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return { file_url: url };
  }
};

// LLM Integration - calls production API endpoint
const llmHelper = {
  async InvokeLLM({ prompt, file_urls = [], response_json_schema = null, context = null }) {
    try {
      const requestBody = {
        prompt,
        context: context || undefined,
        response_json_schema: response_json_schema || undefined
      };

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!data.success) {
        // Handle error with fallback
        console.error('AI API Error:', data.error, data.code);
        
        // Return fallback response for structured schema
        if (response_json_schema) {
          return {
            locations: ['Library', 'Cafeteria', 'Student Center'],
            tips: ['Check lost and found', 'Ask security', 'Post on social media'],
            category: 'electronics',
            _fallback: true,
            _error: data.fallback || 'AI service temporarily unavailable'
          };
        }
        
        // Return fallback text response
        return data.fallback || 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.';
      }

      // Handle structured response
      if (response_json_schema && data.data) {
        return data.data;
      }

      // Return text response
      return data.text || 'No response generated';

    } catch (error) {
      console.error('AI API request failed:', error);
      
      // Fallback for network errors
      if (response_json_schema) {
        return {
          locations: ['Library', 'Cafeteria', 'Student Center'],
          tips: ['Check lost and found', 'Ask security', 'Post on social media'],
          category: 'electronics',
          _fallback: true,
          _error: 'Network error - using offline mode'
        };
      }
      
      return 'I apologize, but I\'m having trouble connecting right now. Please check your internet connection and try again.';
    }
  },

  async SendEmail({ to, subject, body }) {
    // Mock email sending - in production, integrate with email service
    console.log('Email (mock):', { to, subject, body });
    return { success: true };
  }
};

// Export API
export const firebaseClient = {
  auth: authHelper,
  entities: {
    Item: createEntityHandler('items'),
    Message: createEntityHandler('messages'),
    User: createEntityHandler('users')
  },
  integrations: {
    Core: {
      UploadFile: storageHelper.uploadFile.bind(storageHelper),
      InvokeLLM: llmHelper.InvokeLLM.bind(llmHelper),
      SendEmail: llmHelper.SendEmail.bind(llmHelper)
    }
  }
};

// For backward compatibility
export const base44 = firebaseClient;
export default firebaseClient;