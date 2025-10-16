// Serviço de Autenticação GLESP
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import UserService from './userService';

class AuthService {
  // Login com email e senha
  static async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Buscar dados do usuário no Firestore
      const userData = await UserService.getUserByEmail(email);
      
      if (!userData || !userData.ativo) {
        await this.logout();
        throw new Error('Usuário não encontrado ou inativo');
      }

      // Atualizar último login
      await UserService.updateLastLogin(userData.id);

      return {
        uid: user.uid,
        email: user.email,
        ...userData
      };
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  // Logout
  static async logout() {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  }

  // Verificar estado de autenticação
  static onAuthStateChange(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Buscar dados completos do usuário
          const userData = await UserService.getUserByEmail(user.email);
          callback({
            uid: user.uid,
            email: user.email,
            ...userData
          });
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  // Verificar se usuário é administrador
  static async isAdmin(userId) {
    try {
      return await UserService.isAdmin(userId);
    } catch (error) {
      console.error('Erro ao verificar perfil:', error);
      return false;
    }
  }

  // Atualizar perfil do usuário
  static async updateProfile(userId, profileData) {
    try {
      return await UserService.updateUser(userId, profileData);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  }
}

export default AuthService;
