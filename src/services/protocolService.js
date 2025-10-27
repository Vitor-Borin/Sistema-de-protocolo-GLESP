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
      // Gerar número sequencial do protocolo
      const protocolNumber = await this.generateNextProtocolNumber();
      
      const docRef = await addDoc(collection(db, this.COLLECTION), {
        ...protocolData,
        numero_protocolo: protocolNumber,
        criado_por: userId,
        criado_em: serverTimestamp(),
        status: 'ativo'
      });
      return docRef.id;
    } catch (error) {
      // Erro silencioso para otimização
      throw error;
    }
  }

  // Gerar próximo número de protocolo sequencial
  static async generateNextProtocolNumber() {
    try {
      const currentYear = new Date().getFullYear();
      const yearPrefix = `GLESP-${currentYear}`;
      
      // Buscar o último protocolo do ano atual
      const q = query(
        collection(db, this.COLLECTION),
        where('numero_protocolo', '>=', yearPrefix),
        where('numero_protocolo', '<', `GLESP-${currentYear + 1}`),
        orderBy('numero_protocolo', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Primeiro protocolo do ano
        return `${yearPrefix}-001`;
      }
      
      // Extrair o número do último protocolo
      const lastProtocol = querySnapshot.docs[0].data();
      const lastNumber = lastProtocol.numero_protocolo;
      const lastSequence = parseInt(lastNumber.split('-')[2]) || 0;
      
      // Gerar próximo número sequencial
      const nextSequence = lastSequence + 1;
      const paddedSequence = String(nextSequence).padStart(3, '0');
      
      return `${yearPrefix}-${paddedSequence}`;
      
    } catch (error) {
      // Erro silencioso para otimização
      // Fallback: usar timestamp
      const timestamp = Date.now().toString().slice(-6);
      return `GLESP-${new Date().getFullYear()}-${timestamp}`;
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
      // Erro silencioso para otimização
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
      // Erro silencioso para otimização
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
      // Erro silencioso para otimização
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
      // Erro silencioso para otimização
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
      // Erro silencioso para otimização
      throw error;
    }
  }

  // Deletar protocolo permanentemente
  static async deleteProtocol(protocolId) {
    try {
      const protocolRef = doc(db, this.COLLECTION, protocolId);
      await deleteDoc(protocolRef);
      return true;
    } catch (error) {
      // Erro silencioso para otimização
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
      // Erro silencioso para otimização
      throw error;
    }
  }
}

export default ProtocolService;
