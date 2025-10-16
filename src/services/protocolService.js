// Serviço de Protocolos GLESP
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
  orderBy,
  limit,
  startAfter,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

class ProtocolService {
  static COLLECTION = 'protocolos_glesp';

  // Criar protocolo
  static async createProtocol(protocolData, userId) {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION), {
        ...protocolData,
        criado_por: userId,
        criado_em: serverTimestamp(),
        status: 'ativo'
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar protocolo:', error);
      throw error;
    }
  }

  // Buscar protocolos por loja
  static async getProtocolsByShop(shopNumbers) {
    try {
      const shopNumbersArray = Array.isArray(shopNumbers) ? shopNumbers : [shopNumbers];
      
      const q = query(
        collection(db, this.COLLECTION),
        where('numero_loja', 'in', shopNumbersArray),
        orderBy('criado_em', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar protocolos:', error);
      throw error;
    }
  }

  // Buscar todos os protocolos (paginado)
  static async getAllProtocols(pageSize = 10, lastDoc = null) {
    try {
      let q = query(
        collection(db, this.COLLECTION),
        orderBy('criado_em', 'desc'),
        limit(pageSize)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      return {
        protocols: querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })),
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
      };
    } catch (error) {
      console.error('Erro ao buscar protocolos:', error);
      throw error;
    }
  }

  // Buscar protocolo por ID
  static async getProtocolById(protocolId) {
    try {
      const docRef = doc(db, this.COLLECTION, protocolId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar protocolo:', error);
      throw error;
    }
  }

  // Atualizar protocolo
  static async updateProtocol(protocolId, protocolData, userId) {
    try {
      const protocolRef = doc(db, this.COLLECTION, protocolId);
      await updateDoc(protocolRef, {
        ...protocolData,
        atualizado_por: userId,
        atualizado_em: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar protocolo:', error);
      throw error;
    }
  }

  // Arquivar protocolo
  static async archiveProtocol(protocolId, userId) {
    try {
      const protocolRef = doc(db, this.COLLECTION, protocolId);
      await updateDoc(protocolRef, {
        status: 'arquivado',
        arquivado_por: userId,
        arquivado_em: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erro ao arquivar protocolo:', error);
      throw error;
    }
  }

  // Estatísticas
  static async getStats() {
    try {
      const q = query(collection(db, this.COLLECTION));
      const querySnapshot = await getDocs(q);
      
      const protocols = querySnapshot.docs.map(doc => doc.data());
      
      // Protocolos hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const protocolsToday = protocols.filter(protocol => {
        const protocolDate = protocol.criado_em?.toDate();
        if (!protocolDate) return false;
        protocolDate.setHours(0, 0, 0, 0);
        return protocolDate.getTime() === today.getTime();
      }).length;

      return {
        total: protocols.length,
        hoje: protocolsToday,
        ativos: protocols.filter(p => p.status === 'ativo').length,
        arquivados: protocols.filter(p => p.status === 'arquivado').length
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }
}

export default ProtocolService;
