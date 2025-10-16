// Serviço de Usuários GLESP
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';

class UserService {
  static COLLECTION = 'usuarios_glesp';

  // Criar usuário (apenas administradores)
  static async createUser(userData) {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION), {
        ...userData,
        ativo: true,
        criado_em: new Date(),
        ultimo_login: null
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  // Buscar usuário por email
  static async getUserByEmail(email) {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('email', '==', email)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;
      
      const userDoc = querySnapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }

  // Listar todos os usuários (apenas administradores)
  static async getAllUsers() {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        orderBy('criado_em', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw error;
    }
  }

  // Atualizar usuário
  static async updateUser(userId, userData) {
    try {
      const userRef = doc(db, this.COLLECTION, userId);
      await updateDoc(userRef, {
        ...userData,
        atualizado_em: new Date()
      });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  // Desativar usuário
  static async deactivateUser(userId) {
    try {
      const userRef = doc(db, this.COLLECTION, userId);
      await updateDoc(userRef, {
        ativo: false,
        desativado_em: new Date()
      });
      return true;
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      throw error;
    }
  }

  // Atualizar último login
  static async updateLastLogin(userId) {
    try {
      const userRef = doc(db, this.COLLECTION, userId);
      await updateDoc(userRef, {
        ultimo_login: new Date()
      });
    } catch (error) {
      console.error('Erro ao atualizar último login:', error);
    }
  }

  // Verificar se é administrador
  static async isAdmin(userId) {
    try {
      const userRef = doc(db, this.COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return userData.perfil === 'administrador';
      }
      return false;
    } catch (error) {
      console.error('Erro ao verificar perfil:', error);
      return false;
    }
  }
}

export default UserService;
